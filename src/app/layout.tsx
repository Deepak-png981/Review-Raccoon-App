/* eslint-disable react-refresh/only-export-components */
import '../index.css';
import { metadata, viewport } from './metadata';
import NextAuthProvider from './Providers';

export { metadata, viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <body className="min-h-screen">
          {children}
        </body>
      </NextAuthProvider>
    </html>
  )
}
