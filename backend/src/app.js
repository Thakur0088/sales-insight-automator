const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimiter } = require('./middleware/security');
const uploadRouter = require('./routes/upload');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', uploadRouter);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Sales Insight Automator API is running 🚀' });
});


app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});