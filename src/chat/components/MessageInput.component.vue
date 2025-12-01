<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  editingMessage: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['send-message', 'typing-start', 'typing-stop', 'update-message', 'cancel-edit']);

const messageText = ref('');
const inputRef = ref(null);
const showEmojiPicker = ref(false);
let typingTimeout = null;

const quickEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🙏', '😮', '😢', '🔥', '✨', '👋', '🤔'];

watch(() => props.editingMessage, (newVal) => {
  if (newVal) {
    messageText.value = newVal.content;
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

const sendMessage = () => {
  if (messageText.value.trim()) {
    if (props.editingMessage) {
      emit('update-message', {
        messageId: props.editingMessage.id,
        content: messageText.value.trim()
      });
    } else {
      emit('send-message', messageText.value.trim());
    }
    messageText.value = '';
    emit('typing-stop');
    showEmojiPicker.value = false;
  }
};

const cancelEdit = () => {
  messageText.value = '';
  emit('cancel-edit');
};

const handleInput = () => {
  emit('typing-start');

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    emit('typing-stop');
  }, 1000);
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
  if (event.key === 'Escape' && props.editingMessage) {
    cancelEdit();
  }
};

const insertEmoji = (emoji) => {
  messageText.value += emoji;
  inputRef.value?.focus();
};

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};
</script>

<template>
  <div class="message-input-container bg-white border-t border-gray-100">
    <!-- Editing indicator -->
    <div
      v-if="editingMessage"
      class="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <span class="text-sm font-medium text-amber-800">Editando mensaje</span>
          <p class="text-xs text-amber-600 truncate max-w-[200px]">{{ editingMessage.content }}</p>
        </div>
      </div>
      <button
        @click="cancelEdit"
        class="p-2 text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Main input area -->
    <div class="flex items-center gap-3 p-4">
      <!-- Attachment button -->
      <button
        class="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        title="Adjuntar archivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      <!-- Emoji button -->
      <div class="relative">
        <button
          @click="toggleEmojiPicker"
          class="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          :class="{ 'bg-gray-100 text-gray-600': showEmojiPicker }"
          title="Emojis"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Emoji picker popup -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showEmojiPicker"
            class="absolute bottom-full left-0 mb-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-10"
          >
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="emoji in quickEmojis"
                :key="emoji"
                @click="insertEmoji(emoji)"
                class="w-10 h-10 text-2xl hover:bg-gray-100 rounded-xl transition-all hover:scale-110 flex items-center justify-center"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Text input -->
      <div class="flex-1 relative">
        <input
          ref="inputRef"
          v-model="messageText"
          @input="handleInput"
          @keydown="handleKeyDown"
          type="text"
          :placeholder="editingMessage ? 'Edita tu mensaje...' : 'Escribe un mensaje...'"
          class="w-full px-5 py-3 bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]/30 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
        />
      </div>

      <!-- Send button -->
      <button
        @click="sendMessage"
        :disabled="!messageText.trim()"
        :class="[
          'p-3.5 rounded-xl transition-all duration-200 flex items-center justify-center',
          messageText.trim()
            ? editingMessage
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105'
              : 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white shadow-lg shadow-[var(--secondary-color)]/30 hover:shadow-xl hover:shadow-[var(--secondary-color)]/40 hover:scale-105'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        ]"
      >
        <svg v-if="editingMessage" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.message-input-container {
  backdrop-filter: blur(10px);
}
</style>
