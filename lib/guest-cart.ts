// Guest cart management using localStorage

export interface GuestCartItem {
  productId: string
  variantId: string
  quantity: number
  pack: number
  size: string
  color: string
  price: number
  packColors?: string[] // Optional: for pack of 2 or 3, stores selected colors
}

const CART_KEY = 'manthm_guest_cart'

export const guestCart = {
  // Get all items
  getItems(): GuestCartItem[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(CART_KEY)
    return data ? JSON.parse(data) : []
  },

  // Add or update item
  addItem(item: GuestCartItem): void {
    const items = this.getItems()
    const existingIndex = items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    )

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity
    } else {
      items.push(item)
    }

    localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('cart-updated'))
  },

  // Update quantity
  updateQuantity(productId: string, variantId: string, quantity: number): void {
    const items = this.getItems()
    const index = items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId
    )

    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1)
      } else {
        items[index].quantity = quantity
      }
      localStorage.setItem(CART_KEY, JSON.stringify(items))
      window.dispatchEvent(new Event('cart-updated'))
    }
  },

  // Remove item
  removeItem(productId: string, variantId: string): void {
    const items = this.getItems().filter(
      (i) => !(i.productId === productId && i.variantId === variantId)
    )
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('cart-updated'))
  },

  // Clear cart
  clear(): void {
    localStorage.removeItem(CART_KEY)
    window.dispatchEvent(new Event('cart-updated'))
  },

  // Get item count
  getCount(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0)
  },

  // Get cart total
  getTotal(): number {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
}
