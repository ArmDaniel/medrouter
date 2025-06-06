const User = require('../models/UserModel');
const CaseModel = require('../models/CaseModel'); // Added

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    // await db.pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'); // If needed for PG < 13

    console.log('Creating users table...');
    await User.createTable();
    console.log('Users table created or already exists.');

    console.log('Creating patient_cases table...'); // Added
    await CaseModel.createTable(); // Added
    console.log('Patient_cases table created or already exists.'); // Added

  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Database initialization script finished.');
    const db = require('../config/database');
    db.pool.end().then(() => console.log('Database pool closed.'));
  }).catch(err => {
    console.error('Script execution error:', err);
    const db = require('../config/database');
    db.pool.end().then(() => console.log('Database pool closed after error.'));
  });
}

module.exports = initializeDatabase;
