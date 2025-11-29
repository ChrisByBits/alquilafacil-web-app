<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '300px'
  }
});

const emit = defineEmits(['update:latitude', 'update:longitude']);

const mapContainer = ref(null);
const map = ref(null);
const marker = ref(null);

// Default to Lima, Peru
const defaultLat = -12.0464;
const defaultLng = -77.0428;

const initMap = () => {
  if (!mapContainer.value) return;

  const lat = props.latitude || defaultLat;
  const lng = props.longitude || defaultLng;

  // Check if Google Maps API is loaded
  if (typeof google === 'undefined' || !google.maps) {
    console.warn('Google Maps API not loaded');
    return;
  }

  map.value = new google.maps.Map(mapContainer.value, {
    center: { lat, lng },
    zoom: props.latitude && props.longitude ? 15 : 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });

  if (props.latitude && props.longitude) {
    marker.value = new google.maps.Marker({
      position: { lat: props.latitude, lng: props.longitude },
      map: map.value,
      draggable: props.editable
    });

    if (props.editable) {
      marker.value.addListener('dragend', (event) => {
        emit('update:latitude', event.latLng.lat());
        emit('update:longitude', event.latLng.lng());
      });
    }
  }

  if (props.editable) {
    map.value.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      if (marker.value) {
        marker.value.setPosition(event.latLng);
      } else {
        marker.value = new google.maps.Marker({
          position: event.latLng,
          map: map.value,
          draggable: true
        });

        marker.value.addListener('dragend', (e) => {
          emit('update:latitude', e.latLng.lat());
          emit('update:longitude', e.latLng.lng());
        });
      }

      emit('update:latitude', lat);
      emit('update:longitude', lng);
    });
  }
};

const openInGoogleMaps = () => {
  if (props.latitude && props.longitude) {
    const url = `https://www.google.com/maps/search/?api=1&query=${props.latitude},${props.longitude}`;
    window.open(url, '_blank');
  } else if (props.address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`;
    window.open(url, '_blank');
  }
};

onMounted(() => {
  // Try to load Google Maps
  if (typeof google !== 'undefined' && google.maps) {
    initMap();
  } else {
    // If Google Maps is not loaded, we'll show a fallback
    console.log('Google Maps API not loaded, showing fallback');
  }
});

watch([() => props.latitude, () => props.longitude], () => {
  if (map.value && props.latitude && props.longitude) {
    const position = { lat: props.latitude, lng: props.longitude };
    map.value.setCenter(position);
    map.value.setZoom(15);

    if (marker.value) {
      marker.value.setPosition(position);
    } else {
      marker.value = new google.maps.Marker({
        position,
        map: map.value,
        draggable: props.editable
      });
    }
  }
});
</script>

<template>
  <div class="google-map-wrapper">
    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="map-container rounded-lg overflow-hidden"
      :style="{ height: height }"
    >
      <!-- Fallback when Google Maps is not loaded -->
      <div
        v-if="typeof google === 'undefined'"
        class="w-full h-full bg-gray-200 flex flex-col items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-gray-500 text-center px-4">{{ address }}</p>
        <button
          @click="openInGoogleMaps"
          class="mt-3 px-4 py-2 bg-(--secondary-color) text-white rounded-lg hover:opacity-90 text-sm"
        >
          Ver en Google Maps
        </button>
      </div>
    </div>

    <!-- Address and action button -->
    <div v-if="address && (latitude && longitude)" class="mt-2 flex items-center justify-between">
      <p class="text-sm text-gray-600 truncate flex-1">{{ address }}</p>
      <button
        @click="openInGoogleMaps"
        class="ml-2 text-sm text-(--secondary-color) hover:underline flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Abrir en Maps
      </button>
    </div>

    <!-- Editable hint -->
    <p v-if="editable" class="text-xs text-gray-500 mt-2">
      Haz clic en el mapa para seleccionar la ubicación o arrastra el marcador
    </p>
  </div>
</template>

<style scoped>
.map-container {
  border: 1px solid #e5e7eb;
}
</style>
