const envConfig = require('./env_config');
const corsConfig = require('./cors_config');

module.exports = {
  envConfig,
  corsConfig,
  // Aliases for backward compatibility
  env_config: envConfig,
  cors_config: corsConfig
};
