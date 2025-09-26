import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      console.log('Android permissions granted:', granted);
    } else {
      // iOS permissions
      const locationPermission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);
      const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
      
      console.log('iOS permissions:', {
        location: locationPermission,
        microphone: microphonePermission,
        camera: cameraPermission,
      });
    }
  } catch (error) {
    console.error('Permission request error:', error);
  }
};
