<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavbarComponent from '@/public/components/Navbar.component.vue';
import FooterComponent from '@/public/components/Footer.component.vue';
import Step3Component from '../components/publish-steps/Step3.component.vue';
import Step7Component from '../components/publish-steps/Step7.component.vue';
import Step9Component from '../components/publish-steps/Step9.component.vue';
import { LocalsApiService } from '../services/locals-api.service';
import { useAuthenticationStore } from '@/auth/services/authentication.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthenticationStore();
const localsApiService = new LocalsApiService();

const isLoading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const successMessage = ref(null);
const currentSection = ref('category');

// Departamentos y distritos de Peru
const departamentosConDistritos = {
  'Lima': ['Lima', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja', 'Barranco', 'Chorrillos', 'San Miguel', 'Pueblo Libre', 'Jesus Maria', 'Lince', 'Magdalena', 'Breña', 'Rimac', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'Villa Maria del Triunfo', 'Villa El Salvador', 'Los Olivos', 'San Martin de Porres', 'Independencia', 'Comas', 'Carabayllo', 'Ate', 'Santa Anita', 'El Agustino', 'La Victoria', 'Surquillo'],
  'Arequipa': ['Arequipa', 'Alto Selva Alegre', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'Jose Luis Bustamante y Rivero', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandia', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vitor', 'Yanahuara', 'Yarabamba', 'Yura'],
  'Cusco': ['Cusco', 'Ccorca', 'Poroy', 'San Jeronimo', 'San Sebastian', 'Santiago', 'Saylla', 'Wanchaq', 'Calca', 'Urubamba', 'Ollantaytambo', 'Pisac', 'Machu Picchu'],
  'La Libertad': ['Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Victor Larco Herrera'],
  'Piura': ['Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallan', 'La Arena', 'La Union', 'Las Lomas', 'Tambo Grande', 'Veintiseis de Octubre'],
  'Lambayeque': ['Chiclayo', 'Chongoyape', 'Eten', 'Eten Puerto', 'Jose Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefu', 'Nueva Arica', 'Oyotun', 'Picsi', 'Pimentel', 'Reque', 'Santa Rosa', 'Saña', 'Cayalti', 'Patapo', 'Pomalca', 'Pucala', 'Tuman'],
  'Junin': ['Huancayo', 'Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancan', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucara', 'Quichuay', 'Quilcas', 'San Agustin', 'San Jeronimo de Tunan', 'Saño', 'Sapallanga', 'Sicaya', 'Santo Domingo de Acobamba', 'Viques'],
  'Callao': ['Callao', 'Bellavista', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta', 'Ventanilla', 'Mi Peru'],
  'Ica': ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacutec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San Jose de Los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'],
  'Ancash': ['Huaraz', 'Cochabamba', 'Colcabamba', 'Huanchay', 'Independencia', 'Jangas', 'La Libertad', 'Olleros', 'Pampas Grande', 'Pariacoto', 'Pira', 'Tarica'],
  'Tacna': ['Tacna', 'Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Inclan', 'Pachia', 'Palca', 'Pocollay', 'Sama', 'Coronel Gregorio Albarracin Lanchipa'],
  'Puno': ['Puno', 'Acora', 'Amantani', 'Atuncolla', 'Capachica', 'Chucuito', 'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Plateria', 'San Antonio', 'Tiquillaca', 'Vilque']
};

const departamentos = Object.keys(departamentosConDistritos).sort();

const localData = ref({
  id: null,
  localName: '',
  descriptionMessage: '',
  country: 'Peru',
  city: '',
  district: '',
  street: '',
  price: 0,
  capacity: 0,
  features: [],
  localCategoryId: null,
  userId: null,
});

const distritosFiltrados = computed(() => {
  if (!localData.value.city) return [];
  return departamentosConDistritos[localData.value.city] || [];
});

const sections = [
  { id: 'category', label: 'Categoria', icon: '📁' },
  { id: 'location', label: 'Ubicacion', icon: '📍' },
  { id: 'details', label: 'Detalles', icon: '✏️' },
  { id: 'price', label: 'Precio', icon: '💵' },
];

const isFormValid = computed(() => {
  return localData.value.localName?.length >= 5 &&
         localData.value.descriptionMessage?.length >= 20 &&
         localData.value.city?.length >= 3 &&
         localData.value.district?.length >= 3 &&
         localData.value.street?.length >= 5 &&
         localData.value.price > 0 &&
         localData.value.capacity > 0 &&
         localData.value.features?.length > 0 &&
         localData.value.localCategoryId;
});

onMounted(async () => {
  const localId = route.params.localId;

  if (!localId) {
    error.value = 'ID de local no proporcionado';
    isLoading.value = false;
    return;
  }

  try {
    const response = await localsApiService.getById(localId);

    if (!response) {
      error.value = 'Local no encontrado';
      isLoading.value = false;
      return;
    }

    // Verify ownership
    if (response.userId !== authStore.userId) {
      error.value = 'No tienes permiso para editar este local';
      isLoading.value = false;
      return;
    }

    // Parse address: "street, district, city, country"
    const addressParts = response.address?.split(', ') || [];
    const street = addressParts[0] || '';
    const district = addressParts[1] || '';
    const city = addressParts[2] || '';

    localData.value = {
      id: response.id,
      localName: response.localName,
      descriptionMessage: response.descriptionMessage,
      country: 'Peru',
      city: city,
      district: district,
      street: street,
      price: response.price,
      capacity: response.capacity,
      features: Array.isArray(response.features) ? response.features : (response.features?.split(',').map(f => f.trim()) || []),
      localCategoryId: response.localCategoryId,
      userId: response.userId,
    };
  } catch (err) {
    console.error('Error loading local:', err);
    error.value = 'Error al cargar la informacion del local';
  } finally {
    isLoading.value = false;
  }
});

const saveChanges = async () => {
  if (!isFormValid.value || isSaving.value) return;

  isSaving.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const updateData = {
      localName: localData.value.localName,
      descriptionMessage: localData.value.descriptionMessage,
      country: localData.value.country,
      city: localData.value.city,
      district: localData.value.district,
      street: localData.value.street,
      price: parseInt(localData.value.price),
      capacity: parseInt(localData.value.capacity),
      features: Array.isArray(localData.value.features)
        ? localData.value.features.join(',')
        : localData.value.features,
      localCategoryId: parseInt(localData.value.localCategoryId),
      userId: parseInt(localData.value.userId),
    };

    await localsApiService.update(localData.value.id, updateData);
    successMessage.value = 'Los cambios se han guardado correctamente';

    setTimeout(() => {
      router.push(`/local/${localData.value.id}`);
    }, 1500);
  } catch (err) {
    console.error('Error saving changes:', err);
    error.value = 'Error al guardar los cambios. Por favor, intenta de nuevo.';
  } finally {
    isSaving.value = false;
  }
};

const goToSection = (sectionId) => {
  currentSection.value = sectionId;
  window.scrollTo({ top: 200, behavior: 'smooth' });
};
</script>

<template>
  <NavbarComponent />

  <main class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.push('/control-panel')"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Volver al panel
        </button>
        <h1 class="text-3xl font-bold text-(--text-color)">Editar espacio</h1>
        <p class="text-gray-600 mt-2">Modifica la informacion de tu local publicado</p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-(--primary-color) border-t-transparent"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error && !localData.id" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-700 text-lg">{{ error }}</p>
        <button
          @click="router.push('/control-panel')"
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Volver al panel
        </button>
      </div>

      <!-- Edit form -->
      <div v-else class="grid lg:grid-cols-4 gap-6">
        <!-- Sidebar navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 class="font-semibold text-gray-700 mb-4">Secciones</h3>
            <nav class="flex flex-col gap-2">
              <button
                v-for="section in sections"
                :key="section.id"
                @click="goToSection(section.id)"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
                :class="currentSection === section.id
                  ? 'bg-(--secondary-color) text-white'
                  : 'hover:bg-gray-100 text-gray-700'"
              >
                <span>{{ section.icon }}</span>
                <span class="font-medium">{{ section.label }}</span>
              </button>
            </nav>

            <!-- Info box -->
            <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-xs text-blue-700">
                <strong>Nota:</strong> Las fotos no se pueden modificar desde aqui. Para cambiar fotos, contacta a soporte.
              </p>
            </div>
          </div>
        </div>

        <!-- Main content -->
        <div class="lg:col-span-3">
          <!-- Success/Error messages -->
          <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-green-700">{{ successMessage }}</p>
          </div>

          <div v-if="error && localData.id" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-red-700">{{ error }}</p>
          </div>

          <!-- Section content -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <Transition name="fade" mode="out-in">
              <div :key="currentSection">
                <!-- Category section -->
                <div v-if="currentSection === 'category'">
                  <Step3Component v-model:localCategoryId="localData.localCategoryId" />
                </div>

                <!-- Location section -->
                <div v-else-if="currentSection === 'location'">
                  <div class="w-full max-w-4xl mx-auto">
                    <div class="text-center mb-8">
                      <h1 class="text-2xl font-bold text-(--text-color) mb-2">Ubicacion del espacio</h1>
                      <p class="text-gray-600">Actualiza la direccion de tu local</p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                      <!-- Pais -->
                      <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-gray-700">Pais</label>
                        <div class="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          Peru
                        </div>
                      </div>

                      <!-- Departamento -->
                      <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-gray-700">Departamento *</label>
                        <select
                          v-model="localData.city"
                          class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--secondary-color) focus:border-(--secondary-color) outline-none transition bg-white"
                        >
                          <option value="" disabled>Seleccionar departamento...</option>
                          <option v-for="dep in departamentos" :key="dep" :value="dep">
                            {{ dep }}
                          </option>
                        </select>
                      </div>

                      <!-- Distrito -->
                      <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-gray-700">Distrito *</label>
                        <select
                          v-model="localData.district"
                          :disabled="!localData.city"
                          class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--secondary-color) focus:border-(--secondary-color) outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>{{ localData.city ? 'Seleccionar distrito...' : 'Primero elige departamento' }}</option>
                          <option v-for="dist in distritosFiltrados" :key="dist" :value="dist">
                            {{ dist }}
                          </option>
                        </select>
                      </div>

                      <!-- Direccion -->
                      <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-gray-700">Direccion *</label>
                        <input
                          type="text"
                          v-model="localData.street"
                          placeholder="Av. Larco 123"
                          class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--secondary-color) focus:border-(--secondary-color) outline-none transition"
                        />
                        <p class="text-xs text-gray-500">Minimo 5 caracteres</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Details section -->
                <div v-else-if="currentSection === 'details'">
                  <Step7Component
                    v-model:localName="localData.localName"
                    v-model:descriptionMessage="localData.descriptionMessage"
                    v-model:capacity="localData.capacity"
                    v-model:features="localData.features"
                  />
                </div>

                <!-- Price section -->
                <div v-else-if="currentSection === 'price'">
                  <Step9Component v-model:price="localData.price" />
                </div>
              </div>
            </Transition>
          </div>

          <!-- Save button -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              <span v-if="isFormValid" class="text-green-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Todos los campos estan completos
              </span>
              <span v-else class="text-orange-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Completa todos los campos requeridos
              </span>
            </div>

            <button
              @click="saveChanges"
              :disabled="!isFormValid || isSaving"
              class="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all"
              :class="isFormValid && !isSaving
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            >
              <template v-if="isSaving">
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Guardando...</span>
              </template>
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Guardar cambios</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <FooterComponent />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
