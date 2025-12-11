import { db, admin } from '../config/firebase.js';

class UserModel {
  constructor() {
    this.collection = db.collection('users');
  }

  /**
   * Create or overwrite a user profile
   * @param {string} uid User ID
   * @param {Object} userData data to set
   */
  async createUser(uid, userData) {
    return await this.collection.doc(uid).set(userData);
  }

  /**
   * Get user profile by ID
   * @param {string} uid User ID
   * @returns {Object|null} User data or null if not found
   */
  async getUser(uid) {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  /**
   * Update user profile
   * @param {string} uid 
   * @param {Object} data 
   */
  async updateUser(uid, data) {
    return await this.collection.doc(uid).set(data, { merge: true });
  }

  /**
   * Delete user profile
   * @param {string} uid 
   */
  async deleteUser(uid) {
    return await this.collection.doc(uid).delete();
  }

  /**
   * Check if user exists, create if not (legacy resilience support)
   */
  async ensureUserExists(uid, defaults = {}) {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) {
        await this.collection.doc(uid).set(defaults, { merge: true });
        return defaults;
    }
    return doc.data();
  }

  /**
   * Deduct one credit from user in a transaction
   * @param {string} uid 
   * @throws Error if insufficient credits
   */
  async deductCredit(uid) {
    return await db.runTransaction(async (t) => {
      const userRef = this.collection.doc(uid);
      const doc = await t.get(userRef);
      const userData = doc.data() || {};
      const currentCredits = userData.credits || 1;

      if (currentCredits <= 0) {
        throw new Error("Insufficient credits");
      }

      t.update(userRef, {
        credits: admin.firestore.FieldValue.increment(-1),
        interviewsTaken: admin.firestore.FieldValue.increment(1)
      });
      
      return currentCredits - 1;
    });
  }
}

export const userModel = new UserModel();
