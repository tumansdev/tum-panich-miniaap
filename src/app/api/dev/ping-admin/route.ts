// src/app/api/dev/ping-admin/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const to =
    process.env.LINE_ADMIN_GROUP_ID ||
    process.env.LINE_ADMIN_ROOM_ID ||
    process.env.LINE_ADMIN_USER_ID

  if (!to) return NextResponse.json({ ok: false, error: 'NO_ADMIN_TARGET' }, { status: 400 })

  // lazy init ที่นี่
  const { getLineClient } = await import('@/lib/line')
  const lineClient = getLineClient()

  await lineClient.pushMessage(to, [
    { type: 'text', text: '🔔 ทดสอบแจ้งเตือนจาก Mini App (admin group)' },
  ])

  return NextResponse.json({ ok: true })
}
