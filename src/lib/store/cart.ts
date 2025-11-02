'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine } from '@/lib/types'

type CartState = {
  lines: CartLine[]
  addLine: (item: { menuId: string; name: string; price: number }) => void
  inc: (menuId: string) => void
  dec: (menuId: string) => void
  remove: (menuId: string) => void
  clear: () => void
  total: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: ({ menuId, name, price }) => {
        const cur = get().lines.slice()
        const idx = cur.findIndex((l) => l.menuId === menuId)
        if (idx >= 0) cur[idx] = { ...cur[idx], qty: cur[idx].qty + 1 }
        else cur.push({ menuId, name, price, qty: 1 })
        set({ lines: cur })
      },
      inc: (menuId) => {
        const cur = get().lines.slice()
        const i = cur.findIndex((l) => l.menuId === menuId)
        if (i >= 0) cur[i] = { ...cur[i], qty: cur[i].qty + 1 }
        set({ lines: cur })
      },
      dec: (menuId) => {
        const cur = get().lines.slice()
        const i = cur.findIndex((l) => l.menuId === menuId)
        if (i >= 0) {
          const q = cur[i].qty - 1
          if (q <= 0) cur.splice(i, 1)
          else cur[i] = { ...cur[i], qty: q }
        }
        set({ lines: cur })
      },
      remove: (menuId) => set({ lines: get().lines.filter((l) => l.menuId !== menuId) }),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((s, l) => s + l.price * l.qty, 0),
    }),
    { name: 'tp-cart', getStorage: () => sessionStorage }
  )
)
