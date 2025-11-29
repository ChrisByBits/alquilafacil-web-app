<script setup>
import { ref, computed } from 'vue';
import OptimizedImageComponent from './OptimizedImage.component.vue';
import { useImageOptimization } from '../composables/useImageOptimization';

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  columns: {
    type: Number,
    default: 4
  },
  gap: {
    type: Number,
    default: 4
  },
  aspectRatio: {
    type: String,
    default: '4/3'
  },
  maxImages: {
    type: Number,
    default: null
  },
  showLightbox: {
    type: Boolean,
    default: true
  }
});

const { getFullSizeUrl, getGalleryImageUrl } = useImageOptimization();

const lightboxOpen = ref(false);
const currentImageIndex = ref(0);

const displayImages = computed(() => {
  if (!props.maxImages) return props.images;
  return props.images.slice(0, props.maxImages);
});

const remainingCount = computed(() => {
  if (!props.maxImages || props.images.length <= props.maxImages) return 0;
  return props.images.length - props.maxImages;
});

const currentImage = computed(() => {
  return props.images[currentImageIndex.value] || null;
});

const gridClasses = computed(() => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };
  return cols[props.columns] || cols[4];
});

const gapClasses = computed(() => {
  return `gap-${props.gap}`;
});

const openLightbox = (index) => {
  if (!props.showLightbox) return;
  currentImageIndex.value = index;
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  document.body.style.overflow = '';
};

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length;
};

const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + props.images.length) % props.images.length;
};

const handleKeydown = (e) => {
  if (!lightboxOpen.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
};

// Add keyboard listener when component mounts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown);
}
</script>

<template>
  <div class="image-gallery">
    <!-- Grid of images -->
    <div :class="['grid', gridClasses, gapClasses]">
      <div
        v-for="(image, index) in displayImages"
        :key="index"
        class="gallery-item relative cursor-pointer group overflow-hidden rounded-lg"
        @click="openLightbox(index)"
      >
        <OptimizedImageComponent
          :src="typeof image === 'string' ? image : image.url"
          :alt="typeof image === 'string' ? `Image ${index + 1}` : image.alt || `Image ${index + 1}`"
          :aspect-ratio="aspectRatio"
          :width="400"
          fit="cover"
          placeholder="blur"
          rounded="lg"
        />

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>

        <!-- Remaining count overlay (on last visible image) -->
        <div
          v-if="remainingCount > 0 && index === displayImages.length - 1"
          class="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <span class="text-white text-2xl font-bold">+{{ remainingCount }}</span>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        @click.self="closeLightbox"
      >
        <!-- Close button -->
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Navigation: Previous -->
        <button
          v-if="images.length > 1"
          @click="prevImage"
          class="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Main image -->
        <div class="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          <img
            v-if="currentImage"
            :src="getFullSizeUrl(typeof currentImage === 'string' ? currentImage : currentImage.url)"
            :alt="typeof currentImage === 'string' ? `Image ${currentImageIndex + 1}` : currentImage.alt"
            class="max-w-full max-h-[90vh] object-contain"
          />
        </div>

        <!-- Navigation: Next -->
        <button
          v-if="images.length > 1"
          @click="nextImage"
          class="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Image counter -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
          {{ currentImageIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Thumbnails -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2"
        >
          <button
            v-for="(image, index) in images"
            :key="index"
            @click="currentImageIndex = index"
            :class="[
              'w-16 h-12 rounded overflow-hidden flex-shrink-0 transition-all',
              index === currentImageIndex ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-75'
            ]"
          >
            <img
              :src="getGalleryImageUrl(typeof image === 'string' ? image : image.url, 100)"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
