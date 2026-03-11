const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 10 requests per window per IP
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateUpload = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Recipient email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Only CSV or XLSX files are allowed.' });
  }

  // Max file size: 5MB
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size must be under 5MB.' });
  }

  next();
};

module.exports = { rateLimiter, validateUpload };