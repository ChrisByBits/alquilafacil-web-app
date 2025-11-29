import { createSignalRConnection } from '@/shared/services/signalr-common.js';

export class NotificationsSignalRService {
  constructor() {
    this.connection = null;
    this.onNotificationReceived = null;
    this.onNotificationDeleted = null;
  }

  async connect(onNotificationReceived, onNotificationDeleted) {
    if (this.connection) {
      await this.disconnect();
    }

    this.onNotificationReceived = onNotificationReceived;
    this.onNotificationDeleted = onNotificationDeleted;

    this.connection = createSignalRConnection('/hubs/notifications');

    // Handle receiving new notifications
    this.connection.on('ReceiveNotification', (notification) => {
      if (this.onNotificationReceived) {
        this.onNotificationReceived(notification);
      }
    });

    // Handle notification deletion
    this.connection.on('NotificationDeleted', (notificationId) => {
      if (this.onNotificationDeleted) {
        this.onNotificationDeleted(notificationId);
      }
    });

    // Handle notification marked as read
    this.connection.on('NotificationMarkedAsRead', (notificationId) => {
      console.log('Notification marked as read:', notificationId);
    });

    try {
      await this.connection.start();
      console.log('Connected to notifications hub');
    } catch (error) {
      console.error('Error connecting to notifications hub:', error);
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('Disconnected from notifications hub');
      } catch (error) {
        console.error('Error disconnecting from notifications hub:', error);
      }
      this.connection = null;
    }
  }

  async markAsRead(notificationId) {
    if (this.connection) {
      try {
        await this.connection.invoke('MarkAsRead', notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  }
}
