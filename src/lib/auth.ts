import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

export interface AuthSession {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isLoading: boolean;
}
// Server-side session helper
export const getAuthSession = () => getServerSession(authConfig);
