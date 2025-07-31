// Import only what you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// Firebase config (safe for test/development use only)
const firebaseConfig = {
  apiKey: "AIzaSyCzWYiWckRSV32KyVXVOlTZypLAIBCOizY",
  authDomain: "chat-app-9349a.firebaseapp.com",
  databaseURL: "https://chat-app-9349a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-app-9349a",
  storageBucket: "chat-app-9349a.appspot.com",
  messagingSenderId: "614895229165",
  appId: "1:614895229165:web:a18c53b22803feb79614e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export only Realtime Database
export const db = getDatabase(app);
export const storage = getStorage(app); 
// Don't export Firebase Auth (we’re using backend auth now)
export default app;

export const auth = getAuth(app);