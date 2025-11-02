'use client'

declare global {
  interface Window {
    liff?: any
  }
}

export async function ensureLiff() {
  if (typeof window === 'undefined') return null
  if (!window.liff) {
    // โหลด LIFF SDK จาก CDN เฉพาะตอน client
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('LIFF SDK load failed'))
      document.head.appendChild(s)
    })
  }
  return window.liff
}

export async function liffInitAndGetProfile() {
  const liff = await ensureLiff()
  if (!liff) return null
  if (!liff.isInClient() && !liff.isLoggedIn()) {
    liff.login()
    return null
  }
  if (!liff.isInitialized) {
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })
  }
  const profile = await liff.getProfile()
  return profile // { userId, displayName, pictureUrl, ... }
}
