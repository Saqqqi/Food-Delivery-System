// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAggQPOmpSuNV8Eux5eEd5P1waWn9APRHU",
  authDomain: "oheee-f0367.firebaseapp.com",
  projectId: "oheee-f0367",
  storageBucket: "oheee-f0367.firebasestorage.app",
  messagingSenderId: "749748958255",
  appId: "1:749748958255:web:54afff75a0f3b5af1e82da",
  measurementId: "G-RCKTKRK5RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
