import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSensorStore } from '../stores/sensorStore';
import { useLocationStore } from '../stores/locationStore';
import { useAuthStore } from '../stores/authStore';

const HomeScreen = () => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const { 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    sensorData,
    alertLevel 
  } = useSensorStore();
  const { location, isTracking } = useLocationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Pulse animation for emergency button
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    if (alertLevel === 'high') {
      pulse();
    }
  }, [alertLevel, pulseAnim]);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Alert', 
          style: 'destructive',
          onPress: () => {
            // Handle emergency alert
            console.log('Emergency alert sent');
          }
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (!isMonitoring) return '#6b7280';
    switch (alertLevel) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusText = () => {
    if (!isMonitoring) return 'Monitoring Disabled';
    switch (alertLevel) {
      case 'high': return 'High Risk Detected';
      case 'medium': return 'Monitoring Active';
      default: return 'Safe Driving';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
        <Text style={styles.subtitle}>Stay safe on the road</Text>
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.statusSubtext}>
          {isTracking ? 'Location tracking active' : 'Location tracking disabled'}
        </Text>
      </View>

      {/* Sensor Data */}
      {isMonitoring && sensorData && (
        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>Live Sensor Data</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorItem}>
              <Text style={styles.sensorLabel}>Speed</Text>
              <Text style={styles.sensorValue}>{sensorData.speed?.toFixed(1)} km/h</Text>
            </View>
            <View style={styles.sensorItem}>
              <Text style={styles.sensorLabel}>G-Force</Text>
              <Text style={styles.sensorValue}>
                {sensorData.accelerometer?.magnitude?.toFixed(2)}g
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Emergency Button */}
      <Animated.View style={[styles.emergencyContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[styles.emergencyButton, alertLevel === 'high' && styles.emergencyButtonAlert]}
          onPress={handleEmergencyPress}
        >
          <Icon name="emergency" size={48} color="white" />
          <Text style={styles.emergencyText}>EMERGENCY</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMonitoring && styles.controlButtonActive]}
          onPress={handleToggleMonitoring}
        >
          <Icon 
            name={isMonitoring ? 'pause' : 'play-arrow'} 
            size={24} 
            color={isMonitoring ? 'white' : '#2563eb'} 
          />
          <Text style={[styles.controlText, isMonitoring && styles.controlTextActive]}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationCard}>
          <Icon name="location-on" size={20} color="#6b7280" />
          <Text style={styles.locationText}>
            {location.address || `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  sensorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sensorItem: {
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  emergencyContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  emergencyButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyButtonAlert: {
    backgroundColor: '#dc2626',
    shadowOpacity: 0.5,
  },
  emergencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  controls: {
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  controlButtonActive: {
    backgroundColor: '#2563eb',
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
  controlTextActive: {
    color: 'white',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
});

export default HomeScreen;
