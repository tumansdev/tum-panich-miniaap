import { NextResponse } from 'next/server'
import { lineClient } from '@/lib/line'

export async function POST() {
  const to =
    process.env.LINE_ADMIN_GROUP_ID ||
    process.env.LINE_ADMIN_ROOM_ID ||
    process.env.LINE_ADMIN_USER_ID
  if (!to) return NextResponse.json({ ok: false, error: 'NO_ADMIN_TARGET' }, { status: 400 })

  await lineClient.pushMessage(to, [{ type: 'text', text: '🔔 ทดสอบแจ้งเตือนจาก Mini App (admin group)' }])
  return NextResponse.json({ ok: true })
}
