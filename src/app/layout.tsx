import '../index.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Raccoon',
  description: 'AI-powered code review assistant',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
