import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FounderVoice — A deck you can defend',
  description: 'Talk through the company. FounderVoice turns it into a deck, a model, and an FAQ that agree, and never invents a number.',
  generator: 'FounderVoice',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f6f8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
