import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';

import AuthStack from './navigation/AuthStack';
import DashboardStack from './navigation/DashboardStack';
import { initSmsListener } from './services/SmsService';
import { initBackgroundJob } from './services/BackgroundService';
import { initNotifications } from './services/NotificationService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    initServices();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userId = await AsyncStorage.getItem('user_id');
      setIsLoggedIn(!!token && !!userId);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const initServices = async () => {
    try {
      // Initialize SMS listener
      await initSmsListener();
      
      // Initialize background job for queue processing
      await initBackgroundJob();
      
      // Initialize notifications
      await initNotifications();

      console.log('✅ All services initialized');
    } catch (error) {
      console.error('Service initialization error:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <DashboardStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
