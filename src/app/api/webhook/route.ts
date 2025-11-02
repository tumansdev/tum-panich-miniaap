// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebase.server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('x-line-signature') || ''

  // lazy import เพื่ออ่าน env ตอนรันจริง
  const [{ getLineConfig, validateSignature, getLineClient, getLineMiddleware }, { chooseDeliveryFlex, deliveryFormFlex }] =
    await Promise.all([import('@/lib/line'), import('@/lib/flex')])

  const { channelSecret } = getLineConfig()
  const ok = validateSignature(raw, channelSecret, signature)
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 })

  const body = JSON.parse(raw)
  const events = body.events || []
  const { db, bucket } = getAdminApp()
  const lineClient = getLineClient()

  for (const ev of events) {
    const source = ev.source
    const uid = (source?.userId as string) || ''

    if (ev.type === 'postback') {
      const params = Object.fromEntries(new URLSearchParams(ev.postback?.data || '')) as any
      if (params.action === 'choose_delivery') {
        await lineClient.replyMessage(ev.replyToken!, [chooseDeliveryFlex(params.orderId)])
      }
      if (params.action === 'delivery') {
        await lineClient.replyMessage(ev.replyToken!, [deliveryFormFlex(params.orderId, params.method)])
        await db.collection('orders').doc(params.orderId).set(
          { delivery: { method: params.method }, updatedAt: Date.now() },
          { merge: true },
        )
      }
    }

    if (ev.type === 'message') {
      if (ev.message.type === 'image') {
        const { getMessageContent } = await import('@/lib/line')
        const buf = await getMessageContent(ev.message.id)
        const filename = `slips/${uid}/${Date.now()}.jpg`
        const file = bucket.file(filename)
        await file.save(buf, { contentType: 'image/jpeg', public: true })
        const slipUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

        const snap = await db
          .collection('orders')
          .where('uid', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()

        if (!snap.empty) {
          const ref = snap.docs[0].ref
          await ref.set({ slipUrl, updatedAt: Date.now() }, { merge: true })
          await lineClient.replyMessage(ev.replyToken!, [{ type: 'text', text: '📸 ได้รับสลิปแล้ว รอตรวจสอบสักครู่ครับ' }])

          const to =
            process.env.LINE_ADMIN_GROUP_ID ||
            process.env.LINE_ADMIN_ROOM_ID ||
            process.env.LINE_ADMIN_USER_ID
          if (to) {
            await lineClient.pushMessage(to, [{ type: 'text', text: `มีสลิปใหม่จาก ${uid} – ตรวจสอบในหลังบ้านได้เลย` }])
          }
        }
      }

      if (ev.message.type === 'location') {
        const lat = ev.message.latitude
        const lng = ev.message.longitude
        const snap = await db
          .collection('orders')
          .where('uid', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()
        if (!snap.empty) {
          await snap.docs[0].ref.set(
            { delivery: { ...(snap.docs[0].data().delivery || {}), lat, lng }, updatedAt: Date.now() },
            { merge: true },
          )
          await lineClient.replyMessage(ev.replyToken!, [{ type: 'text', text: '✅ รับตำแหน่งแล้ว กำลังคำนวณระยะทางให้ครับ' }])
        }
      }

      if (ev.message.type === 'text') {
        const text = ev.message.text
        const snap = await db
          .collection('orders')
          .where('uid', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()
        if (!snap.empty) {
          const d = snap.docs[0].data()
          const delivery = d.delivery || {}
          const merged: any = { ...delivery }
          if (/\d{9,11}/.test(text)) merged.phone = text.match(/\d{9,11}/)?.[0]
          if (/[อ-ฮA-Za-z].+/.test(text)) merged.address = text
          await snap.docs[0].ref.set({ delivery: merged, updatedAt: Date.now() }, { merge: true })
          await lineClient.replyMessage(ev.replyToken!, [{ type: 'text', text: 'บันทึกข้อมูลจัดส่งเรียบร้อยครับ' }])
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
