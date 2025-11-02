// src/lib/line.ts
import {
  Client,
  middleware,
  validateSignature,
  type MiddlewareConfig,
} from '@line/bot-sdk'

export function getLineConfig(): MiddlewareConfig {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelAccessToken) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  if (!channelSecret) throw new Error('LINE_CHANNEL_SECRET is not set')
  return { channelAccessToken, channelSecret }
}

export function getLineClient(): Client {
  const { channelAccessToken } = getLineConfig()
  return new Client({ channelAccessToken })
}

export function getLineMiddleware() {
  return middleware(getLineConfig())
}

export { validateSignature }

/** ดึงไฟล์ media (เช่น สลิป) จาก messageId แล้วรวม stream เป็น Buffer */
export async function getMessageContent(messageId: string): Promise<Buffer> {
  const client = getLineClient()
  const stream = await client.getMessageContent(messageId)
  const chunks: Buffer[] = []
  for await (const c of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(c))
  }
  return Buffer.concat(chunks)
}
