const User = require('../models/UserModel');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    // Enable UUID generation if not enabled by default and using older PG
    // await User.pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await User.createTable();
    console.log('Users table created or already exists.');
    // Potentially close the pool if this script is run and exits
    // await User.pool.end(); // Or db.pool.end() if db is exported from database.js
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// If this script is run directly:
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Database initialization script finished.');
    // Make sure to call pool.end() if you are done with the pool.
    // For a script like this, it's often good practice.
    // However, if other parts of your app are running, you might not want to end it here.
    // For now, we'll assume this is a one-off script.
    const db = require('../config/database');
    db.pool.end();
  });
}

module.exports = initializeDatabase;
