const multer = require('multer');
const path = require('path');
const { ensureCategoryDirectory, getCategoryFolderName, toCamelCase } = require('../utils/category_utils');
const { BadRequestError } = require('../utils/app_error');

// Konfigurasi penyimpanan disk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const categoryName =
        req.query.kategori ||
        req.query.category ||
        req.body?.kategori ||
        req.body?.category ||
        'ketsai original';
      const { absolutePath } = ensureCategoryDirectory(categoryName);
      cb(null, absolutePath);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const rawName =
        req.query.nama_produk ||
        req.query.namaProduk ||
        req.query.name ||
        req.body?.nama_produk ||
        req.body?.namaProduk ||
        req.body?.name;

      let baseName;
      if (rawName && typeof rawName === 'string' && rawName.trim().length > 0) {
        baseName = toCamelCase(rawName);
      } else {
        const rawBase = path.basename(file.originalname, ext);
        baseName = toCamelCase(rawBase);
      }

      if (!baseName) baseName = 'produk';

      const finalFilename = `${baseName}${ext}`;
      cb(null, finalFilename);
    } catch (err) {
      cb(err);
    }
  }
});

// Validasi tipe file
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeAllowed = file.mimetype.startsWith('image/');
  const isExtAllowed = allowedExtensions.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    return cb(null, true);
  }

  cb(
    new BadRequestError(
      'Format file tidak didukung. Harap unggah gambar dengan format PNG, JPG, JPEG, atau WEBP.'
    )
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Maksimal 5 MB
  }
});

module.exports = {
  upload,
  uploadProductImageMiddleware: upload.single('image')
};
