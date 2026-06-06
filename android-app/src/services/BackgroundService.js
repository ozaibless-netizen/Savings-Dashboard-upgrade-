import RNBackgroundJob from 'react-native-background-job';
import { retrySmsFromQueue } from './SmsService';
import { checkNetworkConnection } from '../utils/NetworkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOB_KEY = 'sms_sync_job';

export const initBackgroundJob = async () => {
  try {
    // Register background job
    RNBackgroundJob.register({
      jobKey: JOB_KEY,
      job: async () => {
        console.log('🔄 Background sync job running...');
        
        const isOnline = await checkNetworkConnection();
        if (isOnline) {
          await retrySmsFromQueue();
        }
      }
    });

    // Schedule job to run every 15 minutes
    RNBackgroundJob.schedule({
      jobKey: JOB_KEY,
      period: 15 * 60 * 1000, // 15 minutes
      exact: false,
      notificationTitle: '💰 Savings Dashboard',
      notificationText: 'Syncing transactions...',
      requiresNetworkType: RNBackgroundJob.NETWORK_TYPE_ANY,
      requiresCharging: false,
      requiresBatteryNotLow: false,
      requiresStorageNotLow: false,
      requiresDeviceIdle: false
    });

    console.log('✅ Background job scheduled (every 15 minutes)');
  } catch (error) {
    console.error('Background job error:', error);
  }
};

export const stopBackgroundJob = () => {
  try {
    RNBackgroundJob.cancel({ jobKey: JOB_KEY });
    console.log('📵 Background job cancelled');
  } catch (error) {
    console.error('Cancel job error:', error);
  }
};
