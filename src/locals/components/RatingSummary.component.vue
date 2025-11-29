<script setup>
import { computed } from 'vue';
import StarRating from 'vue3-star-ratings';

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  selectedRating: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['filter-by-rating']);

const totalReviews = computed(() => props.comments.length);

const averageRating = computed(() => {
  if (totalReviews.value === 0) return 0;
  const sum = props.comments.reduce((acc, comment) => acc + (comment.rating || 0), 0);
  return (sum / totalReviews.value).toFixed(1);
});

const ratingDistribution = computed(() => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  props.comments.forEach(comment => {
    const rating = Math.round(comment.rating || 0);
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });
  return distribution;
});

const getPercentage = (stars) => {
  if (totalReviews.value === 0) return 0;
  return ((ratingDistribution.value[stars] / totalReviews.value) * 100).toFixed(0);
};

const ratingLabel = computed(() => {
  const avg = parseFloat(averageRating.value);
  if (avg >= 4.5) return 'Excelente';
  if (avg >= 4) return 'Muy bueno';
  if (avg >= 3) return 'Bueno';
  if (avg >= 2) return 'Regular';
  return 'Necesita mejorar';
});

const handleBarClick = (stars) => {
  // Toggle filter: if same rating is clicked again, clear filter
  const newRating = props.selectedRating === stars ? 0 : stars;
  emit('filter-by-rating', newRating);
};
</script>

<template>
  <div class="rating-summary bg-white rounded-xl shadow-lg p-6 mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Resumen de calificaciones</h3>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Overall rating -->
      <div class="flex flex-col items-center justify-center md:w-1/3">
        <div class="text-5xl font-bold text-(--primary-color)">{{ averageRating }}</div>
        <StarRating
          :model-value="parseFloat(averageRating)"
          :star-color="'#fb9e49'"
          :inactive-color="'#e5e7eb'"
          :number-of-stars="5"
          :star-size="24"
          :disable-click="true"
          class="my-2"
        />
        <div class="text-sm text-gray-600">{{ totalReviews }} reseña{{ totalReviews !== 1 ? 's' : '' }}</div>
        <div class="mt-1 px-3 py-1 bg-(--primary-color)/10 text-(--primary-color) rounded-full text-sm font-medium">
          {{ ratingLabel }}
        </div>
      </div>

      <!-- Rating distribution -->
      <div class="flex-1 space-y-2">
        <button
          v-for="stars in [5, 4, 3, 2, 1]"
          :key="stars"
          @click="handleBarClick(stars)"
          class="flex items-center gap-3 w-full p-1 rounded-lg transition-all duration-200 hover:bg-gray-100"
          :class="{ 'bg-yellow-50 ring-2 ring-yellow-400': selectedRating === stars }"
        >
          <div class="w-12 text-sm text-gray-600 flex items-center gap-1">
            <span>{{ stars }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-yellow-400 rounded-full transition-all duration-500"
              :style="{ width: `${getPercentage(stars)}%` }"
            ></div>
          </div>
          <div class="w-12 text-sm text-gray-500 text-right">
            {{ ratingDistribution[stars] }}
          </div>
        </button>
      </div>
    </div>

    <!-- Clear filter hint -->
    <p v-if="selectedRating > 0" class="text-xs text-gray-500 mt-3 text-center">
      Mostrando solo {{ selectedRating }} estrella{{ selectedRating > 1 ? 's' : '' }}.
      <button @click="handleBarClick(selectedRating)" class="text-(--primary-color) hover:underline">
        Mostrar todas
      </button>
    </p>
  </div>
</template>

<style scoped>
.rating-summary {
  border: 1px solid #e5e7eb;
}
</style>
