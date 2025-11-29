import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { NotificationsApiService } from './notifications-api.service';
import { NotificationsSignalRService } from './notifications-signalr.service';
import { useAuthenticationStore } from '@/auth/services/authentication.store';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const isConnected = ref(false);
  const isLoading = ref(false);

  const notificationsApiService = new NotificationsApiService();
  const signalRService = new NotificationsSignalRService();

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length;
  });

  const hasUnread = computed(() => unreadCount.value > 0);

  async function loadNotifications() {
    const authStore = useAuthenticationStore();
    if (!authStore.isSignedIn) return;

    isLoading.value = true;
    try {
      const response = await notificationsApiService.getByUserId(authStore.userId);
      notifications.value = response || [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      notifications.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function connectToRealTime() {
    const authStore = useAuthenticationStore();
    if (!authStore.isSignedIn) return;

    try {
      await signalRService.connect(
        // On notification received
        (notification) => {
          // Add to beginning of list
          notifications.value.unshift(notification);
        },
        // On notification deleted
        (notificationId) => {
          notifications.value = notifications.value.filter(n => n.id !== notificationId);
        }
      );
      isConnected.value = true;
    } catch (error) {
      console.error('Error connecting to real-time notifications:', error);
      isConnected.value = false;
    }
  }

  async function disconnect() {
    await signalRService.disconnect();
    isConnected.value = false;
  }

  async function deleteNotification(notificationId) {
    try {
      await notificationsApiService.delete(notificationId);
      notifications.value = notifications.value.filter(n => n.id !== notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async function markAsRead(notificationId) {
    try {
      await notificationsApiService.markAsRead(notificationId);
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  function clearAll() {
    notifications.value = [];
  }

  return {
    notifications,
    isConnected,
    isLoading,
    unreadCount,
    hasUnread,
    loadNotifications,
    connectToRealTime,
    disconnect,
    deleteNotification,
    markAsRead,
    clearAll
  };
});
