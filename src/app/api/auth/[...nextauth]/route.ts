import NextAuth from 'next-auth';
import { authOptions } from './options';

// Pass the authOptions to NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 