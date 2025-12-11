import { userModel } from '../models/userModel.js';

/**
 * Middleware to check if user has subscription credits
 * Assumes 'credits' field in 'users' collection.
 * 
 * Default: User needs > 0 credits to proceed.
 */
export async function checkInterviewCredits(req, res, next) {
  try {
    const uid = req.user.uid;
    
    // Fetch or create user (with resilience)
    const userData = await userModel.ensureUserExists(uid, { credits: 0 });
    
    const credits = userData.credits !== undefined ? userData.credits : 1; 

    if (credits <= 0) {
      return res.status(403).json({
        success: false,
        error: "Insufficient interview credits",
        requiresSubscription: true,
        currentCredits: 0
      });
    }

    // Attach current credits to request for controller to use/decrement
    req.userCredits = credits;
    next();
  } catch (error) {
    console.error("[checkInterviewCredits] Error:", error);
    res.status(500).json({ error: "Internal server error checking subscription" });
  }
}
