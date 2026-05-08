import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { DevErrorFilter } from '@/components/DevErrorFilter.client'

export const metadata: Metadata = {
  title: 'Bola Na - Realtime Chat',
  description: 'Private realtime chat application for friends',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <DevErrorFilter />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
