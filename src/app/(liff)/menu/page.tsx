'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { MenuItem } from '@/lib/types'
import { useCart } from '@/lib/store/cart'
import { liffInitAndGetProfile } from '../liff-client'

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const add = useCart((s) => s.addLine)

  useEffect(() => {
    ;(async () => {
      try {
        const profile = await liffInitAndGetProfile()
        if (profile?.userId) {
          sessionStorage.setItem('tp-uid', profile.userId)
          sessionStorage.setItem('tp-displayName', profile.displayName || '')
        }

        const r = await fetch('/api/menus')
        if (!r.ok) {
          setError(`โหลดเมนูไม่สำเร็จ (${r.status})`)
          setLoading(false)
          return
        }
        const d = await r.json()
        setMenus(d.menus || [])
      } catch (e: any) {
        setError(e?.message || 'เกิดข้อผิดพลาด')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">เมนูร้านตั้มพานิช</h1>
      {loading && <div>กำลังโหลดเมนู...</div>}
      {error && <div className="text-red-600">⚠ {error}</div>}

      <div className="grid grid-cols-2 gap-3">
        {menus.map((m) => (
          <div key={m.id} className="rounded-xl border p-3">
            {m.imageUrl ? (
              <Image
                src={m.imageUrl}
                alt={m.name}
                width={600}
                height={400}
                className="rounded-lg aspect-video object-cover"
              />
            ) : (
              <div className="aspect-video rounded-lg bg-gray-100" />
            )}
            <div className="mt-2 font-semibold">{m.name}</div>
            <div className="text-sm text-gray-500">฿{m.price}</div>
            <button
              className="mt-2 w-full rounded-lg bg-brand-600 text-white py-2"
              onClick={() => add({ menuId: m.id, name: m.name, price: m.price })}
            >
              เพิ่ม
            </button>
          </div>
        ))}
      </div>

      <a href="/cart" className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow">
        ตะกร้า
      </a>
    </main>
  )
}
