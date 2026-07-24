import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { useProducts } from './ProductsContext'

const CartContext = createContext(null)
const storageKey = 'trolley-dey-cart'

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantity = Math.max(1, Number(action.quantity) || 1)
      const existing = state.find((item) => item.product.id === action.product.id)

      if (existing) {
        return state.map((item) => (
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ))
      }

      return [...state, { product: action.product, quantity }]
    }
    case 'UPDATE_QUANTITY':
      return state.map((item) => (
        item.product.id === action.productId
          ? { ...item, quantity: Math.max(1, Number(action.quantity) || 1) }
          : item
      ))
    case 'REMOVE_ITEM':
      return state.filter((item) => item.product.id !== action.productId)
    case 'CLEAR_CART':
      return []
    case 'SYNC_PRODUCTS':
      return state.map((item) => {
        const currentProduct = action.products.find((product) => product.id === item.product.id)
        return currentProduct
          ? { ...item, product: currentProduct }
          : { ...item, product: { ...item.product, in_stock: false } }
      })
    default:
      return state
  }
}

function initializeCart() {
  try {
    const savedCart = window.localStorage.getItem(storageKey)
    const parsedCart = savedCart ? JSON.parse(savedCart) : []
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, initializeCart)
  const { products } = useProducts()

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    dispatch({ type: 'SYNC_PRODUCTS', products })
  }, [products])

  const value = useMemo(() => {
    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
      addItem: (product, quantity = 1) => dispatch({ type: 'ADD_ITEM', product, quantity }),
      updateQuantity: (productId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }),
      removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
