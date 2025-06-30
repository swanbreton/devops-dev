import { defineStore } from 'pinia'
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
state: () => ({
  token: localStorage.getItem('token'),
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch (err) {
      console.warn('⚠️ Erreur JSON.parse(user)', err)
      localStorage.removeItem('user')
      return null
    }
  })()
}),

  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.isAdmin || false
  },
  
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('/users/login', {
          username,
          password
        })
        
        this.token = response.data.token
        
        localStorage.setItem('token', this.token)

        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        axios.get('/users/me').then(response => {
            this.user = response.data.data
            localStorage.setItem('user', JSON.stringify(this.user))
        })
        
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },
    
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    }
  }
}) 