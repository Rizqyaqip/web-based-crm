const http = require('http');
const app = require('./app');
const { envConfig } = require('./config');
const { testConnection, closePool } = require('./database');

const PORT = envConfig.port || envConfig.PORT || 5000;
const server = http.createServer(app);

// Jalankan Server & Uji Koneksi Database
async function startServer() {
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn(' Server tetap berjalan dalam mode fallback tanpa koneksi database.');
  }

  server.listen(PORT, () => {
    const currentEnv = envConfig.nodeEnv || envConfig.NODE_ENV;
    console.log(`\n [Ketsai API Server Active]`);
    console.log(` URL Server:    http://localhost:${PORT}`);
    console.log(` Health check:  http://localhost:${PORT}/api/health`);
    console.log(` Products:      http://localhost:${PORT}/api/products`);
    console.log(` Orders:        http://localhost:${PORT}/api/orders`);
    console.log(` Stock Logs:    http://localhost:${PORT}/api/stock-logs`);
    console.log(` Dashboard:     http://localhost:${PORT}/api/dashboard/stats`);
    console.log(` Environment:   ${currentEnv}\n`);
  });
}

// Graceful Shutdown Handler
async function gracefulShutdown(signal) {
  console.log(`\n Sinyal ${signal} diterima. Memulai proses graceful shutdown...`);
  
  server.close(async () => {
    console.log(' Server HTTP berhenti menerima koneksi baru.');
    await closePool();
    console.log(' Semua proses backend berhasil dihentikan dengan aman.');
    process.exit(0);
  });

  // Timeout paksa jika penutupan memakan waktu terlalu lama (> 10 detik)
  setTimeout(() => {
    console.error(' Waktu graceful shutdown habis, mematikan proses secara paksa.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  console.error(' Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Rejection pada Promise:', promise, 'alasan:', reason);
});

startServer();
