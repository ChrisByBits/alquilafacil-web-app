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
</script>

<template>
  <div class="conversation-list">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Conversaciones</h2>
    <div v-if="conversations.length === 0" class="text-gray-500 text-center py-4">
      No tienes conversaciones activas
    </div>
    <div
      v-for="conversation in conversations"
      :key="conversation.id"
      @click="emit('select-conversation', conversation)"
      class="conversation-item p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      :class="{ 'bg-blue-50': currentConversationId === conversation.id }"
    >
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-(--primary-color) rounded-full flex items-center justify-center text-white font-semibold">
          U{{ getOtherParticipantId(conversation) }}
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-800">Usuario #{{ getOtherParticipantId(conversation) }}</span>
            <span class="text-xs text-gray-500">{{ formatDate(conversation.lastMessageAt || conversation.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-list {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}
</style>
