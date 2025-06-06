const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const caseRoutes = require('./routes/caseRoutes'); // New
const llmRoutes = require('./routes/llmRoutes');   // New
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes); // New
app.use('/api/llm', llmRoutes);     // New

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to MedRouter API' });
});

module.exports = app;
