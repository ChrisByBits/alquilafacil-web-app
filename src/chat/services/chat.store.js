import { defineStore } from "pinia";
import { ChatService } from "./chat.service.js";

const chatService = new ChatService();

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    unreadCount: 0,
    isConnected: false,
    typingUsers: [],
    userMetrics: {},
    currentParticipantMetrics: null
  }),
  getters: {
    getConversations: (state) => state.conversations,
    getCurrentConversation: (state) => state.currentConversation,
    getMessages: (state) => state.messages,
    getUnreadCount: (state) => state.unreadCount,
    getIsConnected: (state) => state.isConnected,
    getTypingUsers: (state) => state.typingUsers,
    getUserMetrics: (state) => state.userMetrics,
    getCurrentParticipantMetrics: (state) => state.currentParticipantMetrics
  },
  actions: {
    async connectToChat() {
      try {
        await chatService.connectToHub();
        this.isConnected = true;

        // Set up event listeners
        chatService.onReceiveMessage((message) => {
          this.messages.unshift(message);
        });

        chatService.onNewMessageNotification((notification) => {
          this.unreadCount++;
          // Optionally update conversation list
        });

        chatService.onMessagesRead((data) => {
          // Update messages read status
          this.messages = this.messages.map(msg => {
            if (msg.conversationId === data.conversationId && msg.senderId !== data.readByUserId) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
        });

        chatService.onUserTyping((data) => {
          if (!this.typingUsers.includes(data.userId)) {
            this.typingUsers.push(data.userId);
          }
        });

        chatService.onUserStoppedTyping((data) => {
          this.typingUsers = this.typingUsers.filter(id => id !== data.userId);
        });

      } catch (error) {
        console.error('Error connecting to chat hub:', error);
        this.isConnected = false;
      }
    },

    async disconnectFromChat() {
      await chatService.disconnectFromHub();
      this.isConnected = false;
    },

    async loadConversations(userId) {
      try {
        this.conversations = await chatService.getConversationsByUserId(userId);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    },

    async loadMessages(conversationId) {
      try {
        this.messages = await chatService.getMessagesByConversationId(conversationId);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    },

    async setCurrentConversation(conversation) {
      if (this.currentConversation) {
        await chatService.leaveConversation(this.currentConversation.id);
      }
      this.currentConversation = conversation;
      if (conversation) {
        await chatService.joinConversation(conversation.id);
        await this.loadMessages(conversation.id);
      }
    },

    async sendMessage(content, senderId) {
      if (!this.currentConversation) return;

      try {
        await chatService.sendMessageRealtime(
          this.currentConversation.id,
          senderId,
          content
        );
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },

    async createOrGetConversation(userId, otherUserId) {
      try {
        // Try to find existing conversation
        const existing = await chatService.getConversationBetweenUsers(userId, otherUserId);
        return existing;
      } catch (error) {
        // Create new conversation if not exists
        const newConversation = await chatService.createConversation(userId, otherUserId);
        this.conversations.push(newConversation);
        return newConversation;
      }
    },

    async markAsRead(userId) {
      if (!this.currentConversation) return;

      try {
        await chatService.markAsReadRealtime(this.currentConversation.id, userId);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },

    async loadUnreadCount(userId) {
      try {
        const response = await chatService.getUnreadMessageCount(userId);
        this.unreadCount = response.unreadCount;
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    },

    async startTyping(userId) {
      if (!this.currentConversation) return;
      await chatService.startTyping(this.currentConversation.id, userId);
    },

    async stopTyping(userId) {
      if (!this.currentConversation) return;
      await chatService.stopTyping(this.currentConversation.id, userId);
    },

    async loadUserMetrics(userId) {
      try {
        const metrics = await chatService.getChatMetricsByUserId(userId);
        this.userMetrics[userId] = metrics;
        return metrics;
      } catch (error) {
        console.error('Error loading user metrics:', error);
        return null;
      }
    },

    async loadCurrentParticipantMetrics(currentUserId) {
      if (!this.currentConversation) return null;

      const otherUserId = this.currentConversation.participantOneId === currentUserId
        ? this.currentConversation.participantTwoId
        : this.currentConversation.participantOneId;

      try {
        this.currentParticipantMetrics = await chatService.getChatMetricsByUserId(otherUserId);
        return this.currentParticipantMetrics;
      } catch (error) {
        console.error('Error loading participant metrics:', error);
        this.currentParticipantMetrics = null;
        return null;
      }
    },

    getOtherParticipantId(currentUserId) {
      if (!this.currentConversation) return null;
      return this.currentConversation.participantOneId === currentUserId
        ? this.currentConversation.participantTwoId
        : this.currentConversation.participantOneId;
    }
  }
});
