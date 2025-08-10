import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SkillMap',
  description: 'SkillMap - Your AI-powered skill assessment tool',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/skillmap-logo.png" type="image/png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
