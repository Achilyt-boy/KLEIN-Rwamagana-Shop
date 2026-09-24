import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext'

// Cart is client-side state, persisted to localStorage so a refresh
// (or a language switch) never empties it. Totals are computed here
// once and reused by the cart page, checkout and the navbar badge.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('klein_cart')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('klein_cart', JSON.stringify(items))
  }, [items])

  function addItem(product, quantity = 1) {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id)
      if (found) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 99) }
            : i,
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  function updateQuantity(productId, quantity) {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
    )
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.quantity
        acc.subtotal += Number(i.product.price) * i.quantity
        return acc
      },
      { count: 0, subtotal: 0 },
    )
  }, [items])

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}
