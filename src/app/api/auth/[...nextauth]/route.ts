import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models/User";
import { connectDB } from "@/db/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        const  dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          const newDbUser = await User.create({
            email: user.email,
            name: user.name,
            googleId: profile?.sub || "",
            userId: user.id,
          });
          user.id = newDbUser.userId;
        } else {
          user.id = dbUser.userId;
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };