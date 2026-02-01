// app/layout.tsx

import React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

/* ===============================
   i18n (SERVER)
=============================== */
import { detectLocale } from "@/lib/i18n/detectLocale"
import { loadDictionary, type Locale } from "@/lib/i18n"
import { createTranslator } from "@/lib/i18n/runtime"

/* ===============================
   Fonts
=============================== */

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
})

/* ===============================
   Metadata
=============================== */

export const metadata: Metadata = {
  title: "Creator OS — Sell Digital Products",
  description:
    "A money-first Creator Operating System. Sell digital products and get paid — fast, clean, and with full trust.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0E1111",
  width: "device-width",
  initialScale: 1,
}

/* ===============================
   Root Layout (SERVER)
=============================== */

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* -------------------------------
     Locale + Dictionary (SERVER)
  -------------------------------- */

  // ✅ MUST await (cookies / headers are async)
  const locale: Locale = await detectLocale()

  const dictionary = loadDictionary(locale)

  // Translator created ONCE per request
  // (do NOT export / store globally)
  const t = createTranslator(dictionary)
  // NOTE: `t` intentionally not global

  return (
    <html lang={locale} className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}