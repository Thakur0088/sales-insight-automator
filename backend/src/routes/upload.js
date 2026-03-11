const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const XLSX = require('xlsx');
const { Readable } = require('stream');
const { validateUpload } = require('../middleware/security');
const { generateSummary } = require('../services/groqService');
const { sendSummaryEmail } = require('../services/emailService');

const router = express.Router();

// Store file in memory (not disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper: Parse CSV buffer
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csvParser())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Helper: Parse XLSX buffer
const parseXLSX = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload sales file and receive AI summary via email
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or XLSX sales file
 *               email:
 *                 type: string
 *                 description: Recipient email address
 *     responses:
 *       200:
 *         description: Summary generated and sent to email
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/upload',
  // Step 1: Handle multer with error catching
  (req, res, next) => {
    req.setTimeout(90000);
    res.setTimeout(90000);
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  // Step 2: Validate inputs
  validateUpload,
  // Step 3: Process
  async (req, res) => {
    try {
      const { email } = req.body;
      const file = req.file;

      // Parse the file
      let parsedData;
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        parsedData = await parseCSV(file.buffer);
      } else {
        parsedData = parseXLSX(file.buffer);
      }

      if (!parsedData || parsedData.length === 0) {
        return res.status(400).json({ error: 'File is empty or could not be parsed.' });
      }

      // Convert to string for Groq
      const dataString = JSON.stringify(parsedData, null, 2);

      // Generate AI Summary
      console.log(`Generating summary for ${parsedData.length} rows...`);
      const summary = await generateSummary(dataString);
      console.log('Summary generated successfully');

      // Send Email
      console.log(`Sending email to ${email}...`);
      await sendSummaryEmail(email, summary);
      console.log('Email sent successfully');

      res.status(200).json({
        message: `✅ Summary generated and sent to ${email}`,
        rowsProcessed: parsedData.length,
      });

    } catch (error) {
      console.error('Upload error details:', error.message);
      console.error('Stack:', error.stack);

      // Give specific error messages
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return res.status(500).json({ error: 'AI service timed out. Please try again.' });
      }
      if (error.message.includes('GROQ') || error.message.includes('groq')) {
        return res.status(500).json({ error: 'AI service error. Check your Groq API key.' });
      }
      if (error.message.includes('Gmail') || error.message.includes('email') || error.message.includes('EAUTH')) {
        return res.status(500).json({ error: 'Email sending failed. Check Gmail credentials.' });
      }

      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;