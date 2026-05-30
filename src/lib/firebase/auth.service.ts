/**
 * Auth service backed by Firebase Auth.
 * Public API is unchanged — the rest of the app uses the same methods.
 */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FbUser,
} from "firebase/auth";
import { firebaseAuth } from "./config";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

function toAuthUser(u: FbUser): AuthUser {
  return {
    uid: u.uid,
    email: u.email ?? "",
    displayName: u.displayName ?? (u.email ? u.email.split("@")[0] : "User"),
    createdAt: u.metadata.creationTime ?? new Date().toISOString(),
    lastLogin: u.metadata.lastSignInTime ?? new Date().toISOString(),
  };
}

function friendlyError(e: unknown): Error {
  const code = (e as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/invalid-email": "That email address is invalid.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return new Error(map[code] ?? (e as Error)?.message ?? "Authentication error.");
}

let currentUser: AuthUser | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  onAuthStateChanged(firebaseAuth, (u) => {
    currentUser = u ? toAuthUser(u) : null;
    listeners.forEach((l) => l());
  });
}

export const authService = {
  getCurrentUser(): AuthUser | null {
    const u = firebaseAuth.currentUser;
    return u ? toAuthUser(u) : currentUser;
  },

  async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      return toAuthUser(cred.user);
    } catch (e) {
      throw friendlyError(e);
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return toAuthUser(cred.user);
    } catch (e) {
      throw friendlyError(e);
    }
  },

  async signOut(): Promise<void> {
    await fbSignOut(firebaseAuth);
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (e) {
      // Don't reveal whether the email exists.
      const code = (e as { code?: string })?.code;
      if (code === "auth/user-not-found") return;
      throw friendlyError(e);
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = firebaseAuth.currentUser;
    if (!user || !user.email) throw new Error("Not signed in.");
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await fbUpdatePassword(user, newPassword);
    } catch (e) {
      throw friendlyError(e);
    }
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
