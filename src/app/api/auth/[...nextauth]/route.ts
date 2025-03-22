import NextAuth, { NextAuthOptions, Session as NextAuthSession, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT as NextAuthJWT } from "next-auth/jwt"
import { Account } from "next-auth"
interface Session extends NextAuthSession {
  accessToken?: string;
}
interface JWT extends NextAuthJWT {
  accessToken?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: user.id
            }),
          });

          if (response.ok) {
            return true;
          }
          console.error("Failed to create user:", await response.text());
          return false;
        } catch (error) {
          console.error("Error occurred while creating user:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
      if (account && user) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


