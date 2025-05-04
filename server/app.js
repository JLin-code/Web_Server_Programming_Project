const express = require('express');
const app = express();
const dataRoutes = require('./routes/dataRoutes');

// Middleware
app.use(express.json());

// Register the data routes
app.use('/api/v1/data', dataRoutes);

// Import the diagnostics controller
const diagnosticsRouter = require('./controllers/diagnostics');

// Use the diagnostics routes
app.use('/api/diagnostics', diagnosticsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

module.exports = app;