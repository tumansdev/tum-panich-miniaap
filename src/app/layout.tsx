import './globals.css'
import type { ReactNode } from 'react'

export const metadata = { title: 'ร้านตั้มพานิช · Mini App' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-md p-4">{children}</div>
      </body>
    </html>
  )
}
