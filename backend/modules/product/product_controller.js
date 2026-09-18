const fs = require('fs');
const path = require('path');
const productService = require('./product_service');
const { sendSuccess, BadRequestError, ensureCategoryDirectory, getCategoryFolderName, toCamelCase } = require('../../utils');
const { httpStatusCodes, HTTP_STATUS } = require('../../constants');


class ProductController {
  async getAll(req, res) {
    const { search, kategori, limit } = req.query;
    const products = await productService.getAllProducts({ search, kategori, limit });
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Daftar produk berhasil diambil', products, {
      total: products.length
    });
  }

  async getBestSellers(req, res) {
    const { limit } = req.query;
    const bestSellers = await productService.getBestSellers(limit);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Daftar produk best seller berhasil diambil', bestSellers, {
      total: bestSellers.length
    });
  }

  async getCategories(req, res) {
    const categories = await productService.getCategories();
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Daftar kategori berhasil diambil', categories);
  }

  async ensureCategoryDir(req, res) {
    const { kategori } = req.body;
    if (!kategori || typeof kategori !== 'string') {
      throw new BadRequestError('Nama kategori wajib diisi.');
    }
    const info = ensureCategoryDirectory(kategori);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, `Direktori kategori "${kategori}" berhasil dipastikan`, info);
  }

  async uploadImage(req, res) {
    if (!req.file) {
      throw new BadRequestError('Tidak ada file gambar yang diunggah.');
    }

    const kategori = req.body.kategori || req.query.kategori || req.body.category || 'ketsai original';
    const folderInfo = ensureCategoryDirectory(kategori);
    const folderName = folderInfo.folderName;

    // Tentukan nama file target dalam format camelCase sesuai nama produk
    const rawProductName =
      req.body.nama_produk ||
      req.query.nama_produk ||
      req.body.namaProduk ||
      req.query.namaProduk ||
      req.body.name ||
      req.query.name;

    const ext = path.extname(req.file.filename || req.file.originalname).toLowerCase();
    let targetFileName = req.file.filename;

    if (rawProductName && typeof rawProductName === 'string' && rawProductName.trim().length > 0) {
      const camelName = toCamelCase(rawProductName);
      targetFileName = `${camelName}${ext}`;
    }

    // Pastikan lokasi fisik dan nama file sesuai di folder target
    const currentFilePath = req.file.path;
    const targetFilePath = path.join(folderInfo.absolutePath, targetFileName);

    if (currentFilePath && fs.existsSync(currentFilePath)) {
      try {
        if (currentFilePath !== targetFilePath) {
          if (fs.existsSync(targetFilePath)) {
            fs.unlinkSync(targetFilePath);
          }
          fs.renameSync(currentFilePath, targetFilePath);
          req.file.path = targetFilePath;
        }
        req.file.filename = targetFileName;
        console.log(`[Upload] Gambar berhasil disimpan: ${targetFileName} di folder ${folderName}`);
      } catch (moveErr) {
        console.warn('Gagal memindahkan/rename file gambar:', moveErr.message);
      }
    }

    const filePath = `/src/assets/${folderName}/${req.file.filename}`;

    const status = (httpStatusCodes && httpStatusCodes.created) || HTTP_STATUS.CREATED || 201;
    return sendSuccess(res, status, 'Gambar produk berhasil diunggah', {
      filePath,
      fileName: req.file.filename,
      folderName,
      originalName: req.file.originalname,
      size: req.file.size
    });
  }


  async getById(req, res) {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Detail produk berhasil diambil', product);
  }

  async create(req, res) {
    // Pastikan direktori kategori dibuat di assets jika ada kategori
    if (req.body && req.body.kategori) {
      try {
        ensureCategoryDirectory(req.body.kategori);
      } catch (e) {
        console.warn('Gagal membuat direktori kategori:', e.message);
      }
    }

    const product = await productService.createProduct(req.body);
    const status = (httpStatusCodes && httpStatusCodes.created) || HTTP_STATUS.CREATED || 201;
    return sendSuccess(res, status, 'Produk berhasil ditambahkan', product);
  }

  async update(req, res) {
    const { id } = req.params;
    if (req.body && req.body.kategori) {
      try {
        ensureCategoryDirectory(req.body.kategori);
      } catch (e) {
        console.warn('Gagal membuat direktori kategori:', e.message);
      }
    }

    const updated = await productService.updateProduct(id, req.body);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Produk berhasil diperbarui', updated);
  }

  async delete(req, res) {
    const { id } = req.params;
    let existingProduct = null;
    try {
      existingProduct = await productService.getProductById(id);
    } catch (e) {
      // Produk mungkin sudah tidak ada
    }

    const result = await productService.deleteProduct(id);

    // Hapus file gambar kustom dari assets jika bukan gambar bawaan default
    if (existingProduct && existingProduct.gambar && existingProduct.gambar.startsWith('/src/assets/')) {
      try {
        const assetsBase = path.resolve(__dirname, '../../../frontend');
        const absoluteImgPath = path.join(assetsBase, existingProduct.gambar);
        const fileName = path.basename(absoluteImgPath);

        const defaultMenuImages = [
          'dimsum.png', 'bakso.png', 'sotoAyam.png', 'sotoBetawi.png', 'sotoSeger.png',
          'tahuBakso.png', 'kolangKaling.png', 'seblak.png', 'buahPotong.png',
          'edoFishBall.png', 'edoCrabFlavouredStick.png', 'edoEbiFurai.png', 'edoEbiKatsu.png',
          'edoFishCake.png', 'goldenFarmMixedVegetables.png', 'goldenFarmCornKernel.png',
          'goldenFarmFrozenPeas.png', 'justFryFrenchFriesStraightCut.png', 'justFryFrenchFriesCrinkleCut.png',
          'miniNeapolitan.png', 'fantazeeChocoMilk.png', 'blueLemonade.png', 'koreanShineMuscat.png',
          'cookieCreamyStick.png', 'myCupChocoStrawberry.png', 'cookiesnCreamy.png',
          'fantazeeChocoMix.png', 'fantazeeStrawberry.png', 'heartCrunch.png', 'logo.png'
        ];

        if (!defaultMenuImages.includes(fileName) && fs.existsSync(absoluteImgPath)) {
          fs.unlinkSync(absoluteImgPath);
          console.log(`[Delete] File gambar produk berhasil dihapus dari assets: ${fileName}`);
        }
      } catch (cleanErr) {
        console.warn('Peringatan saat membersihkan file gambar:', cleanErr.message);
      }
    }

    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, `Produk dengan ID ${id} berhasil dihapus`, result);
  }
}


module.exports = new ProductController();

