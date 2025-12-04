import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';

ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Get video duration in seconds
 */
export function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration || 0;
      resolve(duration);
    });
  });
}

/**
 * Extract N frames uniformly across the video and return as buffers.
 */
export async function extractFrames(videoPath, frameCount = 15, tmpDir) {
  const duration = await getVideoDuration(videoPath);
  if (duration === 0) {
    throw new Error('Could not determine video duration');
  }

  // Choose timestamps evenly spaced, ignoring very beginning & very end a bit
  const timestamps = [];
  const start = duration * 0.1;
  const end = duration * 0.9;
  const step = (end - start) / (frameCount - 1);

  for (let i = 0; i < frameCount; i++) {
    timestamps.push((start + i * step).toFixed(2)); // seconds with 2 decimals
  }

  // Output files pattern
  const outputPattern = path.join(
    tmpDir,
    `frame-${Date.now()}-${Math.random().toString(36).slice(2)}-%02d.png`
  );

  // Extract frames
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        timestamps,
        filename: path.basename(outputPattern),
        folder: path.dirname(outputPattern),
        size: '640x?'
      });
  });

  // Read all the generated frames
  const buffers = [];
  // We don't know exact count names, so check files in tmpDir that match prefix
  const dirFiles = await fs.readdir(tmpDir);
  const prefix = path.basename(outputPattern).split('%02d')[0];

  for (const file of dirFiles) {
    if (file.startsWith(prefix)) {
      const fullPath = path.join(tmpDir, file);
      const buf = await fs.readFile(fullPath);
      buffers.push(buf);
      // Clean up each frame after reading
      await fs.unlink(fullPath).catch(() => {});
    }
  }

  return buffers;
}
