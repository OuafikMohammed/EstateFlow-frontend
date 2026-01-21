import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

// Mock database - In production, use your real database
const MOCK_USERS: Record<
  string,
  {
    id: string;
    email: string;
    password: string;
    name: string;
    image?: string;
    role: "super_admin" | "company_admin" | "agent" | "client";
    companyId?: string;
    isActive: boolean;
  }
> = {
  "ahmed@acmerealty.ma": {
    id: "user-1",
    email: "ahmed@acmerealty.ma",
    password: "$2a$10$nOUIs5kJ7naTuTFkWK1Be.mk9GENudHf/r88K0DQr5T.uQZmy9enm", // Password123!
    name: "Ahmed Benjelloun",
    role: "company_admin",
    companyId: "company-1",
    isActive: true,
  },
  "sara@acmerealty.ma": {
    id: "user-2",
    email: "sara@acmerealty.ma",
    password: "$2a$10$nOUIs5kJ7naTuTFkWK1Be.mk9GENudHf/r88K0DQr5T.uQZmy9enm", // Password123!
    name: "Sara Alami",
    role: "agent",
    companyId: "company-1",
    isActive: true,
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = MOCK_USERS[credentials.email as string];

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.isActive) {
          throw new Error("User account is disabled");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=CredentialsSignin",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        const mockUser = MOCK_USERS[user.email || ""];
        if (mockUser) {
          token.role = mockUser.role;
          token.companyId = mockUser.companyId;
          token.isActive = mockUser.isActive;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
        (session.user as any).isActive = token.isActive;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

export default NextAuth(authOptions);
