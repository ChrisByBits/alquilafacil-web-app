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

const groupedMessages = computed(() => {
  const groups = {};
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

const handleOutsideClick = () => {
  activeMessageMenu.value = null;
  showReactionPicker.value = null;
};
</script>

<template>
  <div
    ref="messagesContainer"
    class="messages-container flex-1 overflow-y-auto p-6 space-y-4"
    @click="handleOutsideClick"
  >
    <!-- Empty state -->
    <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full">
      <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Sin mensajes aun</h3>
      <p class="text-gray-500 text-center max-w-xs">Envia el primer mensaje para iniciar la conversacion</p>
    </div>

    <!-- Messages grouped by date -->
    <template v-for="(dayMessages, date) in groupedMessages" :key="date">
      <!-- Date separator -->
      <div class="flex items-center justify-center my-6">
        <div class="px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
          <span class="text-xs font-medium text-gray-500 capitalize">
            {{ formatDate(dayMessages[0].sentAt) }}
          </span>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="message in dayMessages"
        :key="message.id"
        class="message-wrapper flex group"
        :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
      >
        <!-- Message actions for other user's messages -->
        <div
          v-if="!isOwnMessage(message)"
          class="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            @click.stop="toggleReactionPicker(message.id)"
            class="p-1.5 hover:bg-white/80 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            title="Reaccionar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div class="relative max-w-[75%] lg:max-w-[60%]">
          <!-- Message bubble -->
          <div
            :class="[
              'message px-4 py-3 shadow-sm',
              isOwnMessage(message)
                ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-white rounded-2xl rounded-br-md'
                : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100',
              message.isDeleted ? 'italic opacity-60' : ''
            ]"
          >
            <!-- Deleted message -->
            <div v-if="message.isDeleted" class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Este mensaje fue eliminado</span>
            </div>

            <!-- Normal message -->
            <template v-else>
              <p class="break-words leading-relaxed">{{ message.content }}</p>
              <span v-if="message.isEdited" class="text-xs opacity-60 ml-1">(editado)</span>
            </template>

            <!-- Time and status -->
            <div class="flex items-center justify-end gap-1.5 mt-1.5">
              <span :class="['text-xs', isOwnMessage(message) ? 'text-white/70' : 'text-gray-400']">
                {{ formatTime(message.sentAt) }}
              </span>
              <!-- Read status -->
              <span v-if="isOwnMessage(message)" class="text-xs">
                <svg v-if="message.isRead" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.59 3.59L6 15.17l-3.59-3.58L1 13l5 5 13-13z"/>
                  <path d="M22.59 3.59L11 15.17l-1.59-1.58L8 15l3 3 13-13z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </span>
            </div>
          </div>

          <!-- Reactions display -->
          <div
            v-if="getMessageReactions(message).length > 0"
            :class="[
              'absolute -bottom-3 flex gap-1',
              isOwnMessage(message) ? 'right-2' : 'left-2'
            ]"
          >
            <button
              v-for="reaction in getMessageReactions(message)"
              :key="reaction.emoji"
              @click.stop="handleReaction(message.id, reaction.emoji)"
              :class="[
                'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border-2 transition-all shadow-sm',
                hasUserReacted(message, reaction.emoji)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              ]"
            >
              <span>{{ reaction.emoji }}</span>
              <span class="text-gray-600 font-medium">{{ reaction.count }}</span>
            </button>
          </div>

          <!-- Reaction picker -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showReactionPicker === message.id"
              :class="[
                'absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-1 z-10',
                isOwnMessage(message) ? 'right-0' : 'left-0'
              ]"
              @click.stop
            >
              <button
                v-for="emoji in reactionEmojis"
                :key="emoji"
                @click="handleReaction(message.id, emoji)"
                class="p-2 hover:bg-gray-100 rounded-xl text-xl transition-all hover:scale-125"
              >
                {{ emoji }}
              </button>
            </div>
          </transition>

          <!-- Context menu -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="activeMessageMenu === message.id && isOwnMessage(message) && !message.isDeleted"
              class="absolute top-0 right-full mr-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 min-w-[120px]"
              @click.stop
            >
              <button
                v-if="canEditMessage(message)"
                @click="handleEdit(message)"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                @click="handleDelete(message)"
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </transition>
        </div>

        <!-- Message actions for own messages -->
        <div
          v-if="isOwnMessage(message) && !message.isDeleted"
          class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            @click.stop="toggleReactionPicker(message.id)"
            class="p-1.5 hover:bg-white/80 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            title="Reaccionar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            @click.stop="toggleMessageMenu(message.id)"
            class="p-1.5 hover:bg-white/80 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            title="Mas opciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- Typing indicator -->
    <div v-if="typingUsers.length > 0" class="flex items-center gap-3 pl-4">
      <div class="flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
        </div>
      </div>
      <span class="text-sm text-gray-500">escribiendo...</span>
    </div>
  </div>
</template>

<style scoped>
.messages-container {
  scroll-behavior: smooth;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.message-wrapper {
  margin-bottom: 4px;
}

.message-wrapper + .message-wrapper {
  margin-top: 2px;
}
</style>
