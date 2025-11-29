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

const quickEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🙏', '😮', '😢', '🔥', '✨'];

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
  <div class="message-input-container">
    <!-- Editing indicator -->
    <div
      v-if="editingMessage"
      class="flex items-center justify-between px-4 py-2 bg-yellow-50 border-t border-yellow-200"
    >
      <div class="flex items-center gap-2 text-sm text-yellow-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Editando mensaje</span>
      </div>
      <button
        @click="cancelEdit"
        class="text-yellow-600 hover:text-yellow-800 text-sm"
      >
        Cancelar
      </button>
    </div>

    <!-- Main input area -->
    <div class="flex items-center gap-2 p-4 bg-white border-t border-gray-200">
      <!-- Emoji button -->
      <div class="relative">
        <button
          @click="toggleEmojiPicker"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Emojis"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Emoji picker popup -->
        <div
          v-if="showEmojiPicker"
          class="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10"
        >
          <div class="grid grid-cols-5 gap-1">
            <button
              v-for="emoji in quickEmojis"
              :key="emoji"
              @click="insertEmoji(emoji)"
              class="p-2 text-xl hover:bg-gray-100 rounded-lg transition-transform hover:scale-110"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>

      <!-- Text input -->
      <input
        ref="inputRef"
        v-model="messageText"
        @input="handleInput"
        @keydown="handleKeyDown"
        type="text"
        :placeholder="editingMessage ? 'Edita tu mensaje...' : 'Escribe un mensaje...'"
        class="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-(--secondary-color) focus:ring-1 focus:ring-(--secondary-color)"
      />

      <!-- Send button -->
      <button
        @click="sendMessage"
        :disabled="!messageText.trim()"
        :class="[
          'p-3 rounded-full transition-all',
          editingMessage
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-(--secondary-color) hover:opacity-90 text-white',
          !messageText.trim() ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <svg v-if="editingMessage" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>
