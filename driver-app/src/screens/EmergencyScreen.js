import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmergencyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency</Text>
      <Text style={styles.subtitle}>Emergency features coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});

export default EmergencyScreen;
