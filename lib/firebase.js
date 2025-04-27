// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these values with your own from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCCNvACLQv55795fr8kK0AhtbjXkfRbeA0",
  authDomain: "libraryapp-8ecfe.firebaseapp.com",
  projectId: "libraryapp-8ecfe",
  storageBucket: "libraryapp-8ecfe.firebasestorage.app",
  messagingSenderId: "1000526687019",
  appId: "1:1000526687019:web:de9346714e063ff7c5736e",
  measurementId: "G-LXZGCYKMCZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
