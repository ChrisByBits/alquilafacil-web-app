<script setup>
import { defineProps, computed, ref } from 'vue';
import StarRating from 'vue3-star-ratings';
import { CommentResponse } from '../model/comment.response';

const props = defineProps({
  comment: Object,
  showHelpful: {
    type: Boolean,
    default: true
  }
});

const commentResponse = new CommentResponse(props.comment);

const helpfulCount = ref(props.comment.helpfulCount || 0);
const markedHelpful = ref(false);

const formattedDate = computed(() => {
  if (!props.comment.createdAt) return '';
  const date = new Date(props.comment.createdAt);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const ratingColor = computed(() => {
  const rating = commentResponse.rating;
  if (rating >= 4) return 'text-green-600 bg-green-100';
  if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
});

const userInitials = computed(() => {
  if (!commentResponse.userUsername) return 'U';
  return commentResponse.userUsername.substring(0, 2).toUpperCase();
});

const markHelpful = () => {
  if (!markedHelpful.value) {
    helpfulCount.value++;
    markedHelpful.value = true;
  }
};
</script>

<template>
  <div class="comment-card bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="w-12 h-12 bg-gradient-to-br from-(--primary-color) to-(--secondary-color) rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {{ userInitials }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-semibold text-gray-800 truncate">{{ commentResponse.userUsername }}</h4>
            <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', ratingColor]">
              {{ commentResponse.rating }}/5
            </span>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <StarRating
              :model-value="commentResponse.rating"
              :star-color="'#fbbf24'"
              :inactive-color="'#e5e7eb'"
              :number-of-stars="5"
              :star-size="16"
              :disable-click="true"
            />
            <span v-if="formattedDate" class="text-xs text-gray-400">{{ formattedDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <p class="text-gray-700 text-sm leading-relaxed">{{ commentResponse.text }}</p>
    </div>

    <!-- Footer -->
    <div v-if="showHelpful" class="px-4 pb-4 flex items-center justify-between">
      <button
        @click="markHelpful"
        :class="[
          'flex items-center gap-1 text-sm transition-colors',
          markedHelpful ? 'text-(--primary-color)' : 'text-gray-500 hover:text-(--primary-color)'
        ]"
        :disabled="markedHelpful"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{{ markedHelpful ? 'Marcaste como util' : 'Util' }}</span>
        <span v-if="helpfulCount > 0" class="text-gray-400">({{ helpfulCount }})</span>
      </button>

      <!-- Verified badge if applicable -->
      <div v-if="comment.verified" class="flex items-center gap-1 text-green-600 text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>Verificado</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-card {
  border: 1px solid #f3f4f6;
}
</style>