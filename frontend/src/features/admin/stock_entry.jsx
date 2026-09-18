import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  getProducts,
  getProductCategories,
  addStockEntry,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  ensureCategoryDirectory
} from '../../services/api';
import { useAuth } from '../../context/auth_context';
import { useDebounce } from '../../hooks';
import {
  StockMetrics,
  StockForm,
  StockProductGrid,
  EditProductModal
} from './components';

/**
 * Konversi nama kategori menjadi nama folder camelCase
 */
function getPredictedFolderName(categoryName) {
  if (!categoryName || typeof categoryName !== 'string') return 'ketsaiOriginal';
  const clean = categoryName.trim();
  const lower = clean.toLowerCase();
  if (lower === 'ketsai original' || lower === 'ketsai' || lower === 'ketsaioriginal') return 'ketsaiOriginal';
  if (lower === 'frozen food' || lower === 'frozen' || lower === 'frozenfood') return 'frozenFood';
  if (lower === 'ice cream' || lower === 'icecream') return 'iceCream';

  const words = clean.replace(/[^a-zA-Z0-9\s_-]/g, '').split(/[\s_-]+/).filter(Boolean);
  if (words.length === 0) return 'umum';
  return words
    .map((word, index) => {
      const w = word.toLowerCase();
      if (index === 0) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join('');
}

export function StockEntry({ setPage }) {
  const { user } = useAuth();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // Core Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Form State (Berjenjang)
  // Step 1: Kategori
  const [categoryMode, setCategoryMode] = useState('existing'); // 'existing' | 'new'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Step 2: Produk
  const [productMode, setProductMode] = useState('existing'); // 'existing' | 'new'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newProductData, setNewProductData] = useState({
    nama_produk: '',
    harga: '',
    deskripsi: '',
    gambar: ''
  });

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadForExisting, setShowUploadForExisting] = useState(false);

  // Step 3: Jumlah Stok
  const [quantityAdded, setQuantityAdded] = useState(10);

  // Product Cards Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [stockLevelFilter, setStockLevelFilter] = useState('all'); // 'all' | 'low' | 'out' | 'safe'

  // Edit & Delete Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async (options = {}) => {
    try {
      setIsFetching(true);
      const [prodRes, catRes] = await Promise.all([
        getProducts({}, options),
        getProductCategories(options).catch(() => ({ success: false }))
      ]);

      let loadedProducts = [];
      if (prodRes.success && prodRes.data) {
        loadedProducts = prodRes.data;
        setProducts(loadedProducts);
      }

      let loadedCategories = [];
      if (catRes.success && Array.isArray(catRes.data)) {
        loadedCategories = catRes.data.filter((c) => c && c !== 'Semua');
      } else if (loadedProducts.length > 0) {
        loadedCategories = Array.from(
          new Set(loadedProducts.map((p) => p.kategori).filter(Boolean))
        );
      }

      setCategories(loadedCategories);

      if (loadedCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(loadedCategories[0]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Gagal mengambil data produk:', err);
        setStatusFeedback({
          type: 'error',
          message: 'Gagal memuat katalog produk dari database server.'
        });
      }
    } finally {
      setIsFetching(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchData]);

  // Filter produk berdasarkan kategori yang sedang dipilih di form
  const productsInSelectedCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter(
      (p) => (p.kategori || '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  // Otomatis pilih produk pertama dalam kategori yang dipilih jika belum ada
  useEffect(() => {
    if (categoryMode === 'existing' && productMode === 'existing') {
      if (productsInSelectedCategory.length > 0) {
        const isCurrentSelectedValid = productsInSelectedCategory.some(
          (p) => String(p.id) === String(selectedProductId)
        );
        if (!isCurrentSelectedValid) {
          setSelectedProductId(String(productsInSelectedCategory[0].id));
        }
      } else {
        setSelectedProductId('');
      }
    }
  }, [selectedCategory, productsInSelectedCategory, categoryMode, productMode, selectedProductId]);

  // Handler Ganti Kategori
  const handleCategoryChange = (valOrEvent) => {
    const cat = valOrEvent?.target ? valOrEvent.target.value : valOrEvent;
    setSelectedCategory(cat);
    setShowUploadForExisting(false);
    handleClearImage();
  };

  // Folder assets yang ditargetkan untuk upload gambar
  const activeCategoryFolder = useMemo(() => {
    const targetCat = categoryMode === 'new' ? newCategoryName : selectedCategory;
    return getPredictedFolderName(targetCat);
  }, [categoryMode, newCategoryName, selectedCategory]);

  // Handler Upload Gambar
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Harap unggah gambar bertipe PNG, JPG, JPEG, atau WEBP.');
      return;
    }

    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Harap unggah gambar bertipe PNG, JPG, JPEG, atau WEBP.');
      return;
    }

    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  // Debounce search query untuk filter grid produk
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Filter Card Produk
  const filteredProducts = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchSearch =
        q === '' ||
        (item.nama_produk || '').toLowerCase().includes(q) ||
        (item.kategori || '').toLowerCase().includes(q);

      const matchCategory =
        filterCategory === 'Semua' ||
        (item.kategori || '').toLowerCase() === filterCategory.toLowerCase();

      let matchStock = true;
      if (stockLevelFilter === 'safe') matchStock = item.jumlahStok > 5;
      else if (stockLevelFilter === 'low') matchStock = item.jumlahStok > 0 && item.jumlahStok <= 5;
      else if (stockLevelFilter === 'out') matchStock = item.jumlahStok <= 0;

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, debouncedSearchQuery, filterCategory, stockLevelFilter]);

  // Statistik Stok
  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => p.jumlahStok <= 0).length;
    const lowStock = products.filter((p) => p.jumlahStok > 0 && p.jumlahStok <= 5).length;
    const safeStock = products.filter((p) => p.jumlahStok > 5).length;
    return { total, outOfStock, lowStock, safeStock };
  }, [products]);

  // Detail produk eksisting yang sedang dipilih pada form
  const selectedProduct = products.find((p) => String(p.id) === String(selectedProductId));

  // Quick Action dari Card: Pilih produk langsung masuk ke form
  const handleQuickSelectProduct = (prod) => {
    setCategoryMode('existing');
    setSelectedCategory(prod.kategori || '');
    setProductMode('existing');
    setSelectedProductId(String(prod.id));
    setShowUploadForExisting(false);
    handleClearImage();

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handlers Edit & Hapus Produk via Popup Form
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProductEdit = async (editPayload) => {
    const { id, nama_produk, kategori, harga, jumlahStok, deskripsi, currentGambar, newImageFile } = editPayload;
    let finalImagePath = currentGambar;

    if (newImageFile) {
      const uploadRes = await uploadProductImage(newImageFile, kategori, nama_produk);
      if (uploadRes.success && uploadRes.data?.filePath) {
        finalImagePath = uploadRes.data.filePath;
      } else {
        throw new Error(uploadRes.message || 'Gagal mengunggah foto baru.');
      }
    }

    const updateRes = await updateProduct(id, {
      nama_produk,
      kategori,
      harga,
      jumlahStok,
      deskripsi,
      gambar: finalImagePath
    });

    if (updateRes.success) {
      setStatusFeedback({
        type: 'success',
        message: `Produk "${nama_produk}" berhasil diperbarui!`
      });
      await fetchData();
    } else {
      throw new Error(updateRes.message || 'Gagal memperbarui produk.');
    }
  };

  const handleDeleteProductConfirm = async (productId) => {
    const delRes = await deleteProduct(productId);
    if (delRes.success) {
      setStatusFeedback({
        type: 'success',
        message: 'Produk berhasil dihapus dari sistem dan katalog.'
      });
      if (String(selectedProductId) === String(productId)) {
        setSelectedProductId('');
      }
      await fetchData();
    } else {
      throw new Error(delRes.message || 'Gagal menghapus produk.');
    }
  };

  // Submit Handler Form Input Stok
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusFeedback(null);

    const qty = Number(quantityAdded);
    if (isNaN(qty) || qty <= 0) {
      setStatusFeedback({
        type: 'error',
        message: 'Masukkan jumlah penambahan stok yang valid (minimal 1 unit).'
      });
      return;
    }

    let finalCategory = '';
    if (categoryMode === 'new') {
      finalCategory = newCategoryName.trim();
      if (!finalCategory) {
        setStatusFeedback({
          type: 'error',
          message: 'Nama kategori baru wajib diisi.'
        });
        return;
      }
    } else {
      finalCategory = selectedCategory;
      if (!finalCategory) {
        setStatusFeedback({
          type: 'error',
          message: 'Pilih salah satu kategori produk yang ada.'
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      try {
        await ensureCategoryDirectory(finalCategory);
      } catch (dirErr) {
        console.warn('Pastikan direktori kategori:', dirErr.message);
      }

      let uploadedImagePath = null;
      if (imageFile) {
        const targetImageName =
          productMode === 'new' || categoryMode === 'new'
            ? newProductData.nama_produk.trim()
            : selectedProduct?.nama_produk || '';
        const uploadRes = await uploadProductImage(imageFile, finalCategory, targetImageName);
        if (uploadRes.success && uploadRes.data?.filePath) {
          uploadedImagePath = uploadRes.data.filePath;
        } else {
          throw new Error(uploadRes.message || 'Gagal mengunggah foto produk.');
        }
      }

      let targetProductId = selectedProductId;
      let targetProductName = selectedProduct?.nama_produk || '';

      if (productMode === 'new' || categoryMode === 'new') {
        const namaBaru = newProductData.nama_produk.trim();
        const hargaBaru = Number(newProductData.harga);

        if (!namaBaru) {
          setStatusFeedback({
            type: 'error',
            message: 'Nama produk baru wajib diisi.'
          });
          setIsSubmitting(false);
          return;
        }

        if (isNaN(hargaBaru) || hargaBaru <= 0) {
          setStatusFeedback({
            type: 'error',
            message: 'Harga produk harus berupa angka positif.'
          });
          setIsSubmitting(false);
          return;
        }

        const finalGambar =
          uploadedImagePath ||
          newProductData.gambar?.trim() ||
          '/src/assets/ketsaiOriginal/dimsum.png';

        const createRes = await createProduct({
          nama_produk: namaBaru,
          harga: hargaBaru,
          deskripsi: newProductData.deskripsi?.trim() || null,
          gambar: finalGambar,
          kategori: finalCategory,
          jumlahStok: 0
        });

        if (!createRes.success || !createRes.data) {
          throw new Error(createRes.message || 'Gagal mendaftarkan produk baru.');
        }

        targetProductId = createRes.data.id;
        targetProductName = createRes.data.nama_produk;
      } else {
        if (uploadedImagePath && targetProductId) {
          await updateProduct(targetProductId, { gambar: uploadedImagePath });
        }
      }

      if (!targetProductId) {
        setStatusFeedback({
          type: 'error',
          message: 'Pilih produk yang ingin ditambahkan stoknya.'
        });
        setIsSubmitting(false);
        return;
      }

      const stockRes = await addStockEntry({
        product_id: Number(targetProductId),
        jumlah: qty,
        user_id: user?.id || 1,
        catatan: `Input stok masuk operasional (${qty} unit)`
      });

      if (!stockRes.success) {
        throw new Error(stockRes.message || 'Gagal mencatat mutasi penambahan stok.');
      }

      setStatusFeedback({
        type: 'success',
        message: `Berhasil mencatat ${qty} unit stok untuk "${targetProductName}".`
      });

      setQuantityAdded(10);
      handleClearImage();
      setShowUploadForExisting(false);

      if (productMode === 'new' || categoryMode === 'new') {
        setProductMode('existing');
        setCategoryMode('existing');
        setSelectedCategory(finalCategory);
        setNewProductData({ nama_produk: '', harga: '', deskripsi: '', gambar: '' });
        setNewCategoryName('');
      }

      await fetchData();
    } catch (err) {
      console.error('Error saat submit stok:', err);
      setStatusFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan sistem saat menyimpan data stok.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* PAGE HEADER */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, letterSpacing: '-0.02em' }}>
            Input Dan Edit Stok
          </h1>
        </div>

        <button
          onClick={() => setPage('admin-stock-logs')}
          className="zen-btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Riwayat Mutasi Lengkap →
        </button>
      </div>

      {/* METRIK STOK SUMMARY CARDS */}
      <StockMetrics stats={stats} />

      {/* DUAL WORKSPACE: FORMULIR BERJENJANG (KIRI) & INFORMASI KARTU STOK (KANAN) */}
      <div className="stock-entry-grid">
        {/* KOLOM KIRI: FORMULIR INPUT STOK BERJENJANG */}
        <StockForm
          formRef={formRef}
          fileInputRef={fileInputRef}
          user={user}
          setPage={setPage}
          categories={categories}
          selectedCategory={selectedCategory}
          categoryMode={categoryMode}
          setCategoryMode={setCategoryMode}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          handleCategoryChange={handleCategoryChange}
          activeCategoryFolder={activeCategoryFolder}
          productMode={productMode}
          setProductMode={setProductMode}
          selectedProductId={selectedProductId}
          setSelectedProductId={setSelectedProductId}
          productsInSelectedCategory={productsInSelectedCategory}
          selectedProduct={selectedProduct}
          showUploadForExisting={showUploadForExisting}
          setShowUploadForExisting={setShowUploadForExisting}
          newProductData={newProductData}
          setNewProductData={setNewProductData}
          imageFile={imageFile}
          imagePreviewUrl={imagePreviewUrl}
          isDragging={isDragging}
          handleFileSelect={handleFileSelect}
          handleClearImage={handleClearImage}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          quantityAdded={quantityAdded}
          setQuantityAdded={setQuantityAdded}
          isSubmitting={isSubmitting}
          statusFeedback={statusFeedback}
          handleSubmit={handleSubmit}
        />

        {/* KOLOM KANAN: INFORMASI STOK MASING-MASING PRODUK (CARD) */}
        <StockProductGrid
          products={products}
          filteredProducts={filteredProducts}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          stockLevelFilter={stockLevelFilter}
          setStockLevelFilter={setStockLevelFilter}
          isFetching={isFetching}
          selectedProductId={selectedProductId}
          productMode={productMode}
          handleQuickSelectProduct={handleQuickSelectProduct}
          onEditProduct={handleOpenEditModal}
        />
      </div>

      {/* MODAL POPUP EDIT & HAPUS PRODUK */}
      <EditProductModal
        isOpen={isEditModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={handleCloseEditModal}
        onSave={handleSaveProductEdit}
        onDelete={handleDeleteProductConfirm}
      />
    </div>
  );
}
