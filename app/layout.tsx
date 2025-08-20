import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SMB Assessment Platform',
  description: 'SMB business assessment and matching platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}