// lib/authOptions.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

const authOptions: AuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            throw new Error("No user found with this email");
          }

          // Check if password matches
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar || null,
            role: user.role || "user",
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  // Callbacks for session and JWT handling
  callbacks: {
    // JWT callback - runs when JWT is created or updated
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = (user as any).role || "user";
      }

      // Handle OAuth signin
      if (account && account.provider === "google") {
        try {
          await dbConnect();

          let dbUser = await User.findOne({ email: token.email });

          if (!dbUser) {
            // Create new user from Google OAuth
            dbUser = await User.create({
              email: token.email,
              name: token.name,
              avatar: token.picture,
              provider: "google",
              isEmailVerified: true,
              role: "user",
            });
          } else if (!dbUser.provider || dbUser.provider !== "google") {
            // Update existing user with Google provider if not already set
            dbUser.provider = "google";
            dbUser.avatar = token.picture;
            dbUser.isEmailVerified = true;
            await dbUser.save();
          }

          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
        } catch (error) {
          console.error("Error handling Google OAuth:", error);
        }
      }

      return token;
    },

    // Session callback - runs when session is requested
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },

    // SignIn callback - runs on signin
    async signIn({ user, account, profile, email, credentials }) {
      try {
        await dbConnect();

        // For OAuth providers
        if (account?.provider === "google" && profile) {
          let dbUser = await User.findOne({ email: profile.email });

          if (!dbUser) {
            // Create new user
            dbUser = await User.create({
              email: profile.email,
              name: profile.name,
              avatar: (profile as any).picture,
              provider: account.provider,
              isEmailVerified: true,
              role: "user",
            });
          }

          return true;
        }

        // For credentials provider
        if (credentials) {
          const dbUser = await User.findOne({ email: user.email });
          return !!dbUser;
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    // Redirect callback - runs on redirect
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "120") * 60, // Convert to seconds
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Pages configuration
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut() {
      console.log("User signed out");
    },
    async session({ session, token }) {
      // Session created or updated
      if (session?.user) {
        console.error("Session error occurred");
      }
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;