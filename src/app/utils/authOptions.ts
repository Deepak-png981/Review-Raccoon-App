import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { User } from "@/models/User";
import { connectDB } from "@/db/db";
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      console.log("JWT callback - trigger:", trigger);
    
      if (user) {
        token.id = user.id;
        console.log("JWT callback - user found:", user.id, user.email);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered for provider:", account?.provider);
      
      try {
        await connectDB();
        
        if (account?.provider === 'google') {
          const googleId = profile?.sub;
          const email = user.email;
          const name = user.name;
          
          if (!email || !googleId) {
            console.error("Missing required Google profile data", { email, googleId });
            return false;
          }
          
          console.log("Looking for existing user with email:", email);
          
          // Check if user already exists
          let existingUser = await User.findOne({ 
            $or: [
              { email: email },
              { googleId: googleId }
            ]
          });
          
          if (existingUser) {
            console.log("User found in database:", existingUser.userId);
            user.id = existingUser.userId;
            
            // Update user data if necessary
            if (existingUser.name !== name || existingUser.googleId !== googleId) {
              existingUser.name = name;
              existingUser.googleId = googleId;
              await existingUser.save();
              console.log("Updated existing user data");
            }
          } else {
            // Create new user
            const userId = uuidv4();
            console.log("Creating new user with userId:", userId);
            
            const newUser = await User.create({
              email,
              name,
              googleId,
              userId,
              createdAt: new Date()
            });
            
            console.log("New user created:", newUser.userId);
            user.id = newUser.userId;
          }
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
