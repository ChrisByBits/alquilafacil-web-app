<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavbarComponent from '../../public/components/Navbar.component.vue';
import FooterComponent from '../../public/components/Footer.component.vue';
import LocalStatsDashboardComponent from '../components/LocalStatsDashboard.component.vue';
import { LocalsApiService } from '../services/locals-api.service';
import { CommentsApiService } from '../services/comments-api.service';
import { ReservationsApiService } from '../../booking/services/reservations-api.service';
import { LocalResponse } from '../model/local.response';
import { useAuthenticationStore } from '../../auth/services/authentication.store';

const route = useRoute();
const router = useRouter();
const authenticationStore = useAuthenticationStore();

const localsApiService = new LocalsApiService();
const commentsApiService = new CommentsApiService();
const reservationsApiService = new ReservationsApiService();

const local = ref(null);
const comments = ref([]);
const reservations = ref([]);
const isLoading = ref(true);
const error = ref(null);

const localId = computed(() => parseInt(route.params.localId));

onMounted(async () => {
  try {
    // Load local data
    const localResponse = await localsApiService.getById(localId.value);
    local.value = new LocalResponse(localResponse);

    // Verify ownership
    if (local.value.userId !== authenticationStore.userId) {
      error.value = 'No tienes permiso para ver las estadisticas de este local';
      isLoading.value = false;
      return;
    }

    // Load comments
    try {
      comments.value = await commentsApiService.getAllByLocalId(localId.value);
    } catch (e) {
      comments.value = [];
    }

    // Load reservations for this local (from owner's reservations)
    try {
      const allReservations = await reservationsApiService.getByOwnerId(authenticationStore.userId);
      // Filter only reservations for this specific local
      reservations.value = allReservations.filter(r => r.localId === localId.value);
    } catch (e) {
      reservations.value = [];
    }

  } catch (e) {
    console.error('Error loading data:', e);
    error.value = 'Error al cargar los datos del local';
  } finally {
    isLoading.value = false;
  }
});

const goBack = () => {
  router.back();
};

const goToLocal = () => {
  router.push(`/local/${localId.value}`);
};

const goToComments = () => {
  router.push(`/comments/${localId.value}`);
};

const goToMonitoring = () => {
  router.push(`/monitoring/${localId.value}`);
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
          <h1 class="text-2xl font-bold text-gray-800">Estadisticas del Local</h1>
          <p v-if="local" class="text-sm text-gray-500">{{ local.localName }}</p>
        </div>
      </div>

      <!-- Action buttons -->
      <div v-if="local" class="flex flex-wrap gap-2">
        <button
          @click="goToLocal"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver Local
        </button>
        <button
          @click="goToComments"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Ver Resenas
        </button>
        <button
          @click="goToMonitoring"
          class="flex items-center gap-2 px-4 py-2 bg-(--primary-color) text-white rounded-lg hover:bg-(--secondary-color) transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Monitoreo IoT
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-12 w-12 text-(--primary-color) mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-600">Cargando estadisticas...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ error }}</h3>
      <button
        @click="goBack"
        class="px-6 py-2 bg-(--primary-color) text-white rounded-lg hover:bg-(--secondary-color) transition-colors"
      >
        Volver
      </button>
    </div>

    <!-- Dashboard -->
    <LocalStatsDashboardComponent
      v-else-if="local"
      :local="local"
      :reservations="reservations"
      :comments="comments"
    />

    <!-- Empty state if no data -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No se encontraron datos</h3>
    </div>
  </main>
  <FooterComponent />
</template>
