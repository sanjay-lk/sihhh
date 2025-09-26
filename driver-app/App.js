import React, { useEffect } from 'react';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { enableScreens } from 'react-native-screens';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import { initializeServices } from './src/services/initialization';

// Stores
import { useAuthStore } from './src/stores/authStore';
import { useSensorStore } from './src/stores/sensorStore';

// Utils
import { requestPermissions } from './src/utils/permissions';

// Enable screens for better performance
enableScreens();

const App = () => {
  const { initializeAuth } = useAuthStore();
  const { initializeSensors } = useSensorStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Request necessary permissions
        await requestPermissions();
        
        // Initialize authentication
        await initializeAuth();
        
        // Initialize sensors
        await initializeSensors();
        
        // Initialize other services
        await initializeServices();
        
        console.log('SafeRide AI app initialized successfully');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
          backgroundColor="#2563eb"
        />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
