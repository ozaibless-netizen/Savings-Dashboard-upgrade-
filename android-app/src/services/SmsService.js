import SmsListener from 'react-native-sms-listener';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { parseTransaction } from '../utils/Parser';
import { addToQueue } from '../utils/OfflineQueue';
import { showNotification } from './NotificationService';
import { checkNetworkConnection } from '../utils/NetworkUtils';

let smsSubscription = null;

export const initSmsListener = async () => {
  try {
    // Start listening for SMS
    smsSubscription = SmsListener.addSmsListener((message) => {
      handleIncomingSms(message);
    });

    console.log('✅ SMS Listener initialized');
    return true;
  } catch (error) {
    console.error('❌ SMS Listener error:', error);
    return false;
  }
};

export const stopSmsListener = () => {
  if (smsSubscription) {
    smsSubscription.remove();
    console.log('📵 SMS Listener stopped');
  }
};

const handleIncomingSms = async (message) => {
  try {
    console.log(`\n📱 SMS RECEIVED`);
    console.log(`   From: ${message.originatingAddress}`);
    console.log(`   Message: ${message.body.substring(0, 100)}...`);

    // Parse the SMS
    const parsed = parseTransaction(message.body);

    if (!parsed) {
      console.log('⚠️  SMS did not match any transaction pattern');
      return;
    }

    console.log(`\n✅ PARSED TRANSACTION`);
    console.log(`   Type: ${parsed.type}`);
    console.log(`   Amount: MK ${parsed.amount}`);
    console.log(`   Savings: MK ${parsed.saveAmount} (${parsed.savingsPercent}%)`);

    // Get user data
    const userId = await AsyncStorage.getItem('user_id');
    const authToken = await AsyncStorage.getItem('auth_token');
    const webhookUrl = await AsyncStorage.getItem('webhook_url');

    if (!userId || !authToken || !webhookUrl) {
      console.error('❌ User not configured');
      return;
    }

    // Prepare SMS data
    const smsData = {
      userId,
      message: message.body,
      senderName: message.senderName || 'SMS',
      senderId: message.originatingAddress,
      timestamp: message.receivedAt || Date.now()
    };

    // Check network connection
    const isOnline = await checkNetworkConnection();

    if (isOnline) {
      // Send to server immediately
      await sendSmsToServer(webhookUrl, smsData, authToken);
    } else {
      // Add to offline queue
      await addToQueue(smsData);
      showNotification('Offline Mode', 'SMS saved. Will sync when online.', 'info');
    }

  } catch (error) {
    console.error('❌ SMS handling error:', error);
  }
};

const sendSmsToServer = async (webhookUrl, smsData, authToken) => {
  try {
    const response = await axios.post(
      `${webhookUrl}/api/sms/webhook`,
      smsData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data.success && response.data.transaction.approved) {
      console.log(`\n💰 AUTO-APPROVED TRANSFER`);
      console.log(`   Amount: MK ${response.data.transaction.saveAmount}`);

      // Show notification
      showNotification(
        '💰 Savings Auto-Approved',
        `MK ${response.data.transaction.saveAmount} (${response.data.transaction.savingsPercent}%)`,
        'success'
      );
    }

    return response.data;
  } catch (error) {
    console.error('❌ Server send error:', error);
    
    // Add to offline queue if server request fails
    await addToQueue(smsData);
    showNotification('Error', 'Failed to send SMS. Saved for later.', 'error');
    
    throw error;
  }
};

export const retrySmsFromQueue = async () => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem('sms_queue') || '[]');
    
    if (queue.length === 0) {
      console.log('✅ Queue is empty');
      return;
    }

    const authToken = await AsyncStorage.getItem('auth_token');
    const webhookUrl = await AsyncStorage.getItem('webhook_url');

    let successCount = 0;
    let failedItems = [];

    for (const item of queue) {
      try {
        await sendSmsToServer(webhookUrl, item, authToken);
        successCount++;
      } catch (error) {
        failedItems.push(item);
      }
    }

    // Update queue with failed items
    if (failedItems.length > 0) {
      await AsyncStorage.setItem('sms_queue', JSON.stringify(failedItems));
    } else {
      await AsyncStorage.removeItem('sms_queue');
    }

    console.log(`✅ Queue retry: ${successCount} sent, ${failedItems.length} remaining`);
    return { successCount, failCount: failedItems.length };

  } catch (error) {
    console.error('❌ Queue retry error:', error);
  }
};
