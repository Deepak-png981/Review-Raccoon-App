import '../index.css';

export const metadata = {
  title: 'Review Raccoon',
  description: 'AI-powered code review assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
