// controllers/authController.js
import { admin } from '../config/firebase.js';
import { userModel } from '../models/userModel.js';

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

      // Optionally, initialize Firestore profile with default values
      const userProfileDefaults = {
        name: displayName || "",
        email: email,
        mbaExam: "CAT",
        phone: "",
        location: "",
        workExperience: "",
        education: "",
        achievements: "",
        targetYear: new Date().getFullYear() + 1,
        bio: "",
        credits: 1 // Free trial interview
      };
      
      await userModel.createUser(userRecord.uid, userProfileDefaults);

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

  // Get current user profile (Firebase Auth + Firestore profile)
  async getProfile(req, res) {
    try {
      const authUser = await admin.auth().getUser(req.user.uid);

      // Try getting custom profile fields from Firestore Model
      const customProfile = await userModel.getUser(req.user.uid) || {};

      // Compose profile as expected by frontend (see Profile.jsx context)
      res.json({
        success: true,
        user: {
          uid: authUser.uid,
          name: customProfile.name || authUser.displayName || '',
          email: customProfile.email || authUser.email || '',
          mbaExam: customProfile.mbaExam || 'CAT',
          phone: customProfile.phone || '',
          location: customProfile.location || '',
          workExperience: customProfile.workExperience || '',
          education: customProfile.education || '',
          achievements: customProfile.achievements || '',
          targetYear: customProfile.targetYear || new Date().getFullYear() + 1,
          bio: customProfile.bio || '',
          emailVerified: authUser.emailVerified,
          createdAt: authUser.metadata.creationTime,
          lastLoginAt: authUser.metadata.lastSignInTime
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

  // Update user profile (displayName in Auth + extended data in Firestore)
  async updateProfile(req, res) {
    try {
      // Accept all relevant fields
      const {
        name,
        displayName,
        mbaExam,
        phone,
        location,
        workExperience,
        education,
        achievements,
        targetYear,
        bio
      } = req.body;

      // Update displayName in Firebase Auth only if provided
      if (displayName || name) {
        await admin.auth().updateUser(req.user.uid, {
          displayName: displayName || name // prefer explicit displayName
        });
      }

      // Update Firestore with custom profile info
      const updatePayload = {};
      if (name !== undefined) updatePayload.name = name;
      if (displayName !== undefined) updatePayload.name = displayName;
      if (mbaExam !== undefined) updatePayload.mbaExam = mbaExam;
      if (phone !== undefined) updatePayload.phone = phone;
      if (location !== undefined) updatePayload.location = location;
      if (workExperience !== undefined) updatePayload.workExperience = workExperience;
      if (education !== undefined) updatePayload.education = education;
      if (achievements !== undefined) updatePayload.achievements = achievements;
      if (targetYear !== undefined) updatePayload.targetYear = targetYear;
      if (bio !== undefined) updatePayload.bio = bio;

      if (Object.keys(updatePayload).length > 0) {
        await userModel.updateUser(req.user.uid, updatePayload);
      }

      // Fetch the latest user and profile
      const user = await admin.auth().getUser(req.user.uid);
      const customProfile = await userModel.getUser(req.user.uid) || {};

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          uid: user.uid,
          name: customProfile.name || user.displayName || '',
          email: customProfile.email || user.email || '',
          mbaExam: customProfile.mbaExam || 'CAT',
          phone: customProfile.phone || '',
          location: customProfile.location || '',
          workExperience: customProfile.workExperience || '',
          education: customProfile.education || '',
          achievements: customProfile.achievements || '',
          targetYear: customProfile.targetYear || new Date().getFullYear() + 1,
          bio: customProfile.bio || '',
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
      // Remove user doc from Firestore if present
      try {
        await userModel.deleteUser(req.user.uid);
      } catch (e) {
        // ignore if doesn't exist
      }
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
      // For security, do NOT return it to the client.
      console.log(`[SECURE_LOG] Email Verification Link for ${req.user.email}: ${verificationLink}`);

      res.json({
        success: true,
        message: 'Verification email sent (Simulated). Check server logs.'
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
      console.log(`[SECURE_LOG] Password Reset Link for ${email}: ${resetLink}`);

      res.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.'
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