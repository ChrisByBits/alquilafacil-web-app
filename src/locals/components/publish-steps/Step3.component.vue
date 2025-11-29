<script setup>
import { onMounted, ref } from 'vue';
import { LocalCategoriesApiService } from '../../services/local-categories-api.service';
import LocalCategoryCardComponent from '../LocalCategoryCard.component.vue';

const props = defineProps({
  localCategoryId: Number
});
const emit = defineEmits(['update:localCategoryId']);

const localCategories = ref([]);
const isLoaded = ref(false);
const localCategoriesApiService = new LocalCategoriesApiService();

const selectCategory = (id) => {
  emit('update:localCategoryId', id);
};

onMounted(async () => {
  try {
    localCategories.value = await localCategoriesApiService.getAll();
    isLoaded.value = true;
  } catch (error) {
    console.error('Error cargando categorias:', error);
  }
});
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl md:text-4xl font-bold text-(--text-color) mb-3">
        Cual de estas opciones describe mejor tu espacio?
      </h1>
      <p class="text-lg text-gray-600">
        Selecciona la categoria que mejor represente tu local
      </p>
    </div>

    <!-- Categories Grid -->
    <template v-if="isLoaded">
      <div class="grid sm:grid-cols-2 gap-4">
        <LocalCategoryCardComponent
          v-for="localCategory in localCategories"
          :key="localCategory.id"
          :localCategory="localCategory"
          :isSelected="localCategory.id === props.localCategoryId"
          @click="selectCategory(localCategory.id)"
        />
      </div>
    </template>

    <!-- Loading skeleton -->
    <template v-else>
      <div class="grid sm:grid-cols-2 gap-4">
        <LocalCategoryCardComponent v-for="n in 4" :key="n" :localCategory="{}" :isLoaded="false" />
      </div>
    </template>

    <!-- Help text -->
    <p class="mt-6 text-center text-sm text-gray-500">
      No te preocupes, podras cambiar la categoria mas adelante si lo necesitas
    </p>
  </div>
</template>
