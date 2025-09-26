import { create } from 'zustand';
import { accelerometer, gyroscope } from 'react-native-sensors';

export const useSensorStore = create((set, get) => ({
  // State
  isMonitoring: false,
  sensorData: null,
  alertLevel: 'low', // low, medium, high
  recentReadings: [],

  // Actions
  initializeSensors: async () => {
    console.log('Sensors initialized');
  },

  startMonitoring: () => {
    const { stopMonitoring } = get();
    
    // Stop any existing monitoring
    stopMonitoring();

    // Start accelerometer monitoring
    const accelerometerSubscription = accelerometer.subscribe(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      set(state => {
        const newReading = {
          accelerometer: { x, y, z, magnitude },
          timestamp: new Date().toISOString(),
          speed: 0 // Would come from GPS
        };

        const newReadings = [...state.recentReadings, newReading].slice(-10);
        
        // Simple alert level calculation
        let alertLevel = 'low';
        if (magnitude > 15) alertLevel = 'high';
        else if (magnitude > 10) alertLevel = 'medium';

        return {
          sensorData: newReading,
          recentReadings: newReadings,
          alertLevel
        };
      });
    });

    set({ 
      isMonitoring: true,
      accelerometerSubscription 
    });
  },

  stopMonitoring: () => {
    const { accelerometerSubscription } = get();
    
    if (accelerometerSubscription) {
      accelerometerSubscription.unsubscribe();
    }

    set({
      isMonitoring: false,
      accelerometerSubscription: null,
      alertLevel: 'low'
    });
  }
}));
