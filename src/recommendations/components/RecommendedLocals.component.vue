<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { RecommendationsService } from '../services/recommendations.service';
import http from "@/shared/services/http-common.js";

const props = defineProps({
  userId: {
    type: Number,
    default: null
  },
  localId: {
    type: Number,
    default: null
  },
  type: {
    type: String,
    default: 'user', // 'user' | 'similar' | 'image'
    validator: (value) => ['user', 'similar', 'image'].includes(value)
  },
  imageUrl: {
    type: String,
    default: null
  },
  limit: {
    type: Number,
    default: 4
  },
  title: {
    type: String,
    default: 'Espacios recomendados'
  },
  showSimilarityScore: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const recommendationsService = new RecommendationsService();

const recommendedLocals = ref([]);
const similarityScores = ref({});
const isLoading = ref(false);
const isFirstLoad = ref(true);
const loadingMessage = ref('Cargando recomendaciones...');
const error = ref(null);
const activeSlide = ref(0);
const hasReservations = ref(false);
const shouldShow = ref(true);

const displayTitle = computed(() => {
  if (props.title) return props.title;
  switch (props.type) {
    case 'user': return 'Recomendados para ti';
    case 'similar': return 'Espacios similares';
    case 'image': return 'Espacios con estilo similar';
    default: return 'Espacios recomendados';
  }
});

const displaySubtitle = computed(() => {
  switch (props.type) {
    case 'user': return 'Basado en tu historial y preferencias';
    case 'similar': return 'Analisis visual con IA';
    case 'image': return 'Encontrados usando vision por computadora';
    default: return '';
  }
});

const checkUserHasReservations = async () => {
  if (props.type !== 'user' || !props.userId) return true;

  try {
    const response = await http.get(`/reservation/by-user-id/${props.userId}`);
    const reservations = response.data;
    return reservations && reservations.length > 0;
  } catch (err) {
    // Si da error (404, etc), asumimos que no tiene reservas
    return false;
  }
};

const loadRecommendations = async () => {
  // Para recomendaciones de usuario, primero verificar si tiene reservas
  if (props.type === 'user') {
    hasReservations.value = await checkUserHasReservations();
    if (!hasReservations.value) {
      shouldShow.value = false;
      return;
    }
  }

  isLoading.value = true;
  error.value = null;

  // Mensaje especial para la primera carga (el modelo de IA puede tardar en cargar)
  if (isFirstLoad.value && (props.type === 'similar' || props.type === 'image')) {
    loadingMessage.value = 'Iniciando modelo de IA...';
    setTimeout(() => {
      if (isLoading.value) {
        loadingMessage.value = 'Analizando imagenes con vision por computadora...';
      }
    }, 3000);
    setTimeout(() => {
      if (isLoading.value) {
        loadingMessage.value = 'Esto puede tardar unos segundos la primera vez...';
      }
    }, 8000);
    setTimeout(() => {
      if (isLoading.value) {
        loadingMessage.value = 'Casi listo, procesando resultados...';
      }
    }, 15000);
  } else {
    loadingMessage.value = 'Buscando recomendaciones...';
  }

  try {
    let response;
    if (props.type === 'user' && props.userId) {
      response = await recommendationsService.getRecommendationsForUser(props.userId, props.limit);
    } else if (props.type === 'similar' && props.localId) {
      response = await recommendationsService.getSimilarLocals(props.localId, props.limit);
    } else if (props.type === 'image' && props.imageUrl) {
      response = await recommendationsService.getRecommendationsByImage(props.imageUrl, props.limit);
    }

    if (response?.recommendedLocalIds?.length > 0) {
      // Store similarity scores if available
      if (response.similarityScores) {
        similarityScores.value = response.similarityScores;
      }

      // Fetch local details for each recommended ID
      const localPromises = response.recommendedLocalIds.map(id =>
        http.get(`/locals/${id}`).then(res => ({
          ...res.data,
          similarityScore: response.similarityScores?.[id] || null
        })).catch(() => null)
      );
      const locals = await Promise.all(localPromises);
      recommendedLocals.value = locals.filter(local => local !== null);
    } else {
      // No recommendations returned, hide the section for user type
      if (props.type === 'user') {
        shouldShow.value = false;
      }
    }
  } catch (err) {
    console.error('Error loading recommendations:', err);
    error.value = 'No se pudieron cargar las recomendaciones';
  } finally {
    isLoading.value = false;
    isFirstLoad.value = false;
  }
};

onMounted(() => {
  loadRecommendations();
});

watch([() => props.userId, () => props.localId, () => props.imageUrl], () => {
  loadRecommendations();
});

const goToLocal = (localId) => {
  router.push(`/local/${localId}`);
};

const getSimilarityPercentage = (score) => {
  if (!score) return null;
  return Math.round(score * 100);
};

const getSimilarityColor = (score) => {
  if (!score) return 'bg-gray-200';
  const percentage = score * 100;
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-orange-500';
};

const nextSlide = () => {
  if (activeSlide.value < recommendedLocals.value.length - 1) {
    activeSlide.value++;
  } else {
    activeSlide.value = 0;
  }
};

const prevSlide = () => {
  if (activeSlide.value > 0) {
    activeSlide.value--;
  } else {
    activeSlide.value = recommendedLocals.value.length - 1;
  }
};

const refreshRecommendations = () => {
  loadRecommendations();
};
</script>

<template>
  <div v-if="shouldShow" class="recommendations-section py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-semibold text-gray-800">{{ displayTitle }}</h2>
          <span v-if="type === 'similar' || type === 'image'" class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            IA
          </span>
        </div>
        <p v-if="displaySubtitle" class="text-sm text-gray-500 mt-1">{{ displaySubtitle }}</p>
      </div>

      <button
        v-if="!isLoading"
        @click="refreshRecommendations"
        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        title="Actualizar recomendaciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="relative mx-auto mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-(--secondary-color)"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-(--secondary-color)" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <p class="text-sm text-gray-600 font-medium">{{ loadingMessage }}</p>
        <p v-if="isFirstLoad && (type === 'similar' || type === 'image')" class="text-xs text-gray-400 mt-1">
          Usando HuggingFace CLIP para analisis de imagenes
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8 bg-red-50 rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-red-600">{{ error }}</p>
      <button
        @click="refreshRecommendations"
        class="mt-3 px-4 py-2 text-sm text-red-600 hover:text-red-800"
      >
        Intentar de nuevo
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="recommendedLocals.length === 0" class="text-center py-8 bg-gray-50 rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-gray-500">No hay recomendaciones disponibles</p>
      <p class="text-sm text-gray-400 mt-1">Explora mas espacios para mejorar tus recomendaciones</p>
    </div>

    <!-- Recommendations grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="local in recommendedLocals"
        :key="local.id"
        @click="goToLocal(local.id)"
        class="recommendation-card bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group"
      >
        <!-- Image -->
        <div class="aspect-video bg-gray-200 relative overflow-hidden">
          <img
            v-if="local.photoUrls?.[0]"
            :src="local.photoUrls[0]"
            :alt="local.localName"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Similarity badge -->
          <div
            v-if="showSimilarityScore && local.similarityScore"
            class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
            :class="getSimilarityColor(local.similarityScore)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ getSimilarityPercentage(local.similarityScore) }}% similar
          </div>

          <!-- Category badge -->
          <div v-if="local.categoryName" class="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
            {{ local.categoryName }}
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <h3 class="font-semibold text-gray-800 truncate group-hover:text-(--primary-color) transition-colors">
            {{ local.localName }}
          </h3>
          <p class="text-sm text-gray-500 truncate flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ local.district || local.city || 'Ubicacion no disponible' }}
          </p>

          <div class="flex items-center justify-between mt-3">
            <p class="text-lg font-bold text-(--secondary-color)">
              S/ {{ local.price }}
              <span class="text-xs font-normal text-gray-500">/hora</span>
            </p>

            <!-- Rating if available -->
            <div v-if="local.averageRating" class="flex items-center gap-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="font-medium text-gray-700">{{ local.averageRating.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
