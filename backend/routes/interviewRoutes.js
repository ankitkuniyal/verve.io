// routes/interviewRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { analyzeInterview } from '../controllers/interviewController.js';

const router = express.Router();

// ES module __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute uploads folder RELATIVE TO THIS FILE
const uploadDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const finalName = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, finalName);
  }
});

const upload = multer({ storage });

// Main POST route
router.post('/', upload.any(), (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No video files received' });
  }

  // Confirm files exist on disk
  req.files.forEach((f) => {
    fs.existsSync(f.path);
  });

  // Hand off to controller
  analyzeInterview(req, res, next);
});

export default router;
