import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials) => {
        try {
          // Simulate login for demo
          if (credentials.email === 'driver@saferide.ai' && credentials.password === 'password123') {
            const user = {
              id: '1',
              firstName: 'John',
              lastName: 'Driver',
              email: 'driver@saferide.ai',
              userType: 'driver'
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false
            })
            
            toast.success(`Welcome back, ${user.firstName}!`)
            return { success: true }
          } else {
            toast.error('Invalid credentials')
            return { success: false, error: 'Invalid credentials' }
          }
        } catch (error) {
          toast.error('Login failed')
          return { success: false, error: 'Login failed' }
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        })
        toast.success('Logged out successfully')
      },

      initializeAuth: () => {
        // Check if user was previously logged in
        const { user } = get()
        if (user) {
          set({ isAuthenticated: true, isLoading: false })
        } else {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'driver-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export { useAuthStore }
