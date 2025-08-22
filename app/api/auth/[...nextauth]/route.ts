import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";

type UserDoc = {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onboarding?: boolean;
  domain?: string | null;
  onboardingData?: any;
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Return user without password, ensuring all required fields are present
          const { password: _, ...userWithoutPassword } = user.toObject();
          
          // Ensure the user object has all required fields with defaults
          return {
            id: userWithoutPassword._id.toString(),
            email: userWithoutPassword.email,
            firstName: userWithoutPassword.firstName,
            lastName: userWithoutPassword.lastName,
            phone: userWithoutPassword.phone,
            onboarding: userWithoutPassword.onboarding || false,
            domain: userWithoutPassword.domain || null,
            onboardingData: userWithoutPassword.onboardingData || null
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      console.log("JWT callback triggered:", { hasUser: !!user, hasToken: !!token, tokenKeys: token ? Object.keys(token) : [] });
      if (user) {
        console.log("JWT callback - user object:", user);
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.onboarding = user.onboarding || false;
        token.domain = user.domain || null;
        token.onboardingData = user.onboardingData || null;
        console.log("JWT callback - token updated:", token);
      } else {
        console.log("JWT callback - no user, token:", token);
        // Refresh token fields from DB to reflect latest user state (e.g., onboarding changes)
        try {
          const email = token.email as string | undefined;
          if (email) {
            await dbConnect();
            const dbUser = await User.findOne({ email }).lean<UserDoc | null>();
            if (dbUser) {
              token.id = (dbUser._id as any)?.toString?.() || token.id;
              token.firstName = dbUser.firstName ?? token.firstName;
              token.lastName = dbUser.lastName ?? token.lastName;
              token.phone = dbUser.phone ?? token.phone;
              token.onboarding = Boolean(dbUser.onboarding);
              token.domain = dbUser.domain ?? null;
              token.onboardingData = dbUser.onboardingData ?? null;
            }
          }
        } catch (e) {
          console.error("JWT DB sync error:", e);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log("Session callback triggered:", { hasSession: !!session, hasToken: !!token, sessionKeys: session ? Object.keys(session) : [] });
      if (token) {
        console.log("Session callback - token object:", token);
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.onboarding = token.onboarding as boolean || false;
        session.user.domain = token.domain as string || null;
        session.user.onboardingData = token.onboardingData as any || null;
        console.log("Session callback - session updated:", session);
      } else {
        console.log("Session callback - no token, session:", session);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
