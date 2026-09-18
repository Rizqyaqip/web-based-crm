const { pool } = require('../../database');

class OrderRepository {
  async getConnection() {
    return await pool.getConnection();
  }

  async findGuestUser(conn = pool) {
    const [rows] = await conn.query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");
    return rows.length > 0 ? rows[0].id : 1;
  }

  async findProductForUpdate(conn, productId) {
    const [rows] = await conn.query(
      'SELECT id, nama_produk, harga, jumlahStok FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );
    return rows[0] || null;
  }

  async insertOrder(conn, { userId, user_id, namaCustomer, nama_customer, noHp, no_hp, alamat, tanggalPesan, tanggal_pesan, status = 'Pending', totalHarga, total_harga }) {
    const finalUserId = userId || user_id;
    const finalNama = (namaCustomer || nama_customer || '').trim();
    const finalHp = (noHp || no_hp || '').trim();
    const finalAlamat = (alamat || '').trim();
    const finalTanggal = tanggalPesan || tanggal_pesan || new Date();
    const finalTotal = totalHarga !== undefined ? totalHarga : total_harga;

    const [result] = await conn.query(
      `INSERT INTO orders (user_id, nama_customer, no_hp, alamat, tanggal_pesan, status, total_harga)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [finalUserId, finalNama, finalHp, finalAlamat, finalTanggal, status, finalTotal]
    );
    return result.insertId;
  }

  async insertOrderItem(conn, { orderId, order_id, productId, product_id, jumlah, totalHarga, total_harga }) {
    const finalOrderId = orderId || order_id;
    const finalProductId = productId || product_id;
    const finalTotal = totalHarga !== undefined ? totalHarga : total_harga;

    await conn.query(
      'INSERT INTO order_items (order_id, product_id, jumlah, total_harga) VALUES (?, ?, ?, ?)',
      [finalOrderId, finalProductId, jumlah, finalTotal]
    );
  }

  async decreaseProductStock(conn, productId, jumlah) {
    await conn.query(
      'UPDATE products SET jumlahStok = jumlahStok - ? WHERE id = ?',
      [jumlah, productId]
    );
  }

  async insertStockLog(conn, { productId, product_id, userId, user_id, jumlah, jenis, tanggal }) {
    const finalProductId = productId || product_id;
    const finalUserId = userId || user_id;
    const finalTanggal = tanggal || new Date();

    await conn.query(
      'INSERT INTO stock_logs (product_id, user_id, jumlah, jenis, tanggal) VALUES (?, ?, ?, ?, ?)',
      [finalProductId, finalUserId, jumlah, jenis, finalTanggal]
    );
  }

  async insertPayment(conn, { orderId, order_id, metode, totalHarga, total_harga, status, tanggalBayar, tanggal_bayar }) {
    const finalOrderId = orderId || order_id;
    const finalTotal = totalHarga !== undefined ? totalHarga : total_harga;
    const finalTanggal = tanggalBayar || tanggal_bayar || new Date();

    await conn.query(
      'INSERT INTO payments (order_id, metode, total_harga, status, tanggal_bayar) VALUES (?, ?, ?, ?, ?)',
      [finalOrderId, metode, finalTotal, status, finalTanggal]
    );
  }

  async insertInvoice(conn, { orderId, order_id, tanggalCetak, tanggal_cetak, totalHarga, total_harga }) {
    const finalOrderId = orderId || order_id;
    const finalTanggal = tanggalCetak || tanggal_cetak || new Date();
    const finalTotal = totalHarga !== undefined ? totalHarga : total_harga;

    const [result] = await conn.query(
      'INSERT INTO invoices (order_id, tanggal_cetak, total_harga) VALUES (?, ?, ?)',
      [finalOrderId, finalTanggal, finalTotal]
    );
    return result.insertId;
  }

  async findAllOrders({ status, search, limit = 50, startDate, endDate } = {}) {
    const maxLimit = Math.min(Number(limit) || 50, 100);
    let sql = `
      SELECT 
        o.id,
        o.nama_customer,
        o.no_hp,
        o.alamat,
        o.tanggal_pesan,
        o.status,
        o.total_harga,
        p.metode AS metode_pembayaran,
        p.status AS status_pembayaran,
        i.id AS invoice_id
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN invoices i ON o.id = i.order_id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== 'Semua') {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(o.nama_customer LIKE ? OR o.id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate) {
      conditions.push('DATE(o.tanggal_pesan) >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('DATE(o.tanggal_pesan) <= ?');
      params.push(endDate);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY o.id DESC LIMIT ?';
    params.push(maxLimit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async findOrderById(id) {
    const [rows] = await pool.query(`
      SELECT 
        o.id,
        o.nama_customer,
        o.no_hp,
        o.alamat,
        o.tanggal_pesan,
        o.status,
        o.total_harga,
        p.metode AS metode_pembayaran,
        p.status AS status_pembayaran,
        i.id AS invoice_id,
        i.tanggal_cetak
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN invoices i ON o.id = i.order_id
      WHERE o.id = ?
    `, [id]);

    return rows[0] || null;
  }

  async findOrderItems(orderId) {
    const [rows] = await pool.query(`
      SELECT 
        oi.id,
        oi.product_id,
        oi.jumlah,
        oi.total_harga,
        p.nama_produk,
        p.deskripsi,
        p.harga,
        p.gambar,
        p.kategori
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    return rows;
  }

  async updateOrderStatus(id, status) {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  async updatePaymentStatusByOrderId(orderId, status) {
    await pool.query('UPDATE payments SET status = ? WHERE order_id = ?', [status, orderId]);
  }

  async updatePaymentMethodByOrderId(orderId, method) {
    await pool.query('UPDATE payments SET metode = ? WHERE order_id = ?', [method, orderId]);
  }
}

module.exports = new OrderRepository();

