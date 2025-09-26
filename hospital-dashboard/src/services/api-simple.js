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
      } else if (data.email === 'admin@saferide.ai' && data.password === 'password123') {
        return {
          data: {
            data: {
              token: 'demo-token-' + Date.now(),
              user: {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@saferide.ai',
                userType: 'admin'
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
    if (url === '/accidents') {
      return {
        data: {
          success: true,
          data: {
            accidents: [
              {
                _id: '1',
                accidentId: 'ACC-DEMO-001',
                severity: 'moderate',
                status: 'confirmed',
                location: {
                  coordinates: { latitude: 40.7128, longitude: -74.0060 },
                  address: { formattedAddress: 'Times Square, New York, NY' }
                },
                detectedAt: new Date().toISOString(),
                aiAnalysis: { confidenceScore: 85 }
              }
            ],
            pagination: { page: 1, limit: 20, total: 1, pages: 1 }
          }
        }
      }
    }
    
    if (url === '/accidents/statistics/summary') {
      return {
        data: {
          success: true,
          data: {
            statistics: {
              totalAccidents: 5,
              avgResponseTime: 240
            }
          }
        }
      }
    }
    
    if (url === '/hospitals/statistics/system') {
      return {
        data: {
          success: true,
          data: {
            statistics: {
              totalHospitals: 12,
              totalBeds: 500,
              availableBeds: 120,
              totalAmbulances: 25,
              availableAmbulances: 8,
              avgResponseTime: 300
            }
          }
        }
      }
    }
    
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
  
  put: async (url, data) => {
    return { data: { success: true, data: { user: data } } }
  },
  
  defaults: { headers: { common: {} } }
}

export default api
