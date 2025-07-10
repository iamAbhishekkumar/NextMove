"use client";

import { createContext, useContext } from "react";
import {
  SessionProvider,
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from "next-auth/react";
import type { Session } from "next-auth";

interface AuthContextType {
  user: Session["user"] | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const signIn = async () => {
    await nextSignIn("google");
  };

  const signOut = () => {
    nextSignOut();
  };

  const value: AuthContextType = {
    user: session?.user ?? null,
    isLoading: status === "loading",
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
