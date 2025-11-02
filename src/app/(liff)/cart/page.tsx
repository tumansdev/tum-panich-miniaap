'use client'
import { useCart } from '@/lib/store/cart'

export default function CartPage() {
  const { lines, inc, dec, remove } = useCart()
  const total = lines.reduce((s, it) => s + it.qty * it.price, 0)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ตะกร้าของฉัน</h1>
      {lines.length === 0 && <div className="text-gray-500">ยังไม่มีรายการ</div>}

      <ul className="divide-y">
        {lines.map(l => (
          <li key={l.menuId} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-sm text-gray-500">฿{l.price} × {l.qty}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => dec(l.menuId)}>-</button>
              <button className="px-2 py-1 border rounded" onClick={() => inc(l.menuId)}>+</button>
              <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(l.menuId)}>ลบ</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between font-bold text-lg">
        <span>รวม</span><span>฿{total}</span>
      </div>

      <a href="/checkout" className="block text-center w-full py-3 rounded-lg bg-brand-600 text-white">
        ยืนยันสั่งซื้อ
      </a>
    </div>
  )
}
