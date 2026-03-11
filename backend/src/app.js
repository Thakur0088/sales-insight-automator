const express = require('express');
const helmet = require('helmet');
const { rateLimiter } = require('./middleware/security');
const uploadRouter = require('./routes/upload');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/*
Allowed origins
*/
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
];

/*
Manual CORS middleware
*/
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/*
Security middleware
*/
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

/*
Body parser
*/
app.use(express.json({ limit: "10mb" }));

/*
Rate limiting
*/
app.use(rateLimiter);

/*
Swagger docs
*/
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
Routes
*/
app.use("/api", uploadRouter);

/*
Health check
*/
app.get("/", (req, res) => {
  res.json({
    status: "Sales Insight Automator API is running 🚀"
  });
});

/*
Global error handler
*/
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

/*
Start server
*/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});