'use client'

import { useCart } from '@/lib/store/cart'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { lines, inc, dec, remove, total } = useCart()
  const router = useRouter()

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">ตะกร้าสินค้า</h1>

      {lines.length === 0 && <div className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</div>}

      <ul className="divide-y">
        {lines.map((l) => (
          <li key={l.menuId} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-sm text-gray-500">฿{l.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded border" onClick={() => dec(l.menuId)}>-</button>
              <div className="w-6 text-center">{l.qty}</div>
              <button className="px-2 py-1 rounded border" onClick={() => inc(l.menuId)}>+</button>
              <button className="ml-2 text-red-600" onClick={() => remove(l.menuId)}>ลบ</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between font-semibold">
        <span>รวม</span><span>฿{total()}</span>
      </div>

      <button
        disabled={lines.length === 0}
        onClick={() => router.push('/checkout')}
        className="w-full py-2 rounded-lg bg-brand-600 text-white disabled:opacity-50"
      >
        ยืนยันสั่งซื้อ
      </button>
    </main>
  )
}
