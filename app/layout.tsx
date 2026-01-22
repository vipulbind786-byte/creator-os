import React from "react"
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading"
})

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: 'Creator OS — Sell Digital Products',
  description: 'A money-first Creator Operating System. Sell digital products and get paid — fast, clean, and with full trust.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0E1111',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
