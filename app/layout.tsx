import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SkillMap',
  description: 'SkillMap - personalized learning and skills analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon - replace with your file in /public if needed */}
        <link rel="icon" href="/placeholder-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
