import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      hasGithubConnected?: boolean;
      organizationId?: string;
      provider?: 'google' | 'github';
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    provider?: 'google' | 'github';
    hasGithubConnected?: boolean;
    organizationId?: string;
  }

  /**
   * Extend the JWT type
   */
  interface JWT {
    id?: string;
    organizationId?: string;
    provider?: 'google' | 'github';
  }
} 