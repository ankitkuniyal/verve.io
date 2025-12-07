// routes/interviewRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { analyzeInterview } from '../controllers/interviewController.js';

console.log('🔥 interviewRoutes.js loaded'); // ⬅️ This should show when server starts

const router = express.Router();

// ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Absolute uploads folder RELATIVE TO THIS FILE
const uploadDir = path.join(__dirname, '../uploads');

// ✅ Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads dir at:', uploadDir);
} else {
  console.log('✅ Using existing uploads dir:', uploadDir);
}

// ✅ Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📂 Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const finalName = `${file.fieldname}-${uniqueSuffix}${ext}`;
    console.log('📝 Generated filename:', finalName);
    cb(null, finalName);
  }
});

const upload = multer({ storage });

// ✅ Main POST route
router.post('/', upload.any(), (req, res, next) => {
  console.log('🚀 /api/services/interview route HIT');

  console.log('🧾 Received fields:', req.body);
  console.log('🎥 Received files:', req.files);

  if (!req.files || req.files.length === 0) {
    console.error('❌ Multer did not get any files');
    return res.status(400).json({ error: 'No video files received' });
  }

  // Confirm files exist on disk
  req.files.forEach((f, idx) => {
    const exists = fs.existsSync(f.path);
    console.log(`📁 [${idx}]`, {
      fieldname: f.fieldname,
      originalname: f.originalname,
      filename: f.filename,
      path: f.path,
      existsOnDisk: exists
    });
  });

  // Hand off to controller
  analyzeInterview(req, res, next);
});

export default router;
