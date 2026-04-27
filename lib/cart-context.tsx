"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface CartItemSpec {
  color: string
  size: string
  qty: number
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  productSku: string
  productImage: string
  fabric?: string
  supportsLogo: boolean
  totalQty: number
  specs: CartItemSpec[]
  note?: string
  addedAt: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalQty: number
  addToCart: (item: Omit<CartItem, "id" | "addedAt">) => void
  updateItem: (id: string, updates: Partial<CartItem>) => void
  removeItem: (id: string) => void
  clearCart: () => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "inquiry_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e)
    }
    setIsLoaded(true)
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (e) {
        console.error("Failed to save cart to localStorage:", e)
      }
    }
  }, [items, isLoaded])

  const addToCart = useCallback((item: Omit<CartItem, "id" | "addedAt">) => {
    setItems((prev) => {
      // 查找是否已有相同产品
      const existingIndex = prev.findIndex((i) => i.productId === item.productId)
      
      if (existingIndex >= 0) {
        // 合并规格
        const existing = prev[existingIndex]
        const mergedSpecs = [...existing.specs]
        
        for (const newSpec of item.specs) {
          const specIndex = mergedSpecs.findIndex(
            (s) => s.color === newSpec.color && s.size === newSpec.size
          )
          if (specIndex >= 0) {
            mergedSpecs[specIndex].qty += newSpec.qty
          } else {
            mergedSpecs.push(newSpec)
          }
        }
        
        const newTotalQty = mergedSpecs.reduce((sum, s) => sum + s.qty, 0)
        
        const updated = [...prev]
        updated[existingIndex] = {
          ...existing,
          specs: mergedSpecs,
          totalQty: newTotalQty,
          note: item.note || existing.note,
        }
        return updated
      } else {
        // 添加新商品
        return [
          ...prev,
          {
            ...item,
            id: `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            addedAt: Date.now(),
          },
        ]
      }
    })
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.length
  const totalQty = items.reduce((sum, item) => sum + item.totalQty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalQty,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
