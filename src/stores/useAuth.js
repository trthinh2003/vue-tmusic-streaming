import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const router = useRouter()

  const login = async (credentials) => {
    const response = await fakeApiLogin(credentials)
    
    user.value = response.user
    token.value = response.token
    localStorage.setItem('token', response.token)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  const fakeApiLogin = (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: { 
            id: 1, 
            username: credentials.username,
            name: 'Admin User',
            role: 'admin'
          },
          token: 'fake-jwt-token'
        })
      }, 1000)
    })
  }

  return { user, token, login, logout }
})