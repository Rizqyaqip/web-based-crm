const express = require('express');
const cors = require('cors');

const path = require('path');

const { envConfig, corsConfig } = require('./config');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares');

// Import rute-rute modul
const { authRouter, userRouter } = require('./modules/auth');
const { productRoutes } = require('./modules/product');
const { orderRoutes } = require('./modules/order');
const { stockRoutes } = require('./modules/stock');
const { dashboardRoutes } = require('./modules/dashboard');

const app = express();

// 1. Global Middlewares
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Layani static asset foto produk (PNG) langsung dari folder frontend/src/assets
app.use('/src/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));

// 2. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    message: 'Ketsai Backend API berjalan dengan normal',
    timestamp: new Date().toISOString(),
    environment: envConfig.nodeEnv || envConfig.NODE_ENV,
    database: envConfig.db?.name || envConfig.DB?.NAME
  });
});

// 3. Routing Endpoint API Modular
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock-logs', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 4. Handle 404 Route Not Found
app.use(notFoundMiddleware);

// 5. Centralized Error Handling Middleware (Express 5)
app.use(errorMiddleware);

module.exports = app;
