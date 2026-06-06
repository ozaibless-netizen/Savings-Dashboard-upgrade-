import { PermissionsAndroid } from 'react-native';
import NetworkInfo from 'react-native-network-info';
import axios from 'axios';

export const checkNetworkConnection = async () => {
  try {
    const response = await axios.get('https://www.google.com/search?q=test', { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getCurrentSSID = async () => {
  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (!hasPermission) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need location access to detect WiFi network',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return null;
      }
    }

    const ssid = await NetworkInfo.getSSID();
    return ssid;
  } catch (error) {
    console.error('SSID detection error:', error);
    return null;
  }
};

export const isConnectedToSSID = async (targetSSID) => {
  try {
    const currentSSID = await getCurrentSSID();
    return currentSSID === targetSSID;
  } catch (error) {
    return false;
  }
};
