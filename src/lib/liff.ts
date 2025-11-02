'use client'

let _uid: string | null = null

export async function getLineUid(): Promise<string> {
  // DEV fallback: ถ้ายังไม่ได้เชื่อม LIFF ให้ใช้ UID จำลอง
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LIFF_DEV_UID) {
    _uid = process.env.NEXT_PUBLIC_LIFF_DEV_UID
  }
  // TODO: เมื่อพร้อมเชื่อม LIFF จริง ค่อยเพิ่มการเรียก liff.init(...) + liff.getProfile()
  return _uid || 'U_DEV_FALLBACK'
}
