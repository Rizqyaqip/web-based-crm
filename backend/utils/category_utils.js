const fs = require('fs');
const path = require('path');

function getCategoryFolderName(categoryName) {
  if (!categoryName || typeof categoryName !== 'string') {
    return 'ketsaiOriginal';
  }

  const clean = categoryName.trim();
  const lower = clean.toLowerCase();

  if (lower === 'ketsai original' || lower === 'ketsai' || lower === 'ketsaioriginal') {
    return 'ketsaiOriginal';
  }
  if (lower === 'frozen food' || lower === 'frozen' || lower === 'frozenfood') {
    return 'frozenFood';
  }
  if (lower === 'ice cream' || lower === 'icecream') {
    return 'iceCream';
  }

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
