import { PushNotification } from 'react-native-notifications';

export const initNotifications = async () => {
  try {
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Notification:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: true
    });

    console.log('✅ Notifications initialized');
  } catch (error) {
    console.error('Notification error:', error);
  }
};

export const showNotification = (title, message, type = 'info') => {
  try {
    const colors = {
      success: '#4caf50',
      error: '#f44336',
      info: '#2196f3',
      warning: '#ff9800'
    };

    PushNotification.localNotification({
      title: title,
      message: message,
      bigText: message,
      smallIcon: 'ic_launcher',
      color: colors[type] || colors.info,
      vibrate: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high'
    });
  } catch (error) {
    console.error('Show notification error:', error);
  }
};
