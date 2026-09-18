const fs = require('fs');
const path = require('path');

/**
 * Mengonversi nama kategori menjadi nama direktori (camelCase)
 * Contoh:
 * - "ketsai original" -> "ketsaiOriginal"
 * - "frozen food"     -> "frozenFood"
 * - "ice cream"       -> "iceCream"
 * - "Minuman Segar"   -> "minumanSegar"
 * - "Aneka Saus"      -> "anekaSaus"
 */
function getCategoryFolderName(categoryName) {
  if (!categoryName || typeof categoryName !== 'string') {
    return 'ketsaiOriginal';
  }

  const clean = categoryName.trim();
  const lower = clean.toLowerCase();

  // Pemetaan khusus untuk kategori yang sudah ada
  if (lower === 'ketsai original' || lower === 'ketsai' || lower === 'ketsaioriginal') {
    return 'ketsaiOriginal';
  }
  if (lower === 'frozen food' || lower === 'frozen' || lower === 'frozenfood') {
    return 'frozenFood';
  }
  if (lower === 'ice cream' || lower === 'icecream') {
    return 'iceCream';
  }

  // Format camelCase untuk kategori baru
  const words = clean
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .split(/[\s_-]+/)
    .filter(Boolean);

  if (words.length === 0) return 'umum';

  return words
    .map((word, index) => {
      const w = word.toLowerCase();
      if (index === 0) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join('');
}

/**
 * Memastikan direktori kategori ada di folder frontend/src/assets/
 * Jika belum ada, otomatis dibuat.
 */
function ensureCategoryDirectory(categoryName) {
  const folderName = getCategoryFolderName(categoryName);
  const baseAssetsDir = path.resolve(__dirname, '../../frontend/src/assets');
  const targetDir = path.join(baseAssetsDir, folderName);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`[Assets] Direktori kategori baru dibuat: ${targetDir}`);
  }

  return {
    folderName,
    absolutePath: targetDir,
    relativeAssetPath: `/src/assets/${folderName}`
  };
}

/**
 * Mengonversi teks (nama produk) menjadi camelCase bersih untuk penamaan file
 * Contoh:
 * - "Seoul Lychee Yoghurt" -> "seoulLycheeYoghurt"
 * - "dimsum" -> "dimsum"
 * - "Edo Fish Ball (250 gr)" -> "edoFishBall250Gr"
 */
function toCamelCase(str) {
  if (!str || typeof str !== 'string') return 'produk';

  const clean = str.trim().replace(/[^a-zA-Z0-9\s_-]/g, '');
  const words = clean.split(/[\s_-]+/).filter(Boolean);

  if (words.length === 0) return 'produk';

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

module.exports = {
  getCategoryFolderName,
  ensureCategoryDirectory,
  toCamelCase
};
