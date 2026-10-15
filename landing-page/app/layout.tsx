import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FounderVoice — Fundraising readiness infrastructure',
  description: 'Turn rambling founder thinking into an investor-ready truth with a verified Claim Graph, deck, model, and FAQ.',
  generator: 'FounderVoice',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f6f8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
