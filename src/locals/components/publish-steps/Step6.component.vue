<script setup>
import { ref, computed } from 'vue';
import { cloudinaryWidget } from '../../../shared/components/cloudinary-widget';

const props = defineProps({
  photoUrls: Array,
});

const emit = defineEmits([
  'update:photoUrls',
]);

const draggedIndex = ref(null);
const lightboxImage = ref(null);
const isUploading = ref(false);

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 10;

const openUploadWidget = async () => {
  if (props.photoUrls.length >= MAX_PHOTOS) {
    return;
  }

  isUploading.value = true;
  try {
    const urls = await cloudinaryWidget();
    console.log("Imagenes subidas:", urls);
    emit('update:photoUrls', urls);
  } catch (error) {
    console.error("Error al subir imagenes:", error);
  } finally {
    isUploading.value = false;
  }
};

const removeImage = (index) => {
  const updatedUrls = [...props.photoUrls];
  updatedUrls.splice(index, 1);
  emit('update:photoUrls', updatedUrls);
};

// Drag and Drop functions
const handleDragStart = (index) => {
  draggedIndex.value = index;
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const handleDrop = (event, dropIndex) => {
  event.preventDefault();

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return;

  const updatedUrls = [...props.photoUrls];
  const draggedItem = updatedUrls[draggedIndex.value];

  updatedUrls.splice(draggedIndex.value, 1);
  updatedUrls.splice(dropIndex, 0, draggedItem);

  emit('update:photoUrls', updatedUrls);
  draggedIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
};

const openLightbox = (url) => {
  lightboxImage.value = url;
};

const closeLightbox = () => {
  lightboxImage.value = null;
};

// Progress calculation
const uploadProgress = computed(() => {
  const count = props.photoUrls?.length || 0;
  return Math.min((count / MIN_PHOTOS) * 100, 100);
});

const photosRemaining = computed(() => {
  const count = props.photoUrls?.length || 0;
  return Math.max(MIN_PHOTOS - count, 0);
});

const canAddMore = computed(() => {
  return (props.photoUrls?.length || 0) < MAX_PHOTOS;
});

// Photo tips
const photoTips = [
  { icon: '💡', text: 'Usa luz natural para mejores resultados' },
  { icon: '📐', text: 'Muestra diferentes angulos del espacio' },
  { icon: '🧹', text: 'Asegurate de que el espacio este ordenado' },
  { icon: '📏', text: 'Incluye fotos que muestren el tamano real' }
];
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-(--text-color) mb-3">
        Agrega fotos de tu espacio
      </h1>
      <p class="text-lg text-gray-600">
        Las buenas fotos atraen mas reservas. Agrega al menos {{ MIN_PHOTOS }} imagenes.
      </p>
    </div>

    <!-- Progress indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-600">Progreso de fotos</span>
        <span class="text-sm font-semibold" :class="photoUrls.length >= MIN_PHOTOS ? 'text-green-600' : 'text-(--secondary-color)'">
          {{ photoUrls.length }}/{{ MIN_PHOTOS }} minimo
        </span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-500"
          :class="photoUrls.length >= MIN_PHOTOS ? 'bg-green-500' : 'bg-gradient-to-r from-(--primary-color) to-(--secondary-color)'"
          :style="{ width: `${uploadProgress}%` }"
        />
      </div>
      <p v-if="photosRemaining > 0" class="text-sm text-orange-600 mt-2">
        Necesitas agregar {{ photosRemaining }} foto(s) mas
      </p>
      <p v-else class="text-sm text-green-600 mt-2 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Cumples con el minimo de fotos
      </p>
    </div>

    <!-- Upload area -->
    <button
      v-if="canAddMore"
      @click="openUploadWidget"
      :disabled="isUploading"
      class="w-full flex flex-col items-center p-10 bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-dashed transition-all duration-300 group"
      :class="isUploading
        ? 'border-gray-300 cursor-wait'
        : 'border-gray-300 hover:border-(--secondary-color) hover:bg-(--secondary-color)/5 cursor-pointer'"
    >
      <div v-if="isUploading" class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-(--secondary-color) mx-auto mb-4"></div>
        <span class="text-xl text-gray-600">Subiendo imagenes...</span>
      </div>
      <div v-else class="text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-(--primary-color) to-(--secondary-color) rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span class="text-2xl font-semibold text-(--text-color) block mb-2">
          {{ photoUrls.length === 0 ? 'Agregar imagenes' : 'Agregar mas imagenes' }}
        </span>
        <span class="text-gray-500">
          Haz clic para seleccionar fotos (max {{ MAX_PHOTOS }})
        </span>
      </div>
    </button>

    <!-- Max photos reached -->
    <div v-else class="w-full p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <p class="text-blue-800 font-medium">Has alcanzado el maximo de {{ MAX_PHOTOS }} imagenes</p>
      <p class="text-blue-600 text-sm mt-1">Elimina alguna imagen si deseas agregar otra</p>
    </div>

    <!-- Images grid -->
    <div v-if="photoUrls.length > 0" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-(--text-color)">
          Imagenes seleccionadas ({{ photoUrls.length }})
        </h2>
        <p class="text-sm text-gray-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Arrastra para reordenar
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(url, index) in photoUrls"
          :key="url"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover="handleDragOver"
          @drop="handleDrop($event, index)"
          @dragend="handleDragEnd"
          class="relative group rounded-xl overflow-hidden shadow-md transition-all duration-300"
          :class="[
            draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-xl hover:-translate-y-1',
            index === 0 ? 'ring-3 ring-(--secondary-color)' : ''
          ]"
        >
          <!-- Main Image Badge -->
          <div
            v-if="index === 0"
            class="absolute top-2 left-2 bg-(--secondary-color) text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-lg flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Principal
          </div>

          <!-- Image number badge -->
          <div
            v-else
            class="absolute top-2 left-2 bg-black/60 text-white w-6 h-6 rounded-full text-xs font-semibold z-10 flex items-center justify-center"
          >
            {{ index + 1 }}
          </div>

          <!-- Image -->
          <img
            :src="url"
            @click="openLightbox(url)"
            class="w-full h-48 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            alt="Imagen del local"
          />

          <!-- Hover Overlay with Actions -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-3">
            <!-- View Button -->
            <button
              @click="openLightbox(url)"
              class="bg-white text-gray-800 p-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              title="Ver imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>

            <!-- Delete Button -->
            <button
              @click.stop="removeImage(index)"
              class="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Eliminar imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Drag handle indicator -->
          <div class="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo tips -->
    <div class="mt-8 bg-gray-50 rounded-2xl p-6">
      <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-(--secondary-color)" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        Consejos para mejores fotos
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="tip in photoTips"
          :key="tip.text"
          class="flex items-center gap-3 p-3 bg-white rounded-xl"
        >
          <span class="text-xl">{{ tip.icon }}</span>
          <span class="text-sm text-gray-700">{{ tip.text }}</span>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxImage"
          @click="closeLightbox"
          class="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
        >
          <button
            @click="closeLightbox"
            class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            :src="lightboxImage"
            @click.stop
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            alt="Vista ampliada"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
