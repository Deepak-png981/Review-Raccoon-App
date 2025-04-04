import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Review Raccoon",
  description: "Sign in to your Review Raccoon account",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 