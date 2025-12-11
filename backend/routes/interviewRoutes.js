import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { analyzeInterview } from '../controllers/interviewController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ES module __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute uploads folder RELATIVE TO THIS FILE
const uploadDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  console.debug(`[interviewRoutes] Upload directory does not exist; creating: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.debug(`[interviewRoutes] Upload directory exists: ${uploadDir}`);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.debug(`[interviewRoutes] Storing file to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const finalName = `${file.fieldname}-${uniqueSuffix}${ext}`;
    console.debug(`[interviewRoutes] Generated filename for upload: ${finalName}`);
    cb(null, finalName);
  }
});

const upload = multer({ storage });

// Main POST route - make protected with authenticateToken
router.post('/', authenticateToken, upload.any(), (req, res, next) => {
  console.debug(`[interviewRoutes] Incoming POST /api/services/interview - files received: ${req.files ? req.files.length : 0}`);
  if (!req.files || req.files.length === 0) {
    console.warn(`[interviewRoutes] No video files received in request`);
    return res.status(400).json({ error: 'No video files received' });
  }

  // Confirm files exist on disk
  req.files.forEach((f, i) => {
    const exists = fs.existsSync(f.path);
    console.debug(`[interviewRoutes] File ${i}: ${f.filename} - path: ${f.path} - exists: ${exists}`);
    // Optional safety: (should always exist as Multer writes the file prior)
    if (!exists) {
      console.error(`[interviewRoutes] ERROR: Uploaded file does not exist on disk: ${f.filename}`);
    }
  });

  // For debug, log received fields (non-files)
  if (req.body && Object.keys(req.body).length > 0) {
    console.debug(`[interviewRoutes] Received form fields:`, req.body);
  }

  // Hand off to controller
  console.debug(`[interviewRoutes] Forwarding request to analyzeInterview controller`);
  analyzeInterview(req, res, next);
});

// Import new dependencies
import { checkInterviewCredits } from '../middlewares/subscriptionMiddleware.js';
import { generateQuestions } from '../controllers/interviewController.js';

// Generate Questions Route
router.post('/generate', authenticateToken, checkInterviewCredits, generateQuestions);


export default router;
