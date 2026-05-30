/**
 * Firebase configuration & initialization.
 * These are publishable client keys — safe to ship in client code.
 * Firestore is intentionally not initialized here: the app uses mock data
 * via firestore.service.ts (no Firestore rules / seeding required yet).
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyB-0K0WAtl6bMnZsd7Hqan9kkaBXH2WqUA",
  authDomain: "privacy-app-aba91.firebaseapp.com",
  projectId: "privacy-app-aba91",
  storageBucket: "privacy-app-aba91.firebasestorage.app",
  messagingSenderId: "235144244942",
  appId: "1:235144244942:web:7b3b40ca8f14aa910f6a9f",
  measurementId: "G-3W59KGMTNE",
};

export const FIREBASE_READY = true;

export const firebaseApp: FirebaseApp =
  getApps()[0] ?? initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);
