import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { User as NextAuthUser } from "next-auth";

export interface User extends NextAuthUser {}

export interface AuthSession {
  user: User | null;
  isLoading: boolean;
}

// Server-side session helper
export const getAuthSession = () => getServerSession(authConfig);
