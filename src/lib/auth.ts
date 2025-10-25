import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          // Find user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error("Invalid credentials")
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error("Account is inactive. Please contact administrator.")
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "")
          
          if (!isPasswordValid) {
            throw new Error("Invalid credentials")
          }

          // Update last login time
          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          role: token.role as "ADMIN" | "EMPLOYEE",
          email: token.email as string,
          name: token.name
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
}