<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
let map = null;
let marker = null;

// Default to Lima, Peru
const defaultLat = -12.0464;
const defaultLng = -77.0428;

const initMap = () => {
  if (!mapContainer.value || map) return;

  const lat = props.latitude || defaultLat;
  const lng = props.longitude || defaultLng;
  const zoom = props.latitude && props.longitude ? 15 : 12;

  map = L.map(mapContainer.value).setView([lat, lng], zoom);

  // Add OpenStreetMap tiles (free)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Force map to recalculate size after render
  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  // Add marker if coordinates exist
  if (props.latitude && props.longitude) {
    marker = L.marker([props.latitude, props.longitude], {
      draggable: props.editable
    }).addTo(map);

    if (props.editable) {
      marker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        emit('update:latitude', position.lat);
        emit('update:longitude', position.lng);
      });
    }
  }

  // Click handler for editable maps
  if (props.editable) {
    map.on('click', (event) => {
      const { lat, lng } = event.latlng;

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', (e) => {
          const position = e.target.getLatLng();
          emit('update:latitude', position.lat);
          emit('update:longitude', position.lng);
        });
      }

      emit('update:latitude', lat);
      emit('update:longitude', lng);
    });
  }
};

const openInMaps = () => {
  if (props.latitude && props.longitude) {
    const url = `https://www.openstreetmap.org/?mlat=${props.latitude}&mlon=${props.longitude}#map=15/${props.latitude}/${props.longitude}`;
    window.open(url, '_blank');
  } else if (props.address) {
    const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(props.address)}`;
    window.open(url, '_blank');
  }
};

onMounted(async () => {
  await nextTick();
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});

watch([() => props.latitude, () => props.longitude], ([newLat, newLng]) => {
  if (map && newLat && newLng) {
    map.setView([newLat, newLng], 15);

    if (marker) {
      marker.setLatLng([newLat, newLng]);
    } else {
      marker = L.marker([newLat, newLng], {
        draggable: props.editable
      }).addTo(map);

      if (props.editable) {
        marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          emit('update:latitude', position.lat);
          emit('update:longitude', position.lng);
        });
      }
    }
  }
});
</script>

<template>
  <div
    ref="mapContainer"
    class="leaflet-map-container"
    :style="{ height: height }"
  />
</template>

<style>
.leaflet-map-container {
  width: 100%;
  border-radius: 0.5rem;
  z-index: 0;
}
</style>
