/** Shared by server and client, so it pulls in nothing server-only. */
export type UserRole = "admin" | "operator" | "user";
export type Permission = "VIEW_ANALYTICS" | "MANAGE_ACCESS";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicSession = {
  user: SessionUser;
  permissions: Permission[];
};
