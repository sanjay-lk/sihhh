import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const authStore = JSON.parse(localStorage.getItem('saferide-auth') || '{}')
    const token = authStore.state?.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add device info headers
    config.headers['X-Device-ID'] = 'hospital-dashboard'
    config.headers['X-Platform'] = 'web'
    config.headers['X-App-Version'] = '1.0.0'
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('saferide-auth')
          window.location.href = '/login'
          break
          
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.')
          break
          
        case 404:
          toast.error('Resource not found.')
          break
          
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
          
        case 500:
          toast.error('Server error. Please try again later.')
          break
          
        default:
          if (data?.message) {
            toast.error(data.message)
          } else {
            toast.error('An unexpected error occurred.')
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred.')
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
}

export const accidentsAPI = {
  getAccidents: (params) => api.get('/accidents', { params }),
  getAccident: (accidentId) => api.get(`/accidents/${accidentId}`),
  updateAccidentStatus: (accidentId, data) => api.put(`/accidents/${accidentId}/status`, data),
  addResponse: (accidentId, data) => api.post(`/accidents/${accidentId}/response`, data),
  getStatistics: (params) => api.get('/accidents/statistics/summary', { params }),
  submitFeedback: (accidentId, data) => api.post(`/accidents/${accidentId}/feedback`, data)
}

export const hospitalsAPI = {
  getHospitals: (params) => api.get('/hospitals', { params }),
  getHospital: (hospitalId) => api.get(`/hospitals/${hospitalId}`),
  updateHospital: (hospitalId, data) => api.put(`/hospitals/${hospitalId}`, data),
  updateCapacity: (hospitalId, data) => api.put(`/hospitals/${hospitalId}/capacity`, data),
  getAmbulances: (hospitalId, params) => api.get(`/hospitals/${hospitalId}/ambulances`, { params }),
  dispatchAmbulance: (hospitalId, ambulanceId, data) => 
    api.post(`/hospitals/${hospitalId}/ambulances/${ambulanceId}/dispatch`, data),
  getNearbyHospitals: (params) => api.get('/hospitals/nearby/emergency', { params }),
  getSystemStatistics: () => api.get('/hospitals/statistics/system')
}

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUserStatus: (userId, data) => api.put(`/users/${userId}/status`, data),
  getUserAccidents: (userId, params) => api.get(`/users/${userId}/accidents`, { params }),
  updateEmergencyContacts: (userId, data) => api.put(`/users/${userId}/emergency-contacts`, data),
  updateMedicalInfo: (userId, data) => api.put(`/users/${userId}/medical-info`, data),
  updateSettings: (userId, data) => api.put(`/users/${userId}/settings`, data),
  getUserStatistics: () => api.get('/users/statistics/overview')
}

export const notificationsAPI = {
  sendSMS: (data) => api.post('/notifications/sms', data),
  sendPush: (data) => api.post('/notifications/push', data),
  sendEmergencyBroadcast: (data) => api.post('/notifications/emergency-broadcast', data),
  getHistory: (params) => api.get('/notifications/history', { params }),
  testNotification: (data) => api.post('/notifications/test', data),
  getStatus: () => api.get('/notifications/status')
}

// Utility functions
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  return defaultMessage
}

export const createFormData = (data) => {
  const formData = new FormData()
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
        formData.append(key, JSON.stringify(data[key]))
      } else {
        formData.append(key, data[key])
      }
    }
  })
  
  return formData
}

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return { success: true }
  } catch (error) {
    console.error('Download error:', error)
    return { success: false, error: handleAPIError(error, 'Download failed') }
  }
}

export default api
