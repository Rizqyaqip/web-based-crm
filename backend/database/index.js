const {
  pool,
  testConnection,
  closePool
} = require('./db_connection');

const {
  initialProducts,
  seedDatabaseDefaults
} = require('./seed_data');

module.exports = {
  pool,
  testConnection,
  closePool,
  initialProducts,
  seedDatabaseDefaults
};
