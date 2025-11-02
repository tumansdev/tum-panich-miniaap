'use client'
import { create } from 'zustand'

export type CartLine = { menuId: string; name: string; price: number; qty: number }
type State = { lines: CartLine[] }
type Actions = {
  add: (line: Omit<CartLine, 'qty'>) => void
  inc: (menuId: string) => void
  dec: (menuId: string) => void
  remove: (menuId: string) => void
  clear: () => void
}

export const useCart = create<State & Actions>((set, get) => ({
  lines: [],
  add: (l) => set(s => {
    const i = s.lines.findIndex(x => x.menuId === l.menuId)
    if (i > -1) {
      const cp = [...s.lines]; cp[i] = { ...cp[i], qty: cp[i].qty + 1 }; return { lines: cp }
    }
    return { lines: [...s.lines, { ...l, qty: 1 }] }
  }),
  inc: (id) => set(s => ({ lines: s.lines.map(x => x.menuId === id ? { ...x, qty: x.qty + 1 } : x) })),
  dec: (id) => set(s => ({ lines: s.lines.map(x => x.menuId === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x) })),
  remove: (id) => set(s => ({ lines: s.lines.filter(x => x.menuId !== id) })),
  clear: () => set({ lines: [] }),
}))
