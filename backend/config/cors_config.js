const envConfig = require('./env_config');

const allowedOrigins = [
  envConfig.clientUrl,
  envConfig.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

const corsConfig = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti curl, mobile apps, atau internal server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} diblokir oleh kebijakan CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = corsConfig;
