import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "./config";
import axios from "axios";

// Base URL for backend API
const API_BASE_URL = "http://localhost:3005";

// Sign in with Google using Firebase
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Send user data to backend for MongoDB storage
    const response = await axios.post(`${API_BASE_URL}/auth/firebase-google`, {
      idToken,
      userData: {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        profilePicture: user.photoURL,
        emailVerified: user.emailVerified
      }
    });

    // Store JWT token from backend
    if (response.data.token) {
      localStorage.setItem('FoodCustomerToken', response.data.token);
      localStorage.setItem('FoodCustomerUser', JSON.stringify(response.data.user));
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Authenticate with backend
    const response = await axios.post(`${API_BASE_URL}/auth/firebase-login`, {
      idToken,
      email: user.email
    });

    // Store JWT token from backend
    if (response.data.token) {
      localStorage.setItem('FoodCustomerToken', response.data.token);
      localStorage.setItem('FoodCustomerUser', JSON.stringify(response.data.user));
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

// Register with email and password
export const registerWithEmail = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with name
    await updateProfile(user, {
      displayName: name
    });

    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Send user data to backend for MongoDB storage
    await axios.post(`${API_BASE_URL}/auth/firebase-register`, {
      idToken,
      userData: {
        uid: user.uid,
        name: name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });

    return {
      success: true,
      message: "Registration successful. Please check your email for verification."
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('FoodCustomerToken');
    localStorage.removeItem('FoodCustomerUser');
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent successfully"
    };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
