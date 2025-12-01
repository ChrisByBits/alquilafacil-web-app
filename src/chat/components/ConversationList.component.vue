<script setup>
import { computed } from 'vue';

const props = defineProps({
  conversations: {
    type: Array,
    required: true
  },
  currentConversationId: {
    type: Number,
    default: null
  },
  currentUserId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['select-conversation']);

const getOtherParticipantId = (conversation) => {
  return conversation.participantOneId === props.currentUserId
    ? conversation.participantTwoId
    : conversation.participantOneId;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Ayer';
  } else if (days < 7) {
    return date.toLocaleDateString('es-PE', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
  }
};

const getInitials = (id) => {
  return `U${id}`;
};

const getRandomColor = (id) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
  ];
  return colors[id % colors.length];
};
</script>

<template>
  <div class="conversation-list h-full overflow-y-auto">
    <!-- Empty state -->
    <div v-if="conversations.length === 0" class="flex flex-col items-center justify-center h-full px-6 py-12">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Sin conversaciones</h3>
      <p class="text-gray-500 text-center text-sm">
        Inicia una conversacion desde el perfil de un propietario
      </p>
    </div>

    <!-- Conversations -->
    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        @click="emit('select-conversation', conversation)"
        class="conversation-item flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
        :class="{
          'bg-gradient-to-r from-[var(--primary-color)]/5 to-[var(--secondary-color)]/5 border-l-4 border-[var(--primary-color)]': currentConversationId === conversation.id,
          'border-l-4 border-transparent': currentConversationId !== conversation.id
        }"
      >
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <div
            :class="[
              'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md bg-gradient-to-br',
              getRandomColor(getOtherParticipantId(conversation))
            ]"
          >
            {{ getInitials(getOtherParticipantId(conversation)) }}
          </div>
          <!-- Online indicator -->
          <div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-gray-800 truncate">
              Usuario #{{ getOtherParticipantId(conversation) }}
            </span>
            <span class="text-xs text-gray-400 flex-shrink-0 ml-2">
              {{ formatDate(conversation.lastMessageAt || conversation.createdAt) }}
            </span>
          </div>

          <!-- Last message preview -->
          <div class="flex items-center gap-2">
            <p class="text-sm text-gray-500 truncate flex-1">
              {{ conversation.lastMessage || 'Inicia la conversacion...' }}
            </p>

            <!-- Unread badge -->
            <span
              v-if="conversation.unreadCount > 0"
              class="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[var(--secondary-color)] text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {{ conversation.unreadCount > 9 ? '9+' : conversation.unreadCount }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-list {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.conversation-list::-webkit-scrollbar {
  width: 6px;
}

.conversation-list::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-list::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.conversation-item:active {
  transform: scale(0.99);
}
</style>
