
async function seedDatabaseDefaults(pool) {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM products LIKE 'deskripsi'");
    if (cols.length === 0) {
      await pool.query('ALTER TABLE products ADD COLUMN deskripsi TEXT NULL AFTER nama_produk');
    }

    const [camelCols] = await pool.query("SHOW COLUMNS FROM products LIKE 'jumlahStok'");
    if (camelCols.length > 0) {
      console.log('[MIGRATION] Menyeragamkan field products.jumlahStok menjadi products.jumlah_stok (snake_case)...');
      await pool.query('ALTER TABLE products CHANGE COLUMN jumlahStok jumlah_stok INT NOT NULL DEFAULT 0');
    }

    try {
      await pool.query('ALTER TABLE users MODIFY COLUMN nama VARCHAR(75) NOT NULL');
      await pool.query('ALTER TABLE users MODIFY COLUMN password VARCHAR(75) NOT NULL');
      await pool.query('ALTER TABLE products MODIFY COLUMN nama_produk VARCHAR(75) NOT NULL');
      await pool.query("ALTER TABLE products MODIFY COLUMN kategori VARCHAR(50) NOT NULL DEFAULT 'Umum'");
      await pool.query('ALTER TABLE products MODIFY COLUMN gambar VARCHAR(75) NULL');
      await pool.query('ALTER TABLE orders MODIFY COLUMN nama_customer VARCHAR(75) NOT NULL');
      
      await pool.query("UPDATE users SET role = 'staff' WHERE role NOT IN ('admin', 'staff')");
      await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff'");

      await pool.query('ALTER TABLE stock_logs MODIFY COLUMN user_id INT(11) NULL DEFAULT NULL');
      const [orderIdCols] = await pool.query("SHOW COLUMNS FROM stock_logs LIKE 'order_id'");
      if (orderIdCols.length === 0) {
        await pool.query('ALTER TABLE stock_logs ADD COLUMN order_id INT(11) NULL DEFAULT NULL AFTER user_id');
        try {
          await pool.query('ALTER TABLE stock_logs ADD CONSTRAINT fk_stock_logs_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE');
        } catch (fkErr) {
        }
      }
    } catch (colErr) {
    }
  } catch (err) {
    console.warn('[WARN] Peringatan saat inisialisasi database:', err.message);
  }
}

module.exports = {
  seedDatabaseDefaults
};
