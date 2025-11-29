<script setup>
import { ref, watch, nextTick, computed } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  currentUserId: {
    type: Number,
    required: true
  },
  typingUsers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['edit-message', 'delete-message', 'react-to-message']);

const messagesContainer = ref(null);
const activeMessageMenu = ref(null);
const showReactionPicker = ref(null);

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(() => props.messages, () => {
  scrollToBottom();
}, { deep: true });

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  }
  return date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
};

const isOwnMessage = (message) => message.senderId === props.currentUserId;

const canEditMessage = (message) => {
  if (!isOwnMessage(message)) return false;
  // Allow editing within 15 minutes
  const sentTime = new Date(message.sentAt);
  const now = new Date();
  const diffMinutes = (now - sentTime) / (1000 * 60);
  return diffMinutes <= 15;
};

const toggleMessageMenu = (messageId) => {
  activeMessageMenu.value = activeMessageMenu.value === messageId ? null : messageId;
  showReactionPicker.value = null;
};

const toggleReactionPicker = (messageId) => {
  showReactionPicker.value = showReactionPicker.value === messageId ? null : messageId;
  activeMessageMenu.value = null;
};

const handleEdit = (message) => {
  emit('edit-message', message);
  activeMessageMenu.value = null;
};

const handleDelete = (message) => {
  if (confirm('¿Estas seguro de eliminar este mensaje?')) {
    emit('delete-message', message.id);
  }
  activeMessageMenu.value = null;
};

const handleReaction = (messageId, emoji) => {
  emit('react-to-message', { messageId, emoji });
  showReactionPicker.value = null;
};

const getMessageReactions = (message) => {
  if (!message.reactions) return [];
  const grouped = {};
  message.reactions.forEach(r => {
    if (!grouped[r.emoji]) {
      grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
    }
    grouped[r.emoji].count++;
    grouped[r.emoji].users.push(r.userId);
  });
  return Object.values(grouped);
};

const hasUserReacted = (message, emoji) => {
  if (!message.reactions) return false;
  return message.reactions.some(r => r.emoji === emoji && r.userId === props.currentUserId);
};

// Group messages by date
const groupedMessages = computed(() => {
  const groups = {};
  // Messages come in reverse order (newest first), so we reverse them
  const reversedMessages = [...props.messages].reverse();

  reversedMessages.forEach(message => {
    const date = new Date(message.sentAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return groups;
});

// Close menus when clicking outside
const handleOutsideClick = () => {
  activeMessageMenu.value = null;
  showReactionPicker.value = null;
};
</script>

<template>
  <div
    ref="messagesContainer"
    class="messages-container flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
    @click="handleOutsideClick"
  >
    <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p>No hay mensajes. ¡Inicia la conversacion!</p>
    </div>

    <template v-for="(dayMessages, date) in groupedMessages" :key="date">
      <div class="text-center my-4">
        <span class="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full capitalize">
          {{ formatDate(dayMessages[0].sentAt) }}
        </span>
      </div>

      <div
        v-for="message in dayMessages"
        :key="message.id"
        class="message-wrapper flex group"
        :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
      >
        <!-- Message actions for other user's messages (left side) -->
        <div
          v-if="!isOwnMessage(message)"
          class="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            @click.stop="toggleReactionPicker(message.id)"
            class="p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
            title="Reaccionar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div class="relative">
          <div
            class="message max-w-xs lg:max-w-md px-4 py-2 rounded-2xl"
            :class="[
              isOwnMessage(message)
                ? 'bg-(--secondary-color) text-white rounded-br-md'
                : 'bg-white text-gray-800 shadow rounded-bl-md',
              message.isDeleted ? 'italic opacity-60' : ''
            ]"
          >
            <!-- Deleted message -->
            <p v-if="message.isDeleted" class="break-words text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Este mensaje fue eliminado
            </p>

            <!-- Normal message -->
            <template v-else>
              <p class="break-words">{{ message.content }}</p>
              <span v-if="message.isEdited" class="text-xs opacity-60">(editado)</span>
            </template>

            <div class="flex items-center justify-end gap-1 mt-1">
              <span class="text-xs opacity-70">{{ formatTime(message.sentAt) }}</span>
              <span v-if="isOwnMessage(message) && message.isRead" class="text-xs">✓✓</span>
              <span v-else-if="isOwnMessage(message)" class="text-xs opacity-60">✓</span>
            </div>
          </div>

          <!-- Reactions display -->
          <div
            v-if="getMessageReactions(message).length > 0"
            class="absolute -bottom-3 left-2 flex gap-1"
          >
            <button
              v-for="reaction in getMessageReactions(message)"
              :key="reaction.emoji"
              @click.stop="handleReaction(message.id, reaction.emoji)"
              :class="[
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors',
                hasUserReacted(message, reaction.emoji)
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              ]"
            >
              <span>{{ reaction.emoji }}</span>
              <span class="text-gray-600">{{ reaction.count }}</span>
            </button>
          </div>

          <!-- Reaction picker -->
          <div
            v-if="showReactionPicker === message.id"
            class="absolute bottom-full mb-2 left-0 bg-white rounded-full shadow-lg border border-gray-200 p-1 flex gap-1 z-10"
            @click.stop
          >
            <button
              v-for="emoji in reactionEmojis"
              :key="emoji"
              @click="handleReaction(message.id, emoji)"
              class="p-1.5 hover:bg-gray-100 rounded-full text-lg transition-transform hover:scale-125"
            >
              {{ emoji }}
            </button>
          </div>

          <!-- Context menu -->
          <div
            v-if="activeMessageMenu === message.id && isOwnMessage(message) && !message.isDeleted"
            class="absolute top-0 right-full mr-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
            @click.stop
          >
            <button
              v-if="canEditMessage(message)"
              @click="handleEdit(message)"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              @click="handleDelete(message)"
              class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <!-- Message actions for own messages (right side) -->
        <div
          v-if="isOwnMessage(message) && !message.isDeleted"
          class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            @click.stop="toggleReactionPicker(message.id)"
            class="p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
            title="Reaccionar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            @click.stop="toggleMessageMenu(message.id)"
            class="p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
            title="Mas opciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <div v-if="typingUsers.length > 0" class="typing-indicator flex items-center gap-2 text-gray-500 text-sm pl-2">
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      <span>escribiendo...</span>
    </div>
  </div>
</template>

<style scoped>
.messages-container {
  scroll-behavior: smooth;
}
</style>
