import type { Metadata } from 'next'
import './globals.css'
import { GlobalErrorBoundaryProvider } from '@/components/GlobalErrorBoundary'
import Navbar from '@/components/Navbar'

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
      <body>
        <GlobalErrorBoundaryProvider>
          <Navbar />
          {children}
        </GlobalErrorBoundaryProvider>
      </body>
    </html>
  )
}
