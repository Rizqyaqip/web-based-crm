const stockRepository = require('./stock_repository');
const { BadRequestError, NotFoundError } = require('../../utils');
const { stockMutationTypes, STOCK_MUTATION_TYPES } = require('../../constants');

class StockService {
  async getStockLogs(filters) {
    return await stockRepository.findAllLogs(filters);
  }

  async addStockEntry({ productId, product_id, jumlah, userId, user_id, jenis } = {}) {
    const finalProductId = productId || product_id;
    const finalUserId = userId || user_id;
    const defaultJenis = (stockMutationTypes && stockMutationTypes.in) || STOCK_MUTATION_TYPES.IN || 'masuk';
    const finalJenis = jenis || defaultJenis;

    const qty = Number(jumlah);
    if (!finalProductId || isNaN(qty) || qty <= 0) {
      throw new BadRequestError('ID Produk dan jumlah stok valid (> 0) wajib diisi');
    }

    const conn = await stockRepository.getConnection();
    try {
      await conn.beginTransaction();

      const product = await stockRepository.findProductForUpdate(conn, finalProductId);
      if (!product) {
        throw new NotFoundError('Produk tidak ditemukan');
      }

      const currentStock = Number(product.jumlah_stok !== undefined ? product.jumlah_stok : product.jumlahStok) || 0;
      const newStock = currentStock + qty;

      await stockRepository.updateProductStock(conn, finalProductId, newStock);

      let operatorId = finalUserId;
      if (operatorId) {
        const [u] = await conn.query('SELECT id FROM users WHERE id = ?', [operatorId]);
        if (u.length === 0) operatorId = null;
      }
      if (!operatorId) {
        const [defaultUser] = await conn.query("SELECT id FROM users WHERE role IN ('admin', 'staff') ORDER BY id ASC LIMIT 1");
        operatorId = defaultUser[0]?.id || 2;
      }
      const tanggal = new Date();

      const logId = await stockRepository.insertLog(conn, {
        productId: finalProductId,
        userId: operatorId,
        jumlah: qty,
        jenis: finalJenis,
        tanggal
      });

      await conn.commit();

      return {
        log_id: logId,
        logId,
        product_id: finalProductId,
        productId: finalProductId,
        nama_produk: product.nama_produk,
        namaProduk: product.nama_produk,
        stok_sebelumnya: currentStock,
        stokSebelumnya: currentStock,
        stok_sekarang: newStock,
        stokSekarang: newStock,
        jumlah_ditambahkan: qty,
        jumlahDitambahkan: qty,
        tanggal: tanggal.toISOString()
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = new StockService();

