import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Narrator - Transform Text into AI-Narrated Presentations',
  description:
    'Transform any text into structured presentations with natural AI voice narration. Built with Next.js, TypeScript, and Radix UI.',
  keywords: [
    'ai',
    'presentations',
    'text-to-speech',
    'tts',
    'openai',
    'claude',
    'voice-synthesis',
    'slides',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
