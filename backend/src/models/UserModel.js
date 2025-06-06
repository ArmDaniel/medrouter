const db = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
  async createTable() {
    const queryText = `
      CREATE TABLE IF NOT EXISTS users (
        userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        specialty VARCHAR(255),
        createdAt TIMESTAMPTZ DEFAULT NOW(),
        updatedAt TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    // gen_random_uuid() is available in PostgreSQL v13+
    // For older versions, consider using uuid-ossp extension and uuid_generate_v4()
    // Or handle UUID generation in the application code before insert.
    await db.query(queryText);
  },

  async findByEmail(email) {
    const queryText = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(queryText, [email]);
    return rows[0];
  },

  async findById(userId) {
    const queryText = 'SELECT * FROM users WHERE userId = $1';
    const { rows } = await db.query(queryText, [userId]);
    return rows[0];
  },

  async create(userData) {
    const { role, name, email, password, specialty } = userData;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const queryText = `
      INSERT INTO users (role, name, email, passwordHash, specialty)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING userId, role, name, email, specialty, createdAt;
    `;
    const values = [role, name, email, passwordHash, specialty];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  async verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }
  // Add other necessary methods like update, delete etc. later
};

module.exports = User;
