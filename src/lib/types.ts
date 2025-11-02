export type MenuCategory = 'ข้าว' | 'ก๋วยเตี๋ยว' | 'ของทานเล่น' | 'เครื่องดื่ม' | 'อื่นๆ'

export type MenuItem = {
  id: string
  name: string
  description?: string
  price: number
  category: MenuCategory
  imageUrl?: string
  available: boolean
  createdAt?: number
  updatedAt?: number
}

export type CartLine = { menuId: string; name: string; qty: number; price: number }

export type DeliveryMethod = 'pickup' | 'shop-free-2km' | 'easy-delivery'

export type DeliveryInfo = {
  method: DeliveryMethod
  address?: string
  phone?: string
  lat?: number
  lng?: number
  distanceKm?: number
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'delivering' | 'done' | 'cancelled'

export type Order = {
  id: string
  uid: string
  displayName?: string
  lines: CartLine[]
  total: number
  note?: string
  slipUrl?: string
  delivery: DeliveryInfo
  status: OrderStatus
  createdAt: number
  updatedAt: number
}
