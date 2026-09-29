import { useState, useRef, useEffect } from 'react';
import {
  Pencil,
  Trash2,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { formatIDR } from '../../../services/api';
import { Modal, FormField, Input, Select, Textarea, Button, Alert, ConfirmDialog } from '../../../components';

export function EditProductModal({
  product,
  categories = [],
  isOpen,
  onClose,
  onSave,
  onDelete
}) {
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: '',
    customKategori: '',
    harga: 0,
    jumlah_stok: 0,
    jumlahStok: 0,
    deskripsi: '',
    gambar: ''
  });

  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (product) {
      const initStock = Number(product.jumlah_stok !== undefined ? product.jumlah_stok : product.jumlahStok) || 0;
      setFormData({
        nama_produk: product.nama_produk || '',
        kategori: product.kategori || 'ketsai original',
        customKategori: '',
        harga: product.harga || 0,
        jumlah_stok: initStock,
        jumlahStok: initStock,
        deskripsi: product.deskripsi || '',
        gambar: product.gambar || ''
      });
      setIsNewCategory(false);
      setNewImageFile(null);
      setNewImagePreview(null);
      setShowDeleteConfirm(false);
      setErrorMessage(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Format file tidak didukung. Harap pilih gambar (PNG, JPG, WEBP).');
        return;
      }
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const nama = formData.nama_produk.trim();
    if (!nama) {
      setErrorMessage('Nama produk kuliner wajib diisi.');
      return;
    }

    if (Number(formData.harga) < 0 || isNaN(Number(formData.harga))) {
      setErrorMessage('Harga produk harus angka valid non-negatif.');
      return;
    }

    const currentInputStock = formData.jumlah_stok !== undefined ? formData.jumlah_stok : formData.jumlahStok;
    if (Number(currentInputStock) < 0 || isNaN(Number(currentInputStock))) {
      setErrorMessage('Jumlah stok harus angka valid non-negatif.');
      return;
    }

    const finalCategory = isNewCategory
      ? formData.customKategori.trim() || 'ketsai original'
      : formData.kategori;

    try {
      setIsSaving(true);
      const stockNumber = Number(currentInputStock);
      await onSave({
        id: product.id,
        nama_produk: nama,
        kategori: finalCategory,
        harga: Number(formData.harga),
        jumlah_stok: stockNumber,
        jumlahStok: stockNumber,
        deskripsi: formData.deskripsi.trim(),
        currentGambar: formData.gambar,
        newImageFile
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan perubahan produk.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(product.id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus produk.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const modalFooter = !showDeleteConfirm ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
      <Button
        variant="danger-outline"
        size="sm"
        disabled={isSaving || isDeleting}
        icon={<Trash2 size={14} />}
        onClick={() => setShowDeleteConfirm(true)}
      >
        Hapus Produk
      </Button>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isSaving || isDeleting}
          onClick={onClose}
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="edit-product-form"
          variant="primary"
          size="sm"
          isLoading={isSaving}
          icon={<CheckCircle2 size={15} />}
        >
          Simpan Perubahan
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Koreksi & Edit Menu Produk"
      subtitle={`ID #${product.id} • ${product.kategori}`}
      icon={<Pencil size={18} />}
      size="md"
      isLoading={isSaving || isDeleting}
      footer={modalFooter}
    >
      {errorMessage && (
        <Alert type="error" message={errorMessage} style={{ marginBottom: '18px' }} />
      )}

      {showDeleteConfirm ? (
        <ConfirmDialog
          isOpen={true}
          title={`Hapus Produk "${product.nama_produk}"?`}
          description="Tindakan ini akan menghapus produk beserta catatan stok terkait dan file gambar fisik secara permanen."
          confirmLabel="Ya, Hapus Sekarang"
          cancelLabel="Batal"
          isDestructive={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      ) : (
        <form id="edit-product-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Nama Produk */}
          <FormField
            label="Nama Produk Kuliner"
            required
          >
            <Input
              type="text"
              placeholder="Contoh: Seoul Lychee Yoghurt"
              value={formData.nama_produk}
              onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
              required
            />
          </FormField>

          {/* 2. Kategori Produk */}
          <FormField
            label="Kategori Produk"
            required
            icon={<Layers size={14} style={{ color: 'var(--accent-vermilion)' }} />}
            action={(
              <button
                type="button"
                onClick={() => setIsNewCategory(!isNewCategory)}
                style={{ fontSize: '11px', color: 'var(--accent-vermilion)', fontWeight: 600, textDecoration: 'underline' }}
              >
                {isNewCategory ? '← Pilih Kategori Yang Ada' : '+ Kategori Baru'}
              </button>
            )}
          >
            {isNewCategory ? (
              <Input
                type="text"
                placeholder="Ketik nama kategori baru..."
                value={formData.customKategori}
                onChange={(e) => setFormData({ ...formData, customKategori: e.target.value })}
                required
              />
            ) : (
              <Select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                options={categories.filter((c) => c && c !== 'Semua').map((c) => ({ value: c, label: c.toUpperCase() }))}
                required
              />
            )}
          </FormField>

          {/* 3. Harga Satuan & Koreksi Stok */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Harga Satuan (Rp)" required helperText={formatIDR(formData.harga || 0)}>
              <Input
                type="number"
                min="0"
                step="500"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Koreksi Stok (Porsi)" required helperText="Stok saat ini di sistem">
              <Input
                type="number"
                min="0"
                value={formData.jumlah_stok !== undefined ? formData.jumlah_stok : formData.jumlahStok}
                onChange={(e) => setFormData({ ...formData, jumlah_stok: e.target.value, jumlahStok: e.target.value })}
                required
              />
            </FormField>
          </div>

          {/* 4. Deskripsi Menu */}
          <FormField label="Deskripsi Menu">
            <Textarea
              rows={2}
              placeholder="Keterangan singkat cita rasa, bahan baku utama, atau cara penyajian..."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </FormField>

          {/* 5. Foto / Gambar Produk */}
          <FormField label="Foto Gambar Menu" icon={<ImageIcon size={14} style={{ color: 'var(--accent-vermilion)' }} />}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img
                  src={newImagePreview || formData.gambar || '/src/assets/ketsaiOriginal/dimsum.png'}
                  alt={formData.nama_produk}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('/src/assets')) {
                      e.currentTarget.src = `/src${formData.gambar}`;
                    }
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<UploadCloud size={14} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newImageFile ? 'Ganti File Lain' : 'Unggah Foto Baru'}
                  </Button>

                  {newImageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewImageFile(null);
                        setNewImagePreview(null);
                      }}
                      style={{ fontSize: '11px', color: 'var(--accent-vermilion)', fontWeight: 600, padding: '4px' }}
                    >
                      Batal Ganti
                    </button>
                  )}
                </div>

                {newImageFile && (
                  <div style={{ fontSize: '11px', color: 'var(--status-success-text)', fontWeight: 600, marginTop: '6px' }}>
                    Foto baru dipilih: {newImageFile.name}
                  </div>
                )}
              </div>
            </div>
          </FormField>
        </form>
      )}
    </Modal>
  );
}
