'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/store/cart'

export default function CheckoutPage() {
  const { lines, total, clear } = useCart()
  const [msg, setMsg] = useState('กำลังสร้างออเดอร์...')

  useEffect(() => {
    ;(async () => {
      try {
        const uid = sessionStorage.getItem('tp-uid') || 'DUMMY-UID'
        const displayName = sessionStorage.getItem('tp-displayName') || 'ลูกค้าตั้มพานิช'
        const body = {
          uid,
          displayName,
          lines,
          total: total(),
          note: '',
        }
        const r = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const d = await r.json()
        if (d.ok) {
          setMsg(`สร้างออเดอร์ #${d.orderId} สำเร็จ — กรุณาตรวจแชท LINE เพื่อสรุปออเดอร์และ QR ชำระเงิน`)
          clear()
        } else {
          setMsg('มีข้อผิดพลาดขณะสร้างออเดอร์')
        }
      } catch (err: any) {
        setMsg('มีข้อผิดพลาด: ' + (err?.message || 'unknown'))
      }
    })()
  }, [clear, lines, total])

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">เช็คเอาต์</h1>
      <p>{msg}</p>
      <a className="text-brand-700 underline" href="/menu">← กลับไปหน้าเมนู</a>
    </main>
  )
}
