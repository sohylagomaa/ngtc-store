import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3MByFEQLRqTKV3op_c6IrUn7AkrDyQAE",
  authDomain: "ngtc-reviews.firebaseapp.com",
  projectId: "ngtc-reviews",
  storageBucket: "ngtc-reviews.firebasestorage.app",
  messagingSenderId: "1096235570658",
  appId: "1:1096235570658:web:dddedd6ed975a3b423d5bb"
};

// تهيئة Firebase (تجنب التكرار في Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);