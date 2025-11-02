'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { MenuItem } from '@/lib/types'
import { useCart } from '@/lib/store/cart'

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const add = useCart(s => s.add)
  const totalQty = useCart(s => s.lines.reduce((a,b)=>a+b.qty,0))

  useEffect(() => {
    fetch('/api/menus').then(r=>r.json()).then(d=>setMenus(d.menus || []))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">เมนูวันนี้</h1>
      <div className="grid grid-cols-2 gap-3">
        {menus.map(m => (
          <div key={m.id} className="rounded-xl border p-3">
            {m.imageUrl && (
              <Image src={m.imageUrl} alt={m.name} width={400} height={300} className="rounded-lg" />
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

      <a
        href="/cart"
        className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg"
      >
        ตะกร้า ({totalQty})
      </a>
    </div>
  )
}
