import { defineStore } from 'pinia'
import { api } from '@/lib/api'
import type { AuthResponse, RegisterResponse } from '@/types/api'

const TOKEN_KEY = '@todo:token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const { data } = await api.post<AuthResponse>('/login', { email, password })
      this.token = data.token
      localStorage.setItem(TOKEN_KEY, data.token)
    },
    async register(name: string, email: string, password: string) {
      const { data } = await api.post<RegisterResponse>('/register', { name, email, password })
      return data.userId
    },
    logout() {
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
    },
  },
})
