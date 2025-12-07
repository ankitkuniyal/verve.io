// ffmpegHelper.js
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';

ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Extract `frameCount` frames at fixed timemarks and return as Buffers.
 * Temporary PNGs are saved in ../uploads.
 */
export async function extractFrames(videoPath, frameCount = 15, tmpDir) {
  // Always save extracted frames in ../uploads, regardless of input tmpDir
  const uploadsDir = path.resolve(__dirname, '../uploads');

  // Ensure ../uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // Unique pattern per call to avoid clashes
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filenamePattern = `frame-${unique}-%02d.png`;

  // Fixed timestamps: 1s, 2s, ..., frameCount seconds
  const timestamps = [];
  for (let i = 1; i <= frameCount; i++) {
    timestamps.push(`${i}`);
  }

  // Do extraction to '../uploads'
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(new Error(`ffmpeg screenshots error: ${err.message}`));
      })
      .screenshots({
        timestamps,
        folder: uploadsDir,
        filename: filenamePattern,
        size: '640x?' // keep aspect ratio, width 640
      });
  });

  // Read the generated frames from ../uploads and cleanup
  const buffers = [];
  const dirFiles = await fs.readdir(uploadsDir);
  const prefix = `frame-${unique}-`;

  const matchedFiles = dirFiles
    .filter((file) => file.startsWith(prefix))
    .sort(); // frame-..-01, 02, ...

  for (const file of matchedFiles) {
    const fullPath = path.join(uploadsDir, file);
    try {
      const buf = await fs.readFile(fullPath);
      buffers.push(buf);
    } finally {
      // Cleanup, ignore errors
      try {
        await fs.unlink(fullPath);
      } catch {}
    }
  }

  if (!buffers.length) {
    throw new Error(`No frames generated for ${videoPath}`);
  }

  return buffers;
}
