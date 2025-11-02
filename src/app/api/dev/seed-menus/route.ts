import { NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebase.server'

export async function POST() {
  const { db } = getAdminApp()
  const items = [
    { name: 'ข้าวหมูแดง', price: 55, category: 'ข้าว', available: true },
    { name: 'บะหมี่หมูแดง', price: 55, category: 'ก๋วยเตี๋ยว', available: true },
    { name: 'ชาดำเย็น', price: 25, category: 'เครื่องดื่ม', available: true },
  ]
  const batch = db.batch()
  items.forEach((it) => {
    const ref = db.collection('menus').doc()
    batch.set(ref, { ...it, createdAt: Date.now(), updatedAt: Date.now() })
  })
  await batch.commit()
  return NextResponse.json({ ok: true, count: items.length })
}
