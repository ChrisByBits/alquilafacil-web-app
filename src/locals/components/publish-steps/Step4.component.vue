<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import LeafletMap from '@/shared/components/LeafletMap.component.vue';

const props = defineProps({
  country: String,
  city: String,
  district: String,
  street: String,
  latitude: Number,
  longitude: Number
});

const emit = defineEmits([
  'update:country',
  'update:city',
  'update:district',
  'update:street',
  'update:latitude',
  'update:longitude'
]);

// Departamentos y distritos de Perú
const departamentosConDistritos = {
  'Lima': [
    'Lima', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja',
    'Barranco', 'Chorrillos', 'San Miguel', 'Pueblo Libre', 'Jesus Maria',
    'Lince', 'Magdalena', 'Breña', 'Rimac', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'Villa Maria del Triunfo', 'Villa El Salvador',
    'Los Olivos', 'San Martin de Porres', 'Independencia', 'Comas', 'Carabayllo',
    'Ate', 'Santa Anita', 'El Agustino', 'La Victoria', 'Surquillo'
  ],
  'Arequipa': [
    'Arequipa', 'Alto Selva Alegre', 'Cayma', 'Cerro Colorado', 'Characato',
    'Chiguata', 'Jacobo Hunter', 'Jose Luis Bustamante y Rivero', 'La Joya',
    'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi',
    'Polobaya', 'Quequeña', 'Sabandia', 'Sachaca', 'San Juan de Siguas',
    'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas',
    'Socabaya', 'Tiabaya', 'Uchumayo', 'Vitor', 'Yanahuara', 'Yarabamba', 'Yura'
  ],
  'Cusco': [
    'Cusco', 'Ccorca', 'Poroy', 'San Jeronimo', 'San Sebastian', 'Santiago',
    'Saylla', 'Wanchaq', 'Calca', 'Urubamba', 'Ollantaytambo', 'Pisac', 'Machu Picchu'
  ],
  'La Libertad': [
    'Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza',
    'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Victor Larco Herrera'
  ],
  'Piura': [
    'Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallan', 'La Arena',
    'La Union', 'Las Lomas', 'Tambo Grande', 'Veintiseis de Octubre'
  ],
  'Lambayeque': [
    'Chiclayo', 'Chongoyape', 'Eten', 'Eten Puerto', 'Jose Leonardo Ortiz',
    'La Victoria', 'Lagunas', 'Monsefu', 'Nueva Arica', 'Oyotun', 'Picsi',
    'Pimentel', 'Reque', 'Santa Rosa', 'Saña', 'Cayalti', 'Patapo', 'Pomalca',
    'Pucala', 'Tuman'
  ],
  'Junin': [
    'Huancayo', 'Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto',
    'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas',
    'Huancan', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo',
    'Pucara', 'Quichuay', 'Quilcas', 'San Agustin', 'San Jeronimo de Tunan',
    'Saño', 'Sapallanga', 'Sicaya', 'Santo Domingo de Acobamba', 'Viques'
  ],
  'Callao': [
    'Callao', 'Bellavista', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta',
    'Ventanilla', 'Mi Peru'
  ],
  'Ica': [
    'Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacutec', 'Parcona',
    'Pueblo Nuevo', 'Salas', 'San Jose de Los Molinos', 'San Juan Bautista',
    'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'
  ],
  'Ancash': [
    'Huaraz', 'Cochabamba', 'Colcabamba', 'Huanchay', 'Independencia', 'Jangas',
    'La Libertad', 'Olleros', 'Pampas Grande', 'Pariacoto', 'Pira', 'Tarica'
  ],
  'Tacna': [
    'Tacna', 'Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Inclan',
    'Pachia', 'Palca', 'Pocollay', 'Sama', 'Coronel Gregorio Albarracin Lanchipa'
  ],
  'Puno': [
    'Puno', 'Acora', 'Amantani', 'Atuncolla', 'Capachica', 'Chucuito',
    'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Plateria',
    'San Antonio', 'Tiquillaca', 'Vilque'
  ]
};

const departamentos = Object.keys(departamentosConDistritos).sort();

// Local refs
const localLatitude = ref(props.latitude || null);
const localLongitude = ref(props.longitude || null);
const isGeocoding = ref(false);
const selectedDepartamento = ref(props.city || '');
const selectedDistrito = ref(props.district || '');

// Distritos filtrados por departamento seleccionado
const distritosFiltrados = computed(() => {
  if (!selectedDepartamento.value) return [];
  return departamentosConDistritos[selectedDepartamento.value] || [];
});

// Set country to Peru on mount
onMounted(() => {
  if (!props.country) {
    emit('update:country', 'Peru');
  }
});

// Watch departamento changes
watch(selectedDepartamento, (newVal) => {
  emit('update:city', newVal);
  // Reset distrito when departamento changes
  selectedDistrito.value = '';
  emit('update:district', '');
});

// Watch distrito changes
watch(selectedDistrito, (newVal) => {
  emit('update:district', newVal);
});

// Compute full address for geocoding
const fullAddress = computed(() => {
  const parts = [props.street, props.district, props.city, 'Peru'].filter(Boolean);
  return parts.join(', ');
});

// Progress indicator
const completedFields = computed(() => {
  let count = 1; // Peru siempre está
  if (selectedDepartamento.value) count++;
  if (selectedDistrito.value) count++;
  if (props.street?.length >= 5) count++;
  if (localLatitude.value && localLongitude.value) count++;
  return count;
});

const isAddressComplete = computed(() => {
  return selectedDepartamento.value &&
         selectedDistrito.value &&
         props.street?.length >= 5;
});

// Geocode address using Nominatim (OpenStreetMap) - FREE
const geocodeAddress = async () => {
  if (!isAddressComplete.value) return;

  isGeocoding.value = true;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress.value)}`,
      {
        headers: {
          'Accept-Language': 'es'
        }
      }
    );
    const results = await response.json();

    if (results && results.length > 0) {
      localLatitude.value = parseFloat(results[0].lat);
      localLongitude.value = parseFloat(results[0].lon);
      emit('update:latitude', localLatitude.value);
      emit('update:longitude', localLongitude.value);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  } finally {
    isGeocoding.value = false;
  }
};

// Watch for address changes and geocode
watch([selectedDepartamento, selectedDistrito, () => props.street], () => {
  if (isAddressComplete.value) {
    geocodeAddress();
  }
});

// Handle coordinate updates from map
const handleLatitudeUpdate = (lat) => {
  localLatitude.value = lat;
  emit('update:latitude', lat);
};

const handleLongitudeUpdate = (lng) => {
  localLongitude.value = lng;
  emit('update:longitude', lng);
};

// Handle street input
const handleStreetInput = (event) => {
  emit('update:street', event.target.value);
};
</script>

<template>
  <div class="w-full max-w-6xl mx-auto">
    <!-- Header compacto -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-(--text-color)">Ubicacion del espacio</h1>
        <p class="text-sm text-gray-500">Completa la direccion y ajusta el marcador en el mapa</p>
      </div>
      <!-- Progress inline -->
      <div class="flex items-center gap-3">
        <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-(--primary-color) to-(--secondary-color) transition-all duration-500"
            :style="{ width: `${(completedFields / 5) * 100}%` }"
          />
        </div>
        <span class="text-sm font-semibold text-(--secondary-color)">{{ completedFields }}/5</span>
      </div>
    </div>

    <!-- Layout principal: Mapa grande arriba, formulario abajo -->
    <div class="flex flex-col gap-4">
      <!-- Mapa grande -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div class="h-64 md:h-80">
          <LeafletMap
            :latitude="localLatitude"
            :longitude="localLongitude"
            :address="fullAddress"
            :editable="true"
            height="100%"
            @update:latitude="handleLatitudeUpdate"
            @update:longitude="handleLongitudeUpdate"
          />
        </div>
        <!-- Status bar debajo del mapa -->
        <div class="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <span>Haz clic o arrastra el marcador para ajustar</span>
          </div>
          <div v-if="isGeocoding" class="flex items-center gap-2 text-sm text-gray-500">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-(--secondary-color)"></div>
            <span>Buscando...</span>
          </div>
          <div v-else-if="localLatitude && localLongitude" class="flex items-center gap-1 text-sm text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ localLatitude.toFixed(4) }}, {{ localLongitude.toFixed(4) }}</span>
          </div>
        </div>
      </div>

      <!-- Formulario compacto en grid -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- País (fijo) -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
              <span>🌎</span> Pais
            </label>
            <div class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
              Peru
            </div>
          </div>

          <!-- Departamento -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
              <span>🏙️</span> Departamento
            </label>
            <select
              v-model="selectedDepartamento"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--secondary-color) focus:border-(--secondary-color) outline-none transition bg-white"
            >
              <option value="" disabled>Seleccionar...</option>
              <option v-for="dep in departamentos" :key="dep" :value="dep">
                {{ dep }}
              </option>
            </select>
          </div>

          <!-- Distrito -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
              <span>📍</span> Distrito
            </label>
            <select
              v-model="selectedDistrito"
              :disabled="!selectedDepartamento"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--secondary-color) focus:border-(--secondary-color) outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="" disabled>{{ selectedDepartamento ? 'Seleccionar...' : 'Primero elige departamento' }}</option>
              <option v-for="dist in distritosFiltrados" :key="dist" :value="dist">
                {{ dist }}
              </option>
            </select>
          </div>

          <!-- Dirección -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
              <span>🏢</span> Direccion
            </label>
            <input
              type="text"
              :value="props.street"
              @input="handleStreetInput"
              placeholder="Av. Larco 123"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--secondary-color) focus:border-(--secondary-color) outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
