// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Renamed to avoid conflicts
  const [actionLoading, setActionLoading] = useState(false); // Separate loading for actions
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false); // This should only control auth state checking
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setActionLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setActionLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      return userCredential;
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setActionLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create/update user profile in Firestore
      const user = userCredential.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          name: user.displayName || '',
          email: user.email || '',
          mbaExam: 'CAT',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: user.uid,
          photoURL: user.photoURL || null
        });
      } else {
        // Update existing profile with latest info
        await setDoc(userRef, {
          name: user.displayName || userSnap.data().name || '',
          email: user.email || userSnap.data().email || '',
          photoURL: user.photoURL || userSnap.data().photoURL || null,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      return userCredential;
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    try {
      setActionLoading(true);
      await signOut(auth);
      // Note: onAuthStateChanged will automatically update the user state to null
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    user,
    loading: authLoading, // Only use authLoading for the main loading state
    actionLoading, // Separate loading for login/register/logout actions
    error,
    login,
    register,
    signInWithGoogle,
    logout,
    clearError,
  };
};

// Helper function to convert Firebase error codes to user-friendly messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed. Please try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again.";
    default:
      return "An error occurred. Please try again.";
  }
};
