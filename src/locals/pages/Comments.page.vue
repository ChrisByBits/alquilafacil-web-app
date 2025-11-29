<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import NavbarComponent from '../../public/components/Navbar.component.vue';
import CommentCardComponent from '../components/CommentCard.component.vue';
import RatingSummaryComponent from '../components/RatingSummary.component.vue';
import CommentFiltersComponent from '../components/CommentFilters.component.vue';

import { CommentsApiService } from '../services/comments-api.service';
import FooterComponent from '../../public/components/Footer.component.vue';

const route = useRoute();
const router = useRouter();
const comments = ref([]);
const commentsApiService = new CommentsApiService();
const isLoading = ref(true);
const localId = ref(null);

// Filters state
const filterRating = ref(0);
const sortBy = ref('newest');

onMounted(async () => {
  localId.value = parseInt(route.params.localId);
  try {
    comments.value = await commentsApiService.getAllByLocalId(localId.value);
  } catch (error) {
    console.error('Error loading comments:', error);
  } finally {
    isLoading.value = false;
  }
});

const filteredComments = computed(() => {
  let result = [...comments.value];

  // Filter by rating
  if (filterRating.value > 0) {
    result = result.filter(c => Math.round(c.rating) === filterRating.value);
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'highest':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      result.sort((a, b) => a.rating - b.rating);
      break;
  }

  return result;
});

const handleFilterChange = ({ rating }) => {
  filterRating.value = rating;
};

const handleSortChange = ({ sortBy: newSortBy }) => {
  sortBy.value = newSortBy;
};

const handleRatingBarClick = (rating) => {
  filterRating.value = rating;
};

const goBack = () => {
  router.back();
};

const goToWriteReview = () => {
  router.push(`/local/${localId.value}`);
};
</script>

<template>
  <NavbarComponent />
  <main class="px-4 sm:px-8 md:px-10 lg:px-16 py-10 w-full min-h-[80dvh] flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Resenas y calificaciones</h1>
          <p class="text-sm text-gray-500">{{ comments.length }} resena{{ comments.length !== 1 ? 's' : '' }} en total</p>
        </div>
      </div>
      <button
        @click="goToWriteReview"
        class="flex items-center gap-2 px-4 py-2 bg-(--primary-color) text-white rounded-lg hover:bg-(--secondary-color) transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Escribir resena
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-(--primary-color)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <template v-else>
      <!-- Rating Summary -->
      <RatingSummaryComponent
        :comments="comments"
        :selected-rating="filterRating"
        @filter-by-rating="handleRatingBarClick"
      />

      <!-- Filters -->
      <CommentFiltersComponent
        :selected-rating="filterRating"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
      />

      <!-- No comments state -->
      <div v-if="comments.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Aun no hay resenas</h3>
        <p class="text-gray-500 mb-4">Se el primero en compartir tu experiencia</p>
        <button
          @click="goToWriteReview"
          class="px-6 py-2 bg-(--primary-color) text-white rounded-lg hover:bg-(--secondary-color) transition-colors"
        >
          Escribir la primera resena
        </button>
      </div>

      <!-- No results from filter -->
      <div v-else-if="filteredComments.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">No se encontraron resenas</h3>
        <p class="text-gray-500">Intenta cambiar los filtros de busqueda</p>
      </div>

      <!-- Comments grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommentCardComponent
          v-for="comment in filteredComments"
          :key="comment.id"
          :comment="comment"
        />
      </div>
    </template>
  </main>
  <FooterComponent />
</template>