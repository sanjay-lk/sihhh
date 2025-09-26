import { create } from 'zustand'
import toast from 'react-hot-toast'

const useSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: true, // Always connected for demo
  connectionError: null,
  
  // Real-time data
  activeAccidents: [
    {
      accidentId: 'ACC-DEMO-001',
      severity: 'moderate',
      location: { coordinates: { latitude: 40.7128, longitude: -74.0060 } },
      timestamp: new Date().toISOString()
    },
    {
      accidentId: 'ACC-DEMO-002', 
      severity: 'severe',
      location: { coordinates: { latitude: 40.7589, longitude: -73.9851 } },
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  ],
  hospitalUpdates: [],
  ambulanceUpdates: [],
  systemStatus: { activeConnections: 5 },
  
  // Actions
  connect: () => {
    set({ isConnected: true })
    console.log('Socket connected (demo mode)')
  },
  
  disconnect: () => {
    set({ isConnected: false })
    console.log('Socket disconnected (demo mode)')
  },
  
  // Utility functions
  emit: (event, data) => {
    console.log('Socket emit:', event, data)
  },
  
  getActiveAccidentCount: () => {
    const { activeAccidents } = get()
    return activeAccidents.length
  },
  
  getCriticalAccidentCount: () => {
    const { activeAccidents } = get()
    return activeAccidents.filter(accident => 
      accident.severity === 'critical'
    ).length
  },
  
  getRecentUpdates: () => {
    const { hospitalUpdates, ambulanceUpdates } = get()
    
    const allUpdates = [
      ...hospitalUpdates.map(update => ({ ...update, type: 'hospital' })),
      ...ambulanceUpdates.map(update => ({ ...update, type: 'ambulance' }))
    ]
    
    return allUpdates
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
  }
}))

export { useSocketStore }
