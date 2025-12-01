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
  // TODO: Integrate with backend when ready
  console.log('Update message:', messageId, content);
  editingMessage.value = null;
};

const handleDeleteMessage = async (messageId) => {
  // TODO: Integrate with backend when ready
  console.log('Delete message:', messageId);
};

const handleReactToMessage = async ({ messageId, emoji }) => {
  // TODO: Integrate with backend when ready
  console.log('React to message:', messageId, emoji);
};
</script>

<template>
  <NavbarComponent />
  <div class="chat-page h-[calc(100vh-64px)] flex bg-white mt-16">
    <!-- Conversations sidebar -->
    <div
      class="conversations-sidebar w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white"
      :class="{ 'hidden md:block': !showMobileConversations && currentConversation }"
    >
      <div class="p-4 border-b border-gray-200 bg-(--primary-color)">
        <h1 class="text-xl font-bold text-white">Chat</h1>
      </div>
      <ConversationListComponent
        :conversations="conversations"
        :current-conversation-id="currentConversation?.id"
        :current-user-id="currentUserId"
        @select-conversation="selectConversation"
      />
    </div>

    <!-- Chat area -->
    <div
      class="chat-area flex-1 flex flex-col"
      :class="{ 'hidden md:flex': showMobileConversations }"
    >
      <template v-if="currentConversation">
        <!-- Chat header -->
        <div class="chat-header flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
          <button
            @click="goBackToConversations"
            class="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="w-10 h-10 bg-(--primary-color) rounded-full flex items-center justify-center text-white font-semibold">
            U{{ otherParticipantId }}
          </div>
          <div class="flex-1">
            <h2 class="font-semibold text-gray-800">
              Usuario #{{ otherParticipantId }}
            </h2>
            <ResponseTimeIndicatorComponent
              v-if="otherParticipantId"
              :user-id="otherParticipantId"
            />
          </div>
        </div>

        <!-- Messages -->
        <MessageListComponent
          :messages="messages"
          :current-user-id="currentUserId"
          :typing-users="typingUsers"
          @edit-message="handleEditMessage"
          @delete-message="handleDeleteMessage"
          @react-to-message="handleReactToMessage"
        />

        <!-- Input -->
        <MessageInputComponent
          :editing-message="editingMessage"
          @send-message="sendMessage"
          @typing-start="handleTypingStart"
          @typing-stop="handleTypingStop"
          @update-message="handleUpdateMessage"
          @cancel-edit="handleCancelEdit"
        />
      </template>

      <template v-else>
        <div class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-lg">Selecciona una conversación</p>
            <p class="text-sm">o inicia una nueva desde el perfil de un usuario</p>
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
</style>
