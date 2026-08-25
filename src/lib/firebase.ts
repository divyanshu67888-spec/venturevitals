import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBotwoDlGc8J-zNXL2oz05cm9zV5V2LfMM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "venturevitals-9420e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "venturevitals-9420e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "venturevitals-9420e.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "779229771243",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:779229771243:web:54c9f815d806053388d5ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
