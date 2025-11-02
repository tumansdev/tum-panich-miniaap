import { NextResponse } from 'next/server'
import type { CartLine } from '@/lib/store/cart'

function makeId() {
  return 'O' + Date.now().toString(36)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { uid, displayName, lines, total, note } = body as {
    uid: string, displayName?: string, lines: CartLine[], total: number, note?: string
  }

  const orderId = makeId()

  // 1) บันทึก Firestore ถ้าพร้อม
  try {
    const { getAdminApp } = await import('@/lib/firebase.server')
    const { db } = getAdminApp()
    await db.collection('orders').doc(orderId).set({
      uid, displayName: displayName || '', lines, total, note: note || '',
      status: 'pending', delivery: { method: 'pickup' },
      createdAt: Date.now(), updatedAt: Date.now()
    }, { merge: true })
  } catch {
    // ยังไม่ตั้ง Firebase ก็ข้ามได้
  }

  // 2) Push Flex สรุปออเดอร์ + QR (ถ้าพร้อม LINE)
  const noLine = process.env.DEV_MODE_NO_LINE === '1'
  if (!noLine) {
    try {
      const { lineClient } = await import('@/lib/line')
      const { orderSummaryFlex } = await import('@/lib/flex')
      const flex = orderSummaryFlex({ orderId, uid, lines, total, shopName: 'ร้านตั้มพานิช' })
      await lineClient.pushMessage(uid, [flex])
      // แจ้งกลุ่มแอดมิน (ถ้าตั้งค่า)
      const to = process.env.LINE_ADMIN_GROUP_ID || process.env.LINE_ADMIN_ROOM_ID || process.env.LINE_ADMIN_USER_ID
      if (to) await lineClient.pushMessage(to, [{ type: 'text', text: `🛎️ ออเดอร์ใหม่ #${orderId} จาก ${displayName || uid} รวม ${total} บาท` }])
    } catch (e) {
      // ถ้าคีย์ LINE ไม่ครบ จะมาที่นี่
      console.warn('Skip LINE push (not configured):', e)
    }
  } else {
    // DEV: log ให้เห็นใน terminal
    console.log('[DEV] create order', { orderId, uid, total, lines })
  }

  return NextResponse.json({ ok: true, orderId })
}
