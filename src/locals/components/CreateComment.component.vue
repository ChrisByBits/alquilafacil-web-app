<script setup>
import StarRating from 'vue3-star-ratings';
import { CommentsApiService } from '../services/comments-api.service';
import { useAuthenticationStore } from '../../auth/services/authentication.store';
import { useRouter } from 'vue-router';
import { CommentRequest } from '../model/comment.request';
import { ref, computed } from 'vue';

const props = defineProps({
  localId: Number
});

const emit = defineEmits(['comment-published']);

const commentsApiService = new CommentsApiService();
const authenticationStore = useAuthenticationStore();
const router = useRouter();
const text = ref('');
const rating = ref(0);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const errorMessage = ref('');

const characterCount = computed(() => text.value.length);
const maxCharacters = 500;

const ratingLabels = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente'
};

const currentRatingLabel = computed(() => {
  const roundedRating = Math.round(rating.value);
  return ratingLabels[roundedRating] || 'Selecciona una calificacion';
});

const isValid = computed(() => {
  return text.value.trim().length >= 10 && rating.value > 0;
});

const publishComment = async () => {
  if (!isValid.value || isSubmitting.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const commentRequest = new CommentRequest({
      userId: authenticationStore.userId,
      localId: props.localId,
      text: text.value.trim(),
      rating: Math.floor(rating.value)
    });
    await commentsApiService.create(commentRequest);
    showSuccess.value = true;
    emit('comment-published');

    setTimeout(() => {
      router.push(`/comments/${props.localId}`);
    }, 1500);
  } catch (error) {
    errorMessage.value = 'Error al publicar el comentario. Por favor, intentalo de nuevo mas tarde.';
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  text.value = '';
  rating.value = 0;
  showSuccess.value = false;
  errorMessage.value = '';
};
</script>

<template>
  <div class="create-comment bg-white rounded-xl shadow-lg p-6">
    <!-- Success message -->
    <div v-if="showSuccess" class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">Comentario publicado</h3>
      <p class="text-gray-600">Gracias por compartir tu experiencia</p>
    </div>

    <!-- Form -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-(--primary-color) rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-800">Escribir una resena</h3>
          <p class="text-sm text-gray-500">Comparte tu experiencia con otros usuarios</p>
        </div>
      </div>

      <!-- Rating section -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Tu calificacion</label>
        <div class="flex items-center gap-4">
          <StarRating
            v-model="rating"
            :max-rating="5"
            :increment="1"
            :star-size="36"
            inactive-color="#e5e7eb"
            active-color="#fbbf24"
          />
          <span
            v-if="rating > 0"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              rating >= 4 ? 'bg-green-100 text-green-700' :
              rating >= 3 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            ]"
          >
            {{ currentRatingLabel }}
          </span>
        </div>
        <p v-if="rating === 0" class="text-xs text-gray-400 mt-1">Haz clic en las estrellas para calificar</p>
      </div>

      <!-- Comment text -->
      <div class="mb-6">
        <label for="commentText" class="block text-sm font-medium text-gray-700 mb-2">Tu comentario</label>
        <div class="relative">
          <textarea
            id="commentText"
            v-model="text"
            placeholder="Cuentanos sobre tu experiencia en este espacio. ¿Que te gusto? ¿Que podria mejorar?"
            :maxlength="maxCharacters"
            class="w-full p-4 border border-gray-300 rounded-xl resize-none min-h-[150px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all"
          ></textarea>
          <div class="absolute bottom-3 right-3 text-xs" :class="characterCount > maxCharacters * 0.9 ? 'text-orange-500' : 'text-gray-400'">
            {{ characterCount }}/{{ maxCharacters }}
          </div>
        </div>
        <p v-if="text.length > 0 && text.length < 10" class="text-xs text-red-500 mt-1">El comentario debe tener al menos 10 caracteres</p>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Submit button -->
      <button
        @click="publishComment"
        :disabled="!isValid || isSubmitting"
        :class="[
          'w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300',
          isValid && !isSubmitting
            ? 'bg-(--secondary-color) hover:bg-(--primary-color) cursor-pointer'
            : 'bg-gray-300 cursor-not-allowed'
        ]"
      >
        <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Publicando...
        </span>
        <span v-else>Publicar resena</span>
      </button>

      <!-- Validation hints -->
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          :class="[
            'text-xs px-2 py-1 rounded-full',
            rating > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          ]"
        >
          {{ rating > 0 ? 'Calificacion agregada' : 'Agrega una calificacion' }}
        </span>
        <span
          :class="[
            'text-xs px-2 py-1 rounded-full',
            text.trim().length >= 10 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          ]"
        >
          {{ text.trim().length >= 10 ? 'Comentario listo' : 'Minimo 10 caracteres' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-comment {
  border: 1px solid #e5e7eb;
}
</style>
