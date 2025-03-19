import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Review Raccoon',
  description: 'AI-powered code review tool',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
} 