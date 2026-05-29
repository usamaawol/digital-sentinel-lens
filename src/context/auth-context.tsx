import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type AuthUser } from "@/lib/firebase/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setLoading(false);
    return authService.subscribe(() => setUser(authService.getCurrentUser()));
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signIn: async (email, password) => {
      await authService.signIn(email, password);
    },
    signUp: async (email, password, displayName) => {
      await authService.signUp(email, password, displayName);
    },
    signOut: async () => {
      await authService.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
