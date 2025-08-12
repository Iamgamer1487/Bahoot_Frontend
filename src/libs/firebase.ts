// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHcjRBM6LYcObw3eFFUayF3QDsRuExZks",
  authDomain: "bahoot-c7556.firebaseapp.com",
  projectId: "bahoot-c7556",
  storageBucket: "bahoot-c7556.firebasestorage.app",
  messagingSenderId: "679371693531",
  appId: "1:679371693531:web:6b7e5cd2d5957717321bfe",
  measurementId: "G-9Y2GMG5H2C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
