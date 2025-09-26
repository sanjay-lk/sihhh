import { create } from 'zustand';
import Geolocation from 'react-native-geolocation-service';

export const useLocationStore = create((set, get) => ({
  // State
  location: null,
  isTracking: false,
  watchId: null,

  // Actions
  startTracking: () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        set({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp)
          }
        });
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000
      }
    );

    set({ isTracking: true, watchId });
  },

  stopTracking: () => {
    const { watchId } = get();
    if (watchId) {
      Geolocation.clearWatch(watchId);
    }
    set({ isTracking: false, watchId: null });
  }
}));
