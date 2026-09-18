const mysql = require('mysql2/promise');
const { envConfig } = require('../config');
const { seedDatabaseDefaults } = require('./seed_data');

// Inisialisasi pool koneksi MySQL2
const pool = mysql.createPool({
  host: envConfig.db.host || envConfig.DB.HOST,
  port: envConfig.db.port || envConfig.DB.PORT,
  user: envConfig.db.user || envConfig.DB.USER,
  password: envConfig.db.password || envConfig.DB.PASSWORD,
  database: envConfig.db.name || envConfig.DB.NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const dbName = envConfig.db.name || envConfig.DB.NAME;
    const dbPort = envConfig.db.port || envConfig.DB.PORT;
    console.log(`[DB] Berhasil terhubung ke database MySQL [${dbName}] pada port ${dbPort}`);
    connection.release();

    // Jalankan seeding otomatis jika data kosong
    await seedDatabaseDefaults(pool);
    return true;
  } catch (error) {
    console.error('[DB ERROR] Gagal terhubung ke database MySQL:');
    console.error(`   Pesan error: ${error.message}`);
    console.error('   Tips: Pastikan layanan MySQL (misal XAMPP) aktif dan database sudah dibuat.');
    return false;
  }
}

async function closePool() {
  try {
    await pool.end();
    console.log('[DB] Pool koneksi database MySQL ditutup dengan aman.');
  } catch (err) {
    console.error('Error saat menutup pool database:', err.message);
  }
}

module.exports = {
  pool,
  testConnection,
  closePool
};
