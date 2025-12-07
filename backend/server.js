// app.js or server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import essayRoutes from './routes/essayRoutes.js';
import quizRoutes from "./routes/quizRoutes.js"
import resumeRoutes from "./routes/resumeRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import newsRoutes from "./routes/newsRoutes.js"
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/essay', essayRoutes);
app.use('/api/quiz', quizRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/services/interview', interviewRoutes);
app.use('/api/services', newsRoutes);
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;