import type { RoleName } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  role: RoleName;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
