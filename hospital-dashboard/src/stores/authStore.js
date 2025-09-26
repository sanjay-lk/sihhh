import { create } from 'zustand'
import toast from 'react-hot-toast'

// Simple API service for demo
const api = {
  post: async (url, data) => {
    if (url === '/auth/login') {
      // Demo login
      if (data.email === 'hospital@saferide.ai' && data.password === 'password123') {
        return {
          data: {
            data: {
              token: 'demo-token-' + Date.now(),
              user: {
                firstName: 'Hospital',
                lastName: 'Staff',
                email: 'hospital@saferide.ai',
                userType: 'hospital'
              }
            }
          }
        }
      } else {
        throw new Error('Invalid credentials')
      }
    }
    return { data: { success: true } }
  },
  get: async (url) => {
    return {
      data: {
        data: {
          user: {
            firstName: 'Hospital',
            lastName: 'Staff',
            email: 'hospital@saferide.ai',
            userType: 'hospital'
          }
        }
      }
    }
  },
  defaults: { headers: { common: {} } }
}

const useAuthStore = create((set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true })
          
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data.data
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success(`Welcome back, ${user.firstName}!`)
          return { success: true }
          
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint to clear server-side session
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear local state regardless of API call result
          delete api.defaults.headers.common['Authorization']
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
          
          toast.success('Logged out successfully')
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ user: { ...get().user, ...profileData } })
          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          toast.error('Profile update failed')
          return { success: false, error: 'Profile update failed' }
        }
      },

      initializeAuth: async () => {
        // For demo, just set loading to false
        set({ isLoading: false })
      },

      // Utility functions
      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        
        // Admin has all permissions
        if (user.userType === 'admin') return true
        
        // Define permission mappings
        const permissions = {
          'view_accidents': ['hospital', 'emergency_responder', 'admin'],
          'manage_accidents': ['hospital', 'emergency_responder', 'admin'],
          'view_hospitals': ['hospital', 'emergency_responder', 'admin'],
          'manage_hospitals': ['admin'],
          'view_ambulances': ['hospital', 'emergency_responder', 'admin'],
          'manage_ambulances': ['hospital', 'emergency_responder', 'admin'],
          'view_analytics': ['hospital', 'emergency_responder', 'admin'],
          'manage_users': ['admin'],
          'send_notifications': ['hospital', 'emergency_responder', 'admin']
        }
        
        return permissions[permission]?.includes(user.userType) || false
      },

      isHospitalStaff: () => {
        const { user } = get()
        return user?.userType === 'hospital'
      },

      isEmergencyResponder: () => {
        const { user } = get()
        return user?.userType === 'emergency_responder'
      },

      isAdmin: () => {
        const { user } = get()
        return user?.userType === 'admin'
      }
    })
)

export { useAuthStore }
