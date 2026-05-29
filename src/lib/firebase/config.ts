/**
 * Firebase configuration placeholder.
 *
 * INTEGRATION POINT: When the project owner provides the Firebase project,
 * paste the firebaseConfig values below (these are publishable client keys
 * and safe to ship in client code). Then swap the mock implementations in
 * ./auth.service.ts and ./firestore.service.ts for real Firebase SDK calls.
 *
 * Install:   bun add firebase
 * Then:
 *   import { initializeApp } from "firebase/app";
 *   import { getAuth } from "firebase/auth";
 *   import { getFirestore } from "firebase/firestore";
 *   export const app = initializeApp(firebaseConfig);
 *   export const auth = getAuth(app);
 *   export const db = getFirestore(app);
 */
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE.firebaseapp.com",
  projectId: "REPLACE",
  storageBucket: "REPLACE.appspot.com",
  messagingSenderId: "REPLACE",
  appId: "REPLACE",
};

export const FIREBASE_READY = false;
