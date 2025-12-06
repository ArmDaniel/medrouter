require('dotenv').config();
const app = require('./app');
const validateEnv = require('./config/validateEnv');
const initializeDatabase = require('./scripts/initializeDb'); // Optional: for auto-init

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  console.error('[FATAL]', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Optional: Initialize DB schema if it hasn't been done
  // In a production app, migrations are usually handled separately.
  // await initializeDatabase();
  // For now, we assume the DB is initialized manually via 'node src/scripts/initializeDb.js'

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}/api`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
