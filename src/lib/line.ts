// src/lib/line.ts
import { Client, middleware, validateSignature, type MiddlewareConfig } from '@line/bot-sdk'

export function getLineConfig(): MiddlewareConfig {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelAccessToken) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  if (!channelSecret) throw new Error('LINE_CHANNEL_SECRET is not set')
  return { channelAccessToken, channelSecret }
}

// ใช้เฉพาะตอนต้องส่งข้อความ/ดึง media
export function getLineClient(): Client {
  const { channelAccessToken } = getLineConfig()
  return new Client({ channelAccessToken })
}

// (ใช้เฉพาะเมื่อต้องแนบเป็น Express-style middleware; ใน Next เราไม่ค่อยได้ใช้ตัวนี้)
export function getLineMiddleware() {
  return middleware(getLineConfig())
}

// ให้ route อื่นนำไปใช้ validate signature ได้
export { validateSignature }
