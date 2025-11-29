<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/auth/services/authentication.store';
import AvailabilityManagerComponent from '../components/AvailabilityManager.component.vue';
import NavbarComponent from '@/public/components/Navbar.component.vue';
import FooterComponent from '@/public/components/Footer.component.vue';
import { LocalsApiService } from '@/locals/services/locals-api.service';

const route = useRoute();
const router = useRouter();
const authStore = useAuthenticationStore();
const localsService = new LocalsApiService();

const localId = computed(() => route.params.localId);
const currentUserId = computed(() => authStore.userId);
const local = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  if (localId.value) {
    try {
      local.value = await localsService.getById(localId.value);
    } catch (error) {
      console.error('Error loading local:', error);
      router.push('/my-locals');
    }
  }
  isLoading.value = false;
});

const goBack = () => {
  router.back();
};
</script>

<template>
  <NavbarComponent />
  <main class="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-10 lg:px-16 py-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button
          @click="goBack"
          class="p-2 hover:bg-white rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestion de disponibilidad</h1>
          <p v-if="local" class="text-gray-500">{{ local.localName }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-(--primary-color)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Content -->
      <AvailabilityManagerComponent
        v-else-if="localId && currentUserId"
        :local-id="localId"
        :owner-id="currentUserId"
      />

      <!-- No access -->
      <div v-else class="bg-white rounded-xl shadow-md p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Acceso denegado</h3>
        <p class="text-gray-500">No tienes permiso para gestionar la disponibilidad de este espacio</p>
      </div>
    </div>
  </main>
  <FooterComponent />
</template>
