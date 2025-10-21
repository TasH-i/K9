import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          //  Parse allowed admin emails from .env
          const allowedAdmins = process.env.ALLOWED_ADMINS
            ? process.env.ALLOWED_ADMINS.split(",").map((email) => email.trim().toLowerCase())
            : [];

          console.log("Allowed admins:", allowedAdmins);
          console.log("Current user email:", user.email?.toLowerCase());


          const isAdmin =
            user.email && allowedAdmins.includes(user.email.toLowerCase());

          //  Check if user exists
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            //  Create new user for Google sign-in
            existingUser = await User.create({
              name: user.name || "",
              email: user.email,
              profilePicture: user.image || "",
              authProvider: "google",
              role: isAdmin ? "admin" : "user", 
            });
          } else {
            //  Update existing user if needed
            const updateData: any = {};

            // Update profile picture if changed
            if (user.image && existingUser.profilePicture !== user.image) {
              updateData.profilePicture = user.image;
            }

            // Ensure authProvider is set
            if (!existingUser.authProvider) {
              updateData.authProvider = "google";
            }

            //  Update role if user should be admin
            if (isAdmin && existingUser.role !== "admin") {
              updateData.role = "admin";
            }

            // Apply updates if needed
            if (Object.keys(updateData).length > 0) {
              existingUser = await User.findByIdAndUpdate(
                existingUser._id,
                updateData,
                { new: true }
              );
            }
          }

          return true;
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.role = dbUser.role; // Add role to token
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role ?? null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
