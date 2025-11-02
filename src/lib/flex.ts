// src/lib/flex.ts
import type { FlexMessage } from '@line/bot-sdk'
import type { CartLine, DeliveryMethod, Order } from './types'

export function fmtTHB(n: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(n)
}

function publicUrl(path: string) {
  // ใช้ BASE_URL ถ้ามี (production), ไม่งั้นให้ใช้ path แบบ /qr-payment.png
  const base = process.env.BASE_URL?.replace(/\/$/, '')
  return base ? `${base}${path}` : path
}

/** ---------- 1) สรุปออเดอร์ + QR + ปุ่มเลือกจัดส่ง + Quick Reply อัปสลิป ---------- */
export function orderSummaryFlex(opts: {
  orderId: string
  uid: string
  lines: CartLine[]
  total: number
  shopName: string
}): FlexMessage {
  const items = opts.lines.map((l) => ({
    type: 'box',
    layout: 'horizontal',
    contents: [
      { type: 'text', text: `${l.name} x${l.qty}`, size: 'sm', color: '#111', flex: 3 },
      { type: 'text', text: fmtTHB(l.price * l.qty), size: 'sm', align: 'end', flex: 1 },
    ],
  }))

  return {
    type: 'flex',
    altText: `สรุปออเดอร์ #${opts.orderId}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: publicUrl('/logo.png'),
        size: 'full',
        aspectMode: 'cover',
        aspectRatio: '16:9',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          { type: 'text', text: opts.shopName, weight: 'bold', size: 'lg' },
          { type: 'text', text: `ออเดอร์ของคุณ ${opts.uid}`, size: 'sm', color: '#6b7280' },
          { type: 'separator' },
          ...items,
          { type: 'separator' },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'รวม', weight: 'bold' },
              { type: 'text', text: fmtTHB(opts.total), align: 'end', weight: 'bold' },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: 'ชำระโดยสแกน QR ด้านล่าง แล้วอัปโหลดสลิปได้เลย',
                size: 'sm',
                wrap: true,
              },
              { type: 'image', url: publicUrl('/qr-payment.png'), size: 'full' },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#f97316',
            action: {
              type: 'postback',
              label: 'เลือกวิธีจัดส่ง',
              data: `action=choose_delivery&orderId=${encodeURIComponent(opts.orderId)}`,
            },
          },
        ],
      },
      quickReply: {
        items: [
          { type: 'action', action: { type: 'camera', label: 'ถ่ายสลิป' } },
          { type: 'action', action: { type: 'cameraRoll', label: 'อัปโหลดสลิป' } },
        ],
      },
    },
  }
}

/** ---------- 2) เลือกวิธีจัดส่ง ---------- */
export function chooseDeliveryFlex(orderId: string): FlexMessage {
  return {
    type: 'flex',
    altText: 'เลือกวิธีจัดส่ง',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          { type: 'text', text: 'ต้องการจัดส่งแบบไหนดีครับ?', weight: 'bold', size: 'lg' },
          { type: 'text', text: 'เลือกรูปแบบด้านล่าง', size: 'sm', color: '#6b7280' },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'postback',
              label: 'มารับที่ร้านเอง',
              data: `action=delivery&orderId=${encodeURIComponent(orderId)}&method=pickup`,
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: '#16a34a',
            action: {
              type: 'postback',
              label: 'ส่งฟรีโดยทางร้าน 2 กม.',
              data: `action=delivery&orderId=${encodeURIComponent(orderId)}&method=shop-free-2km`,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            action: {
              type: 'postback',
              label: 'ส่งผ่าน Easy Delivery',
              data: `action=delivery&orderId=${encodeURIComponent(orderId)}&method=easy-delivery`,
            },
          },
        ],
      },
    },
  }
}

/** ---------- 3) ฟอร์ม/คำแนะนำให้ลูกค้ากรอกข้อมูลจัดส่ง ---------- */
export function deliveryFormFlex(orderId: string, method: DeliveryMethod): FlexMessage {
  const hints =
    method === 'pickup'
      ? 'กรุณาบอกเวลามารับโดยประมาณ'
      : method === 'shop-free-2km'
      ? 'แชร์โลเคชันบ้านของคุณ และกรอกที่อยู่/เบอร์'
      : 'กรอกชื่อ ที่อยู่ เบอร์โทร เพื่อส่งผ่าน Easy Delivery (ค่าส่งเก็บปลายทาง)'

  return {
    type: 'flex',
    altText: 'กรอกข้อมูลจัดส่ง',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          { type: 'text', text: 'ข้อมูลจัดส่ง', weight: 'bold', size: 'lg' },
          { type: 'text', text: hints, size: 'sm', wrap: true },
          {
            type: 'text',
            text: 'ส่งข้อความพิมพ์: ชื่อ, เบอร์, ที่อยู่ หรือแชร์ Location ในแชทนี้',
            size: 'xs',
            color: '#6b7280',
            wrap: true,
          },
        ],
      },
      quickReply: { items: [{ type: 'action', action: { type: 'location', label: 'แชร์ตำแหน่ง' } }] },
    },
  }
}

/** ---------- 4) แสดงผลคำนวณระยะทาง ---------- */
export function distanceResultFlex(km: number): FlexMessage {
  const ok = km <= 2
  return {
    type: 'flex',
    altText: 'ผลคำนวณระยะทาง',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          { type: 'text', text: 'ระยะทางจากร้านถึงบ้านคุณ', weight: 'bold', size: 'lg' },
          {
            type: 'text',
            text: `${km.toFixed(2)} กิโลเมตร`,
            size: 'xl',
            weight: 'bold',
            color: ok ? '#16a34a' : '#ef4444',
          },
          {
            type: 'text',
            text: ok ? 'อยู่ในเงื่อนไข “ส่งฟรี 2 กม.” ✅' : 'เกิน 2 กม. กรุณาเลือกส่งผ่าน Easy Delivery',
            size: 'sm',
            color: '#6b7280',
          },
        ],
      },
    },
  }
}

/** ---------- 5) ใบเสร็จ (หลังปิดจ๊อบ) ---------- */
export function receiptFlex(order: Order, slogan: string): FlexMessage {
  return {
    type: 'flex',
    altText: `ใบเสร็จ #${order.id}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'ร้านตั้มพานิช · ใบเสร็จ', weight: 'bold', size: 'lg' },
          { type: 'text', text: `ออเดอร์ของคุณ ${order.uid}`, size: 'sm', color: '#6b7280' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          ...order.lines.map((l) => ({
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: `${l.name} x${l.qty}`, size: 'sm', flex: 3 },
              { type: 'text', text: fmtTHB(l.qty * l.price), size: 'sm', align: 'end', flex: 1 },
            ],
          })),
          { type: 'separator' },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'รวมสุทธิ', weight: 'bold' },
              { type: 'text', text: fmtTHB(order.total), align: 'end', weight: 'bold' },
            ],
          },
          ...(order.slipUrl ? ([{ type: 'image', url: order.slipUrl, size: 'full' }] as any) : []),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [{ type: 'text', text: slogan, size: 'sm', color: '#6b7280', wrap: true }],
      },
    },
  }
}
