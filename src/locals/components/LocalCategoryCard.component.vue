<script setup>
const props = defineProps({
  localCategory: Object,
  isSelected: Boolean,
  isLoaded: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div v-if="isLoaded"
    class="flex flex-col items-center p-4 gap-4 rounded-xl shadow-lg border-3 hover:cursor-pointer transition-all bg-white hover:shadow-xl"
    :class="isSelected ? 'border-(--primary-color) bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
  >
    <img
      :src="localCategory.photoUrl"
      alt="Local Category Image"
      class="w-full h-32 object-contain rounded-lg"
    />
    <p class="text-center text-lg font-medium text-gray-800">
      {{ localCategory.name }}
    </p>
  </div>
  <div v-else class="flex flex-col items-center p-4 gap-4 rounded-xl shadow-lg border-3 border-gray-200">
    <div class="skeleton w-full h-32 rounded-lg"></div>
    <div class="skeleton w-3/4 h-6 rounded"></div>
  </div>
</template>
