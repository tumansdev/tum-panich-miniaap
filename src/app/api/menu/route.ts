import { NextResponse } from 'next/server'

const MOCK = [
  { id: 'M001', name: 'ข้าวหมูแดง', price: 55, category: 'ข้าว', available: true, imageUrl: '/logo.png' },
  { id: 'M002', name: 'ก๋วยเตี๋ยวต้มยำ', price: 50, category: 'ก๋วยเตี๋ยว', available: true, imageUrl: '/logo.png' },
  { id: 'M003', name: 'หมูกรอบจิ้มแจ่ว', price: 85, category: 'ของทานเล่น', available: true, imageUrl: '/logo.png' },
]

export async function GET() {
  try {
    const { getAdminApp } = await import('@/lib/firebase.server')
    const { db } = getAdminApp()
    const snap = await db.collection('menus').where('available', '==', true).orderBy('updatedAt', 'desc').get()
    if (snap.empty) {
      return NextResponse.json({ ok: true, menus: MOCK, note: 'fallback: mock menus' })
    }
    const menus = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ ok: true, menus })
  } catch (e) {
    // ยังไม่ตั้ง Firebase → ใช้เมนู mock ชั่วคราว
    return NextResponse.json({ ok: true, menus: MOCK, note: 'fallback: mock menus' })
  }
}
