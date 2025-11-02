'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/store/cart'
import { getLineUid } from '@/lib/liff'

export default function CheckoutPage() {
  const lines = useCart(s => s.lines)
  const clear = useCart(s => s.clear)
  const [status, setStatus] = useState<'idle'|'creating'|'done'|'error'>('idle')
  const [msg, setMsg] = useState('')

  useEffect(() => { (async () => {
    if (!lines.length) { setMsg('ตะกร้่าว่าง'); return }
    setStatus('creating')
    try {
      const uid = await getLineUid()
      const total = lines.reduce((s, it) => s + it.qty * it.price, 0)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, displayName: 'ลูกค้าตั้มพานิช', lines, total })
      })
      const data = await res.json()
      if (data.ok) {
        setStatus('done')
        setMsg(`สร้างออเดอร์ #${data.orderId} สำเร็จ (ดูสรุปใน LINE)`)
        clear()
      } else {
        setStatus('error')
        setMsg('สร้างออเดอร์ไม่สำเร็จ')
      }
    } catch (e:any) {
      setStatus('error')
      setMsg(e?.message || 'เกิดข้อผิดพลาด')
    }
  })() }, [])  // run once

  return (
    <div className="py-10 text-center">
      {status === 'creating' && <div>กำลังสร้างออเดอร์...</div>}
      {status !== 'creating' && <div>{msg}</div>}
    </div>
  )
}
