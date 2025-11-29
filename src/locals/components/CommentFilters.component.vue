<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  selectedRating: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['filter-change', 'sort-change']);

const localSelectedRating = ref(props.selectedRating);
const sortBy = ref('newest');

// Sync with parent when prop changes (e.g., from clicking rating bars)
watch(() => props.selectedRating, (newVal) => {
  localSelectedRating.value = newVal;
});

const ratingOptions = [
  { value: 0, label: 'Todas las estrellas' },
  { value: 5, label: '5 estrellas' },
  { value: 4, label: '4 estrellas' },
  { value: 3, label: '3 estrellas' },
  { value: 2, label: '2 estrellas' },
  { value: 1, label: '1 estrella' }
];

const sortOptions = [
  { value: 'newest', label: 'Mas recientes' },
  { value: 'oldest', label: 'Mas antiguos' },
  { value: 'highest', label: 'Mayor calificacion' },
  { value: 'lowest', label: 'Menor calificacion' }
];

const onRatingChange = () => {
  emit('filter-change', { rating: localSelectedRating.value });
};

const onSortChange = () => {
  emit('sort-change', { sortBy: sortBy.value });
};
</script>

<template>
  <div class="comment-filters bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
    <!-- Rating filter -->
    <div class="flex items-center gap-3 w-full sm:w-auto">
      <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar por:</label>
      <select
        v-model="localSelectedRating"
        @change="onRatingChange"
        class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent cursor-pointer"
      >
        <option v-for="option in ratingOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Sort options -->
    <div class="flex items-center gap-3 w-full sm:w-auto">
      <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Ordenar por:</label>
      <select
        v-model="sortBy"
        @change="onSortChange"
        class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent cursor-pointer"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.comment-filters {
  border: 1px solid #e5e7eb;
}
</style>
