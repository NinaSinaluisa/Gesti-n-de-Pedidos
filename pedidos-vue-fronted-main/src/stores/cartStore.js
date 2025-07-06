// stores/cartStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from './authstore' // Cambiado de useAuthStore a useUserStore

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
    _cartItemsCount: 0
  }),

  actions: {
    addToCart(productId, quantity, sizeId) {
      const existingItem = this.cartItems.find(
        item => item.detalles_productos_id === productId && item.talla_id === sizeId
      )

      if (existingItem) {
        existingItem.cantidad += quantity
      } else {
        this.cartItems.push({
          detalles_productos_id: productId,
          cantidad: quantity,
          talla_id: sizeId
        })
      }
    },

    removeFromCart(productId, sizeId) {
      this.cartItems = this.cartItems.filter(
        item => !(item.detalles_productos_id === productId && item.talla_id === sizeId)
      )
    },
    updateQuantity(productId, sizeId, newQuantity) {
        const item = this.cartItems.find(
            item => item.detalles_productos_id === productId && item.talla_id === sizeId
        )
        
        if (item) {
            item.cantidad = newQuantity
        }
    },
    clearCart() {
      this.cartItems = [];
      this._cartItemsCount = 0;
    },

    async createOrder() {
      const userStore = useUserStore() // Cambiado de authStore a userStore
      
      if (!userStore.authenticated || !userStore.user) {
        throw new Error('Usuario no autenticado')
      }

      try {
        const orderData = {
          usuario_id: userStore.user.id,
          productos: this.cartItems
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${userStore.token}`,
            'Content-Type': 'application/json'
          }
        }

        const response = await axios.post('http://localhost:8000/api/public/orden', orderData, config)
        
        // Limpiar carrito después de crear la orden exitosamente
        this.clearCart()
        
        return response.data
      } catch (error) {
        console.error('Error al crear la orden:', error)
        throw error
      }
    }
  },

  getters: {
    cartItemsCount() {
      return this.cartItems.reduce((total, item) => total + item.cantidad, 0)
    },
    
    isEmpty() {
      return this.cartItems.length === 0
    }
  },

  persist: {
    key: 'cart-store',
    storage: localStorage,
    paths: ['cartItems']
  }
})