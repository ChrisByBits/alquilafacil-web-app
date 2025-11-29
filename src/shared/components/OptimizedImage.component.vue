<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  aspectRatio: {
    type: String,
    default: null // e.g., '16/9', '4/3', '1/1'
  },
  quality: {
    type: [Number, String],
    default: 'auto' // auto, or 1-100
  },
  fit: {
    type: String,
    default: 'cover', // cover, contain, fill, scale-down
    validator: (value) => ['cover', 'contain', 'fill', 'scale-down'].includes(value)
  },
  lazy: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: 'blur' // blur, skeleton, none
  },
  fallbackSrc: {
    type: String,
    default: null
  },
  rounded: {
    type: [Boolean, String],
    default: false // true, 'sm', 'md', 'lg', 'xl', 'full'
  }
});

const emit = defineEmits(['load', 'error']);

const imageRef = ref(null);
const isLoaded = ref(false);
const hasError = ref(false);
const isInView = ref(!props.lazy);

const CLOUDINARY_CLOUD = 'ddd2yf0ii';

// Check if URL is from Cloudinary
const isCloudinaryUrl = computed(() => {
  return props.src && props.src.includes('res.cloudinary.com');
});

// Generate optimized URL for Cloudinary images
const optimizedSrc = computed(() => {
  if (!props.src) return '';
  if (hasError.value && props.fallbackSrc) return props.fallbackSrc;

  if (!isCloudinaryUrl.value) {
    return props.src;
  }

  // Parse and reconstruct Cloudinary URL with transformations
  const transformations = [];

  // Format optimization - auto format
  transformations.push('f_auto');

  // Quality
  if (props.quality === 'auto') {
    transformations.push('q_auto');
  } else {
    transformations.push(`q_${props.quality}`);
  }

  // Width
  if (props.width) {
    transformations.push(`w_${props.width}`);
  }

  // Height
  if (props.height) {
    transformations.push(`h_${props.height}`);
  }

  // Crop mode based on fit
  const cropModes = {
    'cover': 'c_fill',
    'contain': 'c_fit',
    'fill': 'c_scale',
    'scale-down': 'c_limit'
  };
  transformations.push(cropModes[props.fit] || 'c_fill');

  // Insert transformations into Cloudinary URL
  const urlParts = props.src.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
  }

  return props.src;
});

// Low quality placeholder for blur effect
const placeholderSrc = computed(() => {
  if (props.placeholder !== 'blur' || !isCloudinaryUrl.value) {
    return null;
  }

  const urlParts = props.src.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/w_50,q_10,e_blur:500/${urlParts[1]}`;
  }

  return null;
});

// Srcset for responsive images
const srcSet = computed(() => {
  if (!isCloudinaryUrl.value) return null;

  const widths = [320, 640, 768, 1024, 1280, 1536];
  const urlParts = props.src.split('/upload/');

  if (urlParts.length !== 2) return null;

  return widths.map(w => {
    const transforms = `f_auto,q_auto,w_${w},c_fill`;
    return `${urlParts[0]}/upload/${transforms}/${urlParts[1]} ${w}w`;
  }).join(', ');
});

const sizes = computed(() => {
  if (!srcSet.value) return null;
  return '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1536px';
});

const roundedClass = computed(() => {
  if (!props.rounded) return '';
  if (props.rounded === true) return 'rounded';
  return `rounded-${props.rounded}`;
});

const aspectRatioStyle = computed(() => {
  if (!props.aspectRatio) return {};
  return { aspectRatio: props.aspectRatio };
});

// Intersection Observer for lazy loading
let observer = null;

onMounted(() => {
  if (props.lazy && imageRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isInView.value = true;
            observer?.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );
    observer.observe(imageRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

const handleLoad = () => {
  isLoaded.value = true;
  emit('load');
};

const handleError = () => {
  hasError.value = true;
  emit('error');
};
</script>

<template>
  <div
    ref="imageRef"
    class="optimized-image-container relative overflow-hidden bg-gray-100"
    :class="roundedClass"
    :style="aspectRatioStyle"
  >
    <!-- Skeleton placeholder -->
    <div
      v-if="placeholder === 'skeleton' && !isLoaded"
      class="absolute inset-0 bg-gray-200 animate-pulse"
    />

    <!-- Blur placeholder -->
    <img
      v-if="placeholder === 'blur' && placeholderSrc && !isLoaded"
      :src="placeholderSrc"
      :alt="alt"
      class="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
      aria-hidden="true"
    />

    <!-- Main image -->
    <img
      v-if="isInView"
      :src="optimizedSrc"
      :srcset="srcSet"
      :sizes="sizes"
      :alt="alt"
      :width="width"
      :height="height"
      :class="[
        'w-full h-full transition-opacity duration-300',
        `object-${fit}`,
        isLoaded ? 'opacity-100' : 'opacity-0'
      ]"
      :loading="lazy ? 'lazy' : 'eager'"
      :decoding="lazy ? 'async' : 'auto'"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Error state -->
    <div
      v-if="hasError && !fallbackSrc"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <div class="text-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">Error al cargar</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.optimized-image-container {
  display: block;
}
</style>
