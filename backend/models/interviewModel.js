import { db, admin } from '../config/firebase.js';

class InterviewModel {
  constructor() {
    this.collection = db.collection('interviews');
  }

  /**
   * Create a new interview record
   * @param {Object} interviewData 
   */
  async createInterview(interviewData) {
    return await this.collection.add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...interviewData
    });
  }

  /**
   * Get interviews for a specific user
   * @param {string} userId 
   */
  async getClassByUser(userId) {
    const snapshot = await this.collection.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const interviewModel = new InterviewModel();
