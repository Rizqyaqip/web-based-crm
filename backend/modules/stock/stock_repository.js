const { pool } = require('../../database');

class StockRepository {
  async getConnection() {
    return await pool.getConnection();
  }

  async findAllLogs({ startDate, endDate, productId, limit = 50 } = {}) {
    const maxLimit = Math.min(Number(limit) || 50, 100);

    let sql = `
      SELECT 
        sl.id,
        sl.product_id,
        sl.order_id,
        p.nama_produk,
        p.kategori,
        sl.user_id,
        COALESCE(u.nama, '-') AS operator_name,
        sl.jumlah,
        sl.jenis,
        sl.tanggal
      FROM stock_logs sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN users u ON sl.user_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (productId) {
      conditions.push('sl.product_id = ?');
      params.push(productId);
    }

    if (startDate) {
      conditions.push('DATE(sl.tanggal) >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('DATE(sl.tanggal) <= ?');
      params.push(endDate);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY sl.tanggal DESC LIMIT ?';
    params.push(maxLimit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async findProductForUpdate(conn, productId) {
    const [rows] = await conn.query(
      'SELECT id, nama_produk, jumlah_stok FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      jumlah_stok: Number(rows[0].jumlah_stok),
      jumlahStok: Number(rows[0].jumlah_stok)
    };
  }

  async updateProductStock(conn, productId, newStock) {
    await conn.query('UPDATE products SET jumlah_stok = ? WHERE id = ?', [newStock, productId]);
  }

  async insertLog(conn, { productId, product_id, userId, user_id, orderId, order_id, jumlah, jenis, tanggal }) {
    const finalProductId = productId || product_id;
    const finalUserId = userId !== undefined ? userId : (user_id !== undefined ? user_id : null);
    const finalOrderId = orderId || order_id || null;
    const finalTanggal = tanggal || new Date();

    const [result] = await conn.query(
      'INSERT INTO stock_logs (product_id, user_id, order_id, jumlah, jenis, tanggal) VALUES (?, ?, ?, ?, ?, ?)',
      [finalProductId, finalUserId, finalOrderId, jumlah, jenis, finalTanggal]
    );
    return result.insertId;
  }

}

module.exports = new StockRepository();

