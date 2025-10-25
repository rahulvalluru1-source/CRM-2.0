import { DefaultSession } from "next-auth"

type UserRole = "ADMIN" | "EMPLOYEE"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      email: string
      name?: string | null
    }
  }

  interface User {
    id: string
    role: UserRole
    email: string
    name?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    email: string
    name?: string | null
  }
}