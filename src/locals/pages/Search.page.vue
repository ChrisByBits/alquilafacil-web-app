<script setup>
  import { onMounted, ref, computed } from 'vue';

  import NavbarComponent from '@/public/components/Navbar.component.vue'
  import FooterComponent from '../../public/components/Footer.component.vue';
  import LocalCardComponent from '../components/LocalCard.component.vue';
  import RecommendedLocalsComponent from '../../recommendations/components/RecommendedLocals.component.vue';
  import { LocalsApiService } from '../services/locals-api.service';
  import { useRouter } from 'vue-router';
  import { useAuthenticationStore } from '../../auth/services/authentication.store';

  const locals = ref([]);
  const localsApiService = new LocalsApiService();
  const router = useRouter();
  const authenticationStore = useAuthenticationStore();
  const isLoaded = ref(false);

  const isSignedIn = computed(() => authenticationStore.isSignedIn);
  const userId = computed(() => authenticationStore.userId);

  onMounted(async() => {
    locals.value = await localsApiService.getAll();
    isLoaded.value = true;
  });

  const goToFilters = () => {
    router.push('/filters');
  };
</script>

<template>
  <NavbarComponent />
  <main class="px-4 sm:px-8 md:px-10 lg:px-16 py-10 w-full min-h-[80dvh] flex flex-col gap-6">
    <!-- Recomendaciones personalizadas con IA (solo si está logueado) -->
    <div v-if="isSignedIn && userId" class="mb-4">
      <RecommendedLocalsComponent
        :user-id="userId"
        type="user"
        title="Recomendados para ti"
        :limit="2"
        :show-similarity-score="false"
      />
    </div>

    <div class="w-full flex items-center justify-between">
      <h1 class="text-3xl text-center font-semibold text-(--text-color)">Resultados de búsqueda:</h1>
      <button @click="goToFilters" type="button" class="px-8 py-2 bg-(--button-color) hover:bg-(--button-color-hover) transition text-black text-xl rounded-md hover:cursor-pointer">
        Filtrar espacios
      </button>
    </div>
    <template v-if="isLoaded">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <LocalCardComponent v-for="local in locals" :key="local.id" :local="local" />
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <LocalCardComponent v-for="n in 6" :key="n" :local="{}" :isLoaded="false" />
      </div>
    </template>
  </main>
  <FooterComponent />
</template>