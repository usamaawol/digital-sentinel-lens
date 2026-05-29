/**
 * Auth service abstraction. Mock implementation backed by localStorage.
 * Swap internals for Firebase Auth (signInWithEmailAndPassword, etc.) when
 * Firebase is wired up — the public API stays identical.
 */

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

const STORAGE_KEY = "pg_auth_user";
const USERS_KEY = "pg_auth_users";

type StoredUser = AuthUser & { password: string };

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const authService = {
  getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
    await delay(400);
    const users = readUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error("An account with that email already exists.");
    }
    const now = new Date().toISOString();
    const user: StoredUser = {
      uid: crypto.randomUUID(),
      email,
      displayName,
      password,
      createdAt: now,
      lastLogin: now,
    };
    users.push(user);
    writeUsers(users);
    const { password: _pw, ...publicUser } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(publicUser));
    notify();
    return publicUser;
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    await delay(400);
    const users = readUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password.");
    user.lastLogin = new Date().toISOString();
    writeUsers(users);
    const { password: _pw, ...publicUser } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(publicUser));
    notify();
    return publicUser;
  },

  async signOut(): Promise<void> {
    await delay(150);
    localStorage.removeItem(STORAGE_KEY);
    notify();
  },

  async resetPassword(email: string): Promise<void> {
    await delay(400);
    // Mock: in real Firebase, sendPasswordResetEmail(auth, email)
    const users = readUsers();
    if (!users.find((u) => u.email === email)) {
      // Don't reveal existence — but for the mock, surface a helpful message.
      return;
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await delay(300);
    const current = this.getCurrentUser();
    if (!current) throw new Error("Not signed in.");
    const users = readUsers();
    const idx = users.findIndex((u) => u.uid === current.uid);
    if (idx === -1) throw new Error("User not found.");
    if (users[idx].password !== currentPassword) throw new Error("Current password is incorrect.");
    users[idx].password = newPassword;
    writeUsers(users);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
