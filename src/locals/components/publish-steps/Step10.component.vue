<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  localData: Object
});

const currentImageIndex = ref(0);

// Validation checks
const validationChecks = computed(() => {
  const data = props.localData;
  return [
    { label: 'Nombre del local', valid: !!data.localName?.trim(), value: data.localName },
    { label: 'Descripcion', valid: data.descriptionMessage?.length >= 20, value: data.descriptionMessage ? `${data.descriptionMessage.length} caracteres` : 'Sin descripcion' },
    { label: 'Categoria', valid: !!data.localCategoryId, value: data.localCategoryId ? 'Seleccionada' : 'No seleccionada' },
    { label: 'Ubicacion', valid: !!data.country && !!data.city && !!data.district && !!data.street, value: data.street ? `${data.district}, ${data.city}` : 'Incompleta' },
    { label: 'Fotos', valid: data.photoUrls?.length >= 3, value: `${data.photoUrls?.length || 0} imagenes` },
    { label: 'Aforo', valid: data.capacity > 0, value: data.capacity ? `${data.capacity} personas` : 'No especificado' },
    { label: 'Caracteristicas', valid: data.features?.length > 0, value: `${data.features?.length || 0} caracteristicas` },
    { label: 'Precio', valid: data.price > 0, value: data.price ? `S/ ${data.price}/hora` : 'No especificado' }
  ];
});

const isComplete = computed(() => {
  return validationChecks.value.every(check => check.valid);
});

const completionPercentage = computed(() => {
  const validCount = validationChecks.value.filter(check => check.valid).length;
  return Math.round((validCount / validationChecks.value.length) * 100);
});

const nextImage = () => {
  if (props.localData.photoUrls?.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.localData.photoUrls.length;
  }
};

const prevImage = () => {
  if (props.localData.photoUrls?.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0
      ? props.localData.photoUrls.length - 1
      : currentImageIndex.value - 1;
  }
};

const goToImage = (index) => {
  currentImageIndex.value = index;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0
  }).format(value);
};
</script>

<template>
  <div class="w-full max-w-5xl mx-auto">
    <!-- Complete state -->
    <template v-if="isComplete">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-(--text-color) mb-3">
          ¡Todo listo para publicar!
        </h1>
        <p class="text-lg text-gray-600">
          Revisa como se vera tu anuncio antes de publicarlo
        </p>
      </div>

      <!-- Preview card -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="grid md:grid-cols-2">
          <!-- Image gallery -->
          <div class="relative bg-gray-100">
            <div class="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
              <img
                :src="localData.photoUrls[currentImageIndex]"
                :alt="localData.localName"
                class="w-full h-full object-cover"
              />

              <!-- Navigation arrows -->
              <template v-if="localData.photoUrls.length > 1">
                <button
                  @click="prevImage"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  @click="nextImage"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </template>

              <!-- Image counter -->
              <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {{ currentImageIndex + 1 }} / {{ localData.photoUrls.length }}
              </div>
            </div>

            <!-- Thumbnail strip -->
            <div v-if="localData.photoUrls.length > 1" class="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
              <button
                v-for="(url, index) in localData.photoUrls"
                :key="index"
                @click="goToImage(index)"
                class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
                :class="currentImageIndex === index ? 'ring-2 ring-(--secondary-color) scale-105' : 'opacity-70 hover:opacity-100'"
              >
                <img :src="url" :alt="`Foto ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Details -->
          <div class="p-6 md:p-8 flex flex-col">
            <!-- Location badge -->
            <div class="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              {{ localData.district }}, {{ localData.city }}
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-gray-800 mb-3">
              {{ localData.localName }}
            </h2>

            <!-- Description -->
            <p class="text-gray-600 mb-4 line-clamp-3">
              {{ localData.descriptionMessage }}
            </p>

            <!-- Quick info -->
            <div class="flex flex-wrap gap-3 mb-6">
              <div class="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {{ localData.capacity }} personas
              </div>
              <div class="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>
                {{ localData.photoUrls.length }} fotos
              </div>
            </div>

            <!-- Features -->
            <div v-if="localData.features?.length > 0" class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Caracteristicas incluidas:</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(feature, index) in localData.features.slice(0, 5)"
                  :key="index"
                  class="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full"
                >
                  {{ feature }}
                </span>
                <span
                  v-if="localData.features.length > 5"
                  class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  +{{ localData.features.length - 5 }} mas
                </span>
              </div>
            </div>

            <!-- Price -->
            <div class="mt-auto pt-4 border-t border-gray-100">
              <div class="flex items-end justify-between">
                <div>
                  <p class="text-sm text-gray-500">Precio por hora</p>
                  <p class="text-3xl font-bold text-(--secondary-color)">
                    {{ formatCurrency(localData.price) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-400">Estimado mensual</p>
                  <p class="text-lg font-semibold text-gray-600">
                    {{ formatCurrency(localData.price * 8 * 20) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full address -->
      <div class="mt-6 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-medium text-gray-800">Direccion completa</p>
          <p class="text-gray-600">{{ localData.street }}, {{ localData.district }}, {{ localData.city }}, {{ localData.country }}</p>
        </div>
      </div>

      <!-- Success message -->
      <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-green-800">Listo para publicar</p>
            <p class="text-sm text-green-700">Tu anuncio cumple con todos los requisitos. Haz clic en "Publicar" para comenzar a recibir reservas.</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Incomplete state -->
    <template v-else>
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-(--text-color) mb-3">
          Casi terminamos...
        </h1>
        <p class="text-lg text-gray-600">
          Completa los campos faltantes para publicar tu espacio
        </p>
      </div>

      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-600">Progreso del anuncio</span>
          <span class="text-sm font-semibold text-(--secondary-color)">{{ completionPercentage }}%</span>
        </div>
        <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-(--primary-color) to-(--secondary-color) transition-all duration-500"
            :style="{ width: `${completionPercentage}%` }"
          />
        </div>
      </div>

      <!-- Validation checklist -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="p-4 bg-gray-50 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-(--secondary-color)" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
            Lista de verificacion
          </h2>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="(check, index) in validationChecks"
            :key="index"
            class="flex items-center justify-between p-4 transition-colors"
            :class="check.valid ? 'bg-white' : 'bg-orange-50'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="check.valid ? 'bg-green-100' : 'bg-orange-100'"
              >
                <svg
                  v-if="check.valid"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-orange-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium" :class="check.valid ? 'text-gray-800' : 'text-orange-800'">
                  {{ check.label }}
                </p>
                <p class="text-sm" :class="check.valid ? 'text-gray-500' : 'text-orange-600'">
                  {{ check.value }}
                </p>
              </div>
            </div>

            <span
              v-if="check.valid"
              class="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full"
            >
              Completo
            </span>
            <span
              v-else
              class="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full"
            >
              Pendiente
            </span>
          </div>
        </div>
      </div>

      <!-- Help text -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div class="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium text-blue-800">Usa el menu de navegacion</p>
            <p class="text-sm text-blue-700">Haz clic en los pasos anteriores para completar los campos faltantes.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
