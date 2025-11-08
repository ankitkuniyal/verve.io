// routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import admin from '../config/firebase.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.delete('/account', authenticateToken, authController.deleteAccount);
router.post('/verify-email', authenticateToken, authController.verifyEmail);

// Admin only routes
router.get('/admin/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  // Implementation for getting all users (admin only)
  try {
    const listUsers = await admin.auth().listUsers();
    res.json({
      success: true,
      users: listUsers.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

export default router;