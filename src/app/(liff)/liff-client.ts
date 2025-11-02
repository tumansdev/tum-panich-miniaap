'use client'

declare global {
  interface Window { liff?: any }
}

async function loadLiffSdk() {
  if (typeof window === 'undefined') return null
  if (window.liff) return window.liff
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('LIFF SDK load failed'))
    document.head.appendChild(s)
  })
  return window.liff
}

export async function liffInitAndGetProfile() {
  const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID
  if (!LIFF_ID) {
    console.warn('NEXT_PUBLIC_LIFF_ID is missing; skip LIFF init')
    return null
  }

  const liff = await loadLiffSdk()
  if (!liff) return null

  if (!liff.isInitialized) {
    await liff.init({ liffId: LIFF_ID })
  }

  // นอก LINE client อาจยังไม่ login -> ส่งไป login ก่อน
  if (!liff.isInClient() && !liff.isLoggedIn()) {
    liff.login()
    return null // กลับมาหลัง login แล้วหน้า refresh เอง
  }

  try {
    const profile = await liff.getProfile()
    return profile // { userId, displayName, ... }
  } catch (e) {
    console.warn('getProfile failed', e)
    return null
  }
}
