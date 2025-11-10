// controllers/authController.js
import {admin} from '../config/firebase.js';

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, displayName } = req.body;

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: false
      });

      // Set custom claims if needed
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        roles: ['candidate']
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { idToken } = req.body;

      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Get additional user data
      const user = await admin.auth().getUser(decodedToken.uid);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        token: idToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await admin.auth().getUser(req.user.uid);
      
      res.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime,
          lastLoginAt: user.metadata.lastSignInTime
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile'
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { displayName } = req.body;
      
      const user = await admin.auth().updateUser(req.user.uid, {
        displayName
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Change user password
  async changePassword(req, res) {
    try {
      const { newPassword } = req.body;

      await admin.auth().updateUser(req.user.uid, {
        password: newPassword
      });

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user account
  async deleteAccount(req, res) {
    try {
      await admin.auth().deleteUser(req.user.uid);
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      // Generate email verification link
      const verificationLink = await admin.auth().generateEmailVerificationLink(req.user.email);
      
      // In a real application, you would send this link via email
      // For demo purposes, we're returning it in the response
      res.json({
        success: true,
        message: 'Email verification link generated',
        verificationLink
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Send password reset email
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      
      // In a real application, you would send this link via email
      res.json({
        success: true,
        message: 'Password reset link generated',
        resetLink
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

const authController = new AuthController();
export default authController;