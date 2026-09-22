const { pool } = require('../../database');

class DashboardRepository {
  async getTodaySalesAndOrders() {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_harga), 0) AS total_sales_today,
        COUNT(id) AS total_orders_today
      FROM orders
      WHERE DATE(tanggal_pesan) = CURDATE()
    `);
    return rows[0];
  }

  async getTotalAllOrders() {
    const [rows] = await pool.query('SELECT COUNT(id) AS total_all_orders FROM orders');
    return rows[0].total_all_orders;
  }

  async getLowStockItems(threshold = 5) {
    const [rows] = await pool.query(`
      SELECT id, nama_produk, kategori, jumlah_stok 
      FROM products 
      WHERE jumlah_stok <= ?
      ORDER BY jumlah_stok ASC
    `, [threshold]);
    return rows.map((r) => ({
      ...r,
      jumlah_stok: Number(r.jumlah_stok),
      jumlahStok: Number(r.jumlah_stok)
    }));
  }

  async getWeeklySales() {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(d.date, '%Y-%m-%d') as tanggal,
        DATE_FORMAT(d.date, '%a') as hari,
        COALESCE(SUM(o.total_harga), 0) as total
      FROM (
        SELECT CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY as date
        FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) as a
        CROSS JOIN (SELECT 0 as a) as b
      ) d
      LEFT JOIN orders o ON DATE(o.tanggal_pesan) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `);

    return rows.map((r) => ({
      tanggal: r.tanggal,
      hari: r.hari,
      total: Number(r.total)
    }));
  }

  async getRecentActionableOrders(limit = 5) {
    const [rows] = await pool.query(`
      SELECT 
        o.id,
        o.nama_customer,
        o.total_harga,
        o.status,
        o.tanggal_pesan,
        p.metode AS metode_pembayaran
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      ORDER BY 
        CASE 
          WHEN o.status = 'Pending' THEN 1
          WHEN o.status = 'Diproses' THEN 2
          ELSE 3
        END,
        o.id DESC
      LIMIT ?
    `, [limit]);

    return rows;
  }

}

module.exports = new DashboardRepository();

