import { defineStore } from 'pinia'
import User from '@/apis/User'

// Cache para evitar múltiples llamadas simultáneas
let authCheckPromise = null

export const useUserStore = defineStore('user', {
  state: () => ({
    authenticated: false,
    token: null,
    user: null,
    _lastSync: 0 // Añadido para control de caché
  }),

  actions: {
    async login(form) {
      try {
        const response = await User.login(form)
        if (response.data?.token) {
          this.setSession(response.data.token, response.data.user)
          return true
        }
        return false
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error en login:', error)
        throw error
      }
    },

    async logout() {
      try {
        // No esperar a que termine el logout del servidor
        User.logout().catch(() => {})
      } finally {
        this.resetState()
      }
    },

    async syncAuthentication() {
      // Si ya hay una sincronización en curso, retornar esa promesa
      if (authCheckPromise) return authCheckPromise
      
      // Si no hay token, resetear y salir
      if (!this.token) {
        this.resetState()
        return
      }

      // Control de caché: no sincronizar si ya se hizo recientemente (5 min)
      const now = Date.now()
      if (now - this._lastSync < 300000 && this.user) {
        return
      }

      try {
        authCheckPromise = (async () => {
          if (typeof User.getProfile === 'function') {
            const response = await User.getProfile()
            if (response.data) {
              this.authenticated = true
              this.user = response.data
              this._lastSync = now
            }
          } else {
            this.authenticated = true
            if (!this.user) this.user = {}
            this._lastSync = now
          }
        })()

        await authCheckPromise
      } catch (error) {
        if (error.response?.status === 401) {
          await this.logout()
        } else {
          if (import.meta.env.DEV) console.warn('Error al sincronizar autenticación:', error)
          if (this.token) this.authenticated = true
        }
      } finally {
        authCheckPromise = null
      }
    },

    checkAuth() {
      // Optimización: leer localStorage solo una vez
      const token = localStorage.getItem('auth')
      if (token && token !== this.token) {
        this.token = token
        this.authenticated = true
        // Usar microtask para no bloquear el hilo principal
        Promise.resolve().then(() => this.syncAuthentication())
      } else if (!token) {
        this.resetState()
      }
    },

    setSession(token, user) {
      // Solo actualizar si los valores son diferentes
      if (this.token !== token || this.user !== user) {
        this.token = token
        this.authenticated = true
        this.user = user || null
        localStorage.setItem('auth', token)
        this._lastSync = Date.now()
      }
    },

    resetState() {
      // Solo resetear si es necesario
      if (this.authenticated || this.token || this.user) {
        this.authenticated = false
        this.token = null
        this.user = null
        localStorage.removeItem('auth')
        this._lastSync = 0
      }
    },
  },

  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['authenticated', 'token', 'user', '_lastSync'],
    // Añadir debounce para evitar escrituras frecuentes
    beforeRestore: (ctx) => {
      if (Date.now() - ctx.store._lastSync > 300000) {
        ctx.store.syncAuthentication()
      }
      return ctx
    }
  }
})