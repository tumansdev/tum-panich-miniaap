import type { ReactNode } from 'react'

export const metadata = { title: 'สั่งอาหาร · ร้านตั้มพานิช' }

export default function LiffLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="h-8 w-8 rounded-full" />
          <div className="font-semibold">ร้านตั้มพานิช</div>
        </div>
      </header>
      <div className="mx-auto max-w-md p-4">{children}</div>
    </main>
  )
}
