import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'sms_queue';

export const addToQueue = async (smsData) => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({
      ...smsData,
      queuedAt: Date.now()
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`✅ SMS added to queue (total: ${queue.length})`);
    return true;
  } catch (error) {
    console.error('Queue add error:', error);
    return false;
  }
};

export const getQueue = async () => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
    return queue;
  } catch (error) {
    console.error('Queue get error:', error);
    return [];
  }
};

export const clearQueue = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
    console.log('✅ Queue cleared');
    return true;
  } catch (error) {
    console.error('Queue clear error:', error);
    return false;
  }
};

export const getQueueSize = async () => {
  try {
    const queue = await getQueue();
    return queue.length;
  } catch (error) {
    return 0;
  }
};
