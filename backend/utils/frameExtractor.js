// frameExtraction.js
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Extract frames at random timestamps throughout the video duration
 * @param {string} videoPath - Path to the video file
 * @param {number} frameCount - Number of frames to extract (default: 15)
 * @param {string} tmpDir - Temporary directory (optional)
 * @returns {Promise<Buffer[]>} Array of frame buffers
 */
export async function extractFrames(videoPath, frameCount = 15) {
  // Get video duration first
  const duration = await getVideoDuration(videoPath);
  console.log(`⏱️ Video duration: ${duration} seconds`);
  
  // Generate random timestamps
  const timestamps = generateRandomTimestamps(duration, frameCount);
  console.log(`🎯 Extracting frames at timestamps: ${timestamps.join(', ')}s`);
  
  const uploadsDir = path.resolve(__dirname, '../uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filenamePattern = `frame-${unique}-%02d.png`;
  
  // Extract frames at random timestamps
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        timestamps: timestamps,
        folder: uploadsDir,
        filename: filenamePattern,
        size: '640x?'
      });
  });
  
  // Read and return the generated frames
  return await readAndCleanupFrames(uploadsDir, unique);
}

/**
 * Get video duration in seconds
 */
async function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Error getting video duration:', err);
        // Default to 30 seconds if can't determine
        resolve(30);
        return;
      }
      
      const duration = metadata.format.duration;
      resolve(parseFloat(duration) || 30);
    });
  });
}

/**
 * Generate random timestamps within video duration
 * @param {number} duration - Video duration in seconds
 * @param {number} count - Number of timestamps to generate
 * @returns {number[]} Array of timestamps in seconds
 */
function generateRandomTimestamps(duration, count) {
  // Ensure we have a minimum duration of 5 seconds
  const safeDuration = Math.max(duration, 5);
  
  // Don't extract frames at exactly 0s or the very end
  const minTime = 0.5; // Start at 0.5 seconds
  const maxTime = safeDuration - 0.5; // End 0.5 seconds before the end
  
  // Generate unique random timestamps
  const timestamps = new Set();
  
  while (timestamps.size < count) {
    // Generate random timestamp between minTime and maxTime
    const randomTime = (Math.random() * (maxTime - minTime) + minTime).toFixed(2);
    timestamps.add(parseFloat(randomTime));
    
    // Safety break to prevent infinite loop
    if (timestamps.size >= Math.min(count, safeDuration)) break;
  }
  
  // Sort timestamps in ascending order
  return Array.from(timestamps).sort((a, b) => a - b);
}

/**
 * Read extracted frames from disk and clean up
 */
async function readAndCleanupFrames(uploadsDir, uniquePrefix) {
  const buffers = [];
  const prefix = `frame-${uniquePrefix}-`;
  
  try {
    const dirFiles = await fs.readdir(uploadsDir);
    const matchedFiles = dirFiles
      .filter(file => file.startsWith(prefix) && file.endsWith('.png'))
      .sort();
    
    for (const file of matchedFiles) {
      const fullPath = path.join(uploadsDir, file);
      try {
        const buf = await fs.readFile(fullPath);
        buffers.push(buf);
        await fs.unlink(fullPath);
        console.log(`📸 Extracted and cleaned frame: ${file}`);
      } catch (err) {
        console.error(`Error processing frame ${file}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error reading frames directory:', err.message);
  }
  
  if (!buffers.length) {
    throw new Error('No frames were extracted');
  }
  
  return buffers;
}