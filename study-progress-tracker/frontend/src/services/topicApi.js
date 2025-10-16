// frontend/src/services/topicApi.js (Example of an offline-first action)
import { db } from './db';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/topics';

export const createTopic = async (topicData) => {
  if (navigator.onLine) {
    try {
      // If online, try to send to server directly
      const response = await axios.post(API_URL, topicData);
      // Also save to local DB for consistency
      await db.topics.put(response.data);
      return response.data;
    } catch (error) {
      // If server fails even when online, queue it
      console.error('Server is unreachable. Queuing action.');
      return queueAction('CREATE_TOPIC', topicData);
    }
  } else {
    // If offline, just queue it
    console.log('Offline. Queuing action.');
    return queueAction('CREATE_TOPIC', topicData);
  }
};

const queueAction = async (action, data) => {
  // Add a temporary ID for optimistic UI updates
  const tempId = `temp_${Date.now()}`;
  const localData = { ...data, id: tempId, isUnsynced: true };

  await db.syncQueue.add({ action, data, timestamp: new Date() });
  await db.topics.put(localData); // Save to local DB immediately
  return localData;
};

// This function runs when connection is restored
export const processSyncQueue = async () => {
  const queue = await db.syncQueue.orderBy('timestamp').toArray();
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} items from sync queue...`);
  for (const item of queue) {
    try {
      if (item.action === 'CREATE_TOPIC') {
        await axios.post(API_URL, item.data);
      }
      // Add other actions here ('UPDATE_TOPIC', 'DELETE_TOPIC')

      // If successful, remove from queue
      await db.syncQueue.delete(item.id);
      console.log(`Action ${item.action} synced successfully.`);
    } catch (error) {
      console.error(`Failed to sync action ${item.action}:`, error);
      // Keep it in the queue to retry later
    }
  }
};

// Listen for online event
window.addEventListener('online', processSyncQueue);