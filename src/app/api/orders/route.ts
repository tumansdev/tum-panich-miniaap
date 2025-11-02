// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebase.server'

export async function POST(req: Request) {
  const body = await req.json()
  const { uid, displayName, lines, total, note } = body
  const { db } = getAdminApp()

  const doc = await db.collection('orders').add({
    uid,
    displayName,
    lines,
    total,
    note: note || '',
    status: 'pending',
    delivery: { method: 'pickup' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  const orderId = doc.id

  // lazy import เพื่อเลี่ยงสร้าง client ตอน build
  const [{ getLineClient }, { orderSummaryFlex }] = await Promise.all([
    import('@/lib/line'),
    import('@/lib/flex'),
  ])
  const lineClient = getLineClient()
  const summary = orderSummaryFlex({
    orderId,
    uid,
    lines,
    total,
    shopName: 'ร้านตั้มพานิช',
  })

  await lineClient.pushMessage(uid, [summary])

  const to =
    process.env.LINE_ADMIN_GROUP_ID ||
    process.env.LINE_ADMIN_ROOM_ID ||
    process.env.LINE_ADMIN_USER_ID
  if (to) {
    await lineClient.pushMessage(to, [
      {
        type: 'text',
        text: `🛎️ ออเดอร์ใหม่ #${orderId} จาก ${displayName || uid} รวม ${total} บาท`,
      },
    ])
  }

  return NextResponse.json({ ok: true, orderId })
}
