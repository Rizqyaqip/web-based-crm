require('dotenv').config();

const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  NODE_ENV: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  PORT: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'finalarcstuff'
  },
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'finalarcstuff'
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true'
  },
  MIDTRANS: {
    SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',
    CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || '',
    IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === 'true'
  }
};

module.exports = envConfig;
