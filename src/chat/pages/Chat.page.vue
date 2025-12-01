<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import NavbarComponent from '@/public/components/Navbar.component.vue';
import { useAuthenticationStore } from '@/auth/services/authentication.store';
import { useChatStore } from '../services/chat.store';
import ConversationListComponent from '../components/ConversationList.component.vue';
import MessageListComponent from '../components/MessageList.component.vue';
import MessageInputComponent from '../components/MessageInput.component.vue';
import ResponseTimeIndicatorComponent from '../components/ResponseTimeIndicator.component.vue';

const authStore = useAuthenticationStore();
const chatStore = useChatStore();

const currentUserId = computed(() => authStore.currentUserId);
const conversations = computed(() => chatStore.getConversations);
const currentConversation = computed(() => chatStore.getCurrentConversation);
const messages = computed(() => chatStore.getMessages);
const typingUsers = computed(() => chatStore.getTypingUsers);

const otherParticipantId = computed(() => {
  if (!currentConversation.value) return null;
  return currentConversation.value.participantOneId === currentUserId.value
    ? currentConversation.value.participantTwoId
    : currentConversation.value.participantOneId;
});

const showMobileConversations = ref(true);
const editingMessage = ref(null);
const isOnline = ref(true);

onMounted(async () => {
  if (currentUserId.value) {
    await chatStore.connectToChat();
    await chatStore.loadConversations(currentUserId.value);
    await chatStore.loadUnreadCount(currentUserId.value);
  }
});

onUnmounted(async () => {
  await chatStore.disconnectFromChat();
});

const selectConversation = async (conversation) => {
  await chatStore.setCurrentConversation(conversation);
  await chatStore.markAsRead(currentUserId.value);
  showMobileConversations.value = false;
  editingMessage.value = null;
};

const sendMessage = async (content) => {
  await chatStore.sendMessage(content, currentUserId.value);
};

const handleTypingStart = () => {
  chatStore.startTyping(currentUserId.value);
};

const handleTypingStop = () => {
  chatStore.stopTyping(currentUserId.value);
};

const goBackToConversations = () => {
  showMobileConversations.value = true;
  editingMessage.value = null;
};

const handleEditMessage = (message) => {
  editingMessage.value = message;
};

const handleCancelEdit = () => {
  editingMessage.value = null;
};

const handleUpdateMessage = async ({ messageId, content }) => {
  console.log('Update message:', messageId, content);
  editingMessage.value = null;
};

const handleDeleteMessage = async (messageId) => {
  console.log('Delete message:', messageId);
};

const handleReactToMessage = async ({ messageId, emoji }) => {
  console.log('React to message:', messageId, emoji);
};

const getInitials = (id) => {
  return `U${id}`;
};
</script>

<template>
  <NavbarComponent />
  <div class="chat-page h-[calc(100vh-64px)] flex bg-gradient-to-br from-gray-50 to-gray-100 mt-16">
    <!-- Conversations sidebar -->
    <div
      class="conversations-sidebar w-full md:w-96 lg:w-[420px] bg-white shadow-xl flex flex-col"
      :class="{ 'hidden md:flex': !showMobileConversations && currentConversation }"
    >
      <!-- Sidebar Header -->
      <div class="p-5 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">Mensajes</h1>
            <p class="text-white/70 text-sm mt-1">{{ conversations.length }} conversaciones</p>
          </div>
          <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        <!-- Search bar -->
        <div class="mt-4 relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar conversacion..."
            class="w-full pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/30 transition-all"
          />
        </div>
      </div>

      <!-- Conversations List -->
      <div class="flex-1 overflow-hidden">
        <ConversationListComponent
          :conversations="conversations"
          :current-conversation-id="currentConversation?.id"
          :current-user-id="currentUserId"
          @select-conversation="selectConversation"
        />
      </div>
    </div>

    <!-- Chat area -->
    <div
      class="chat-area flex-1 flex flex-col bg-white md:rounded-l-3xl md:shadow-2xl overflow-hidden"
      :class="{ 'hidden md:flex': showMobileConversations }"
    >
      <template v-if="currentConversation">
        <!-- Chat header -->
        <div class="chat-header flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
          <button
            @click="goBackToConversations"
            class="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- User avatar with status -->
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {{ getInitials(otherParticipantId) }}
            </div>
            <div
              class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
              :class="isOnline ? 'bg-green-500' : 'bg-gray-400'"
            ></div>
          </div>

          <div class="flex-1">
            <h2 class="font-semibold text-gray-800 text-lg">
              Usuario #{{ otherParticipantId }}
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-sm" :class="isOnline ? 'text-green-500' : 'text-gray-400'">
                {{ isOnline ? 'En linea' : 'Desconectado' }}
              </span>
              <span class="text-gray-300">|</span>
              <ResponseTimeIndicatorComponent
                v-if="otherParticipantId"
                :user-id="otherParticipantId"
              />
            </div>
          </div>

          <!-- Header actions -->
          <div class="flex items-center gap-2">
            <button class="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button class="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button class="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages area with gradient background -->
        <div class="flex-1 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none"></div>
          <MessageListComponent
            :messages="messages"
            :current-user-id="currentUserId"
            :typing-users="typingUsers"
            @edit-message="handleEditMessage"
            @delete-message="handleDeleteMessage"
            @react-to-message="handleReactToMessage"
          />
        </div>

        <!-- Input area -->
        <MessageInputComponent
          :editing-message="editingMessage"
          @send-message="sendMessage"
          @typing-start="handleTypingStart"
          @typing-stop="handleTypingStop"
          @update-message="handleUpdateMessage"
          @cancel-edit="handleCancelEdit"
        />
      </template>

      <!-- Empty state - No conversation selected -->
      <template v-else>
        <div class="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div class="text-center max-w-md px-8">
            <div class="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[var(--primary-color)]/10 to-[var(--secondary-color)]/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Tus mensajes</h3>
            <p class="text-gray-500 mb-6">
              Selecciona una conversacion para comenzar a chatear o inicia una nueva desde el perfil de un propietario.
            </p>
            <div class="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Mensajes seguros</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Notificaciones activas</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  overflow: hidden;
}

.conversations-sidebar {
  border-right: 1px solid rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .chat-area {
    margin-left: -1rem;
  }
}
</style>
