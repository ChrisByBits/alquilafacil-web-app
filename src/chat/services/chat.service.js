import http from "@/shared/services/http-common.js";
import * as signalR from "@microsoft/signalr";

export class ChatService {
  constructor() {
    this.hubConnection = null;
  }

  async createConversation(participantOneId, participantTwoId) {
    const response = await http.post('/conversations', {
      participantOneId,
      participantTwoId
    });
    return response.data;
  }

  async getConversationById(conversationId) {
    const response = await http.get(`/conversations/${conversationId}`);
    return response.data;
  }

  async getConversationsByUserId(userId) {
    const response = await http.get(`/conversations/user/${userId}`);
    return response.data;
  }

  async getConversationBetweenUsers(userOneId, userTwoId) {
    const response = await http.get(`/conversations/between/${userOneId}/${userTwoId}`);
    return response.data;
  }

  async getMessagesByConversationId(conversationId, pageNumber = 1, pageSize = 50) {
    const response = await http.get(`/conversations/${conversationId}/messages`, {
      params: { pageNumber, pageSize }
    });
    return response.data;
  }

  async sendMessage(conversationId, senderId, content) {
    const response = await http.post('/conversations/messages', {
      conversationId,
      senderId,
      content
    });
    return response.data;
  }

  async markMessagesAsRead(conversationId, userId) {
    const response = await http.post(`/conversations/${conversationId}/read`, null, {
      params: { userId }
    });
    return response.data;
  }

  async getUnreadMessageCount(userId) {
    const response = await http.get(`/conversations/unread/${userId}`);
    return response.data;
  }

  // Chat Metrics Methods
  async getChatMetricsByUserId(userId) {
    const response = await http.get(`/conversations/metrics/user/${userId}`);
    return response.data;
  }

  async getAverageResponseTime(userId) {
    const response = await http.get(`/conversations/metrics/user/${userId}/average-response-time`);
    return response.data;
  }

  // SignalR Connection Methods
  async connectToHub() {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    await this.hubConnection.start();
    return this.hubConnection;
  }

  async disconnectFromHub() {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  async joinConversation(conversationId) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('JoinConversation', conversationId);
    }
  }

  async leaveConversation(conversationId) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('LeaveConversation', conversationId);
    }
  }

  async sendMessageRealtime(conversationId, senderId, content) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('SendMessage', conversationId, senderId, content);
    }
  }

  async markAsReadRealtime(conversationId, userId) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('MarkAsRead', conversationId, userId);
    }
  }

  async startTyping(conversationId, userId) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('StartTyping', conversationId, userId);
    }
  }

  async stopTyping(conversationId, userId) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('StopTyping', conversationId, userId);
    }
  }

  onReceiveMessage(callback) {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveMessage', callback);
    }
  }

  onNewMessageNotification(callback) {
    if (this.hubConnection) {
      this.hubConnection.on('NewMessageNotification', callback);
    }
  }

  onMessagesRead(callback) {
    if (this.hubConnection) {
      this.hubConnection.on('MessagesRead', callback);
    }
  }

  onUserTyping(callback) {
    if (this.hubConnection) {
      this.hubConnection.on('UserTyping', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.hubConnection) {
      this.hubConnection.on('UserStoppedTyping', callback);
    }
  }
}
