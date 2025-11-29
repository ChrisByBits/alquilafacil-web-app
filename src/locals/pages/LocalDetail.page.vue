<script setup>
import NavbarComponent from '../../public/components/Navbar.component.vue';
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { LocalsApiService } from '../services/locals-api.service';
import { LocalResponse } from '../model/local.response';
import { ReservationRequest } from '../../booking/models/reservation.request';
import { useAuthenticationStore } from '../../auth/services/authentication.store';
import { ReservationsApiService } from '../../booking/services/reservations-api.service';
import { ProfilesApiService } from '../../profile/services/profiles-api.service';
import FooterComponent from '../../public/components/Footer.component.vue';
import { cloudinaryWidget } from '../../shared/components/cloudinary-widget';
import LeafletMapComponent from '../../shared/components/LeafletMap.component.vue';
import RecommendedLocalsComponent from '../../recommendations/components/RecommendedLocals.component.vue';
import { useChatStore } from '../../chat/services/chat.store';
import OptimizedImageComponent from '../../shared/components/OptimizedImage.component.vue';
import { useImageOptimization } from '../../shared/composables/useImageOptimization';
import ContractSigningModalComponent from '../../contracts/components/ContractSigningModal.component.vue';
import { ContractsService } from '../../contracts/services/contracts.service';

const route = useRoute();
const router = useRouter();
const authenticationStore = useAuthenticationStore();
const chatStore = useChatStore();

const localsApiService = new LocalsApiService();
const reservationsApiService = new ReservationsApiService();
const profilesApiService = new ProfilesApiService();
const contractsService = new ContractsService();
const { getOptimizedUrl, getThumbnailUrl, getFullSizeUrl } = useImageOptimization();

const local = ref({});
const bankAccounts = ref({});
const startDate = ref('');
const endDate = ref('');
const selectedPhoto = ref('');
const selectedPhotoIndex = ref(0);
const voucherImageUrl = ref('');
const isLoaded = ref(false);
const lightboxOpen = ref(false);

// Contract signing state
const showContractModal = ref(false);
const contractToSign = ref(null);
const isProcessingReservation = ref(false);

onMounted(async () => {
  const id = parseInt(route.params.id);
  const response = await localsApiService.getById(id);
  local.value = new LocalResponse(response);
  bankAccounts.value = await profilesApiService.getBankAccountsByUserId(local.value.userId);
  selectedPhoto.value = local.value.photoUrls[0];
  isLoaded.value = true;
});

const now = () => new Date().toISOString().slice(0, 16);

const isStartDateValid = computed(() => {
  return startDate.value && startDate.value >= now();
});

const isEndDateValid = computed(() => {
  return (
    endDate.value &&
    startDate.value &&
    endDate.value > startDate.value
  );
});

// Máximo 24 horas de reserva
const MAX_HOURS = 24;

const reservationDurationHours = computed(() => {
  if (!startDate.value || !endDate.value) return 0;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
});

const isDurationValid = computed(() => {
  return reservationDurationHours.value > 0 && reservationDurationHours.value <= MAX_HOURS;
});

const isFormValid = computed(() => isStartDateValid.value && isEndDateValid.value && isDurationValid.value);

const totalAmountToPay = computed(() => {
  if (isFormValid.value) {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return Math.round(diffInHours * local.value.price * 100) / 100; // Redondear a 2 decimales
  }
  return 0.00;
});

const openUploadWidget = async () => {
  try {
    const secureUrl = await cloudinaryWidget();
    console.log("URL segura:", secureUrl);
    voucherImageUrl.value = secureUrl[0]
  } catch (error) {
    console.error("Error al subir imagen:", error);
  }
};

// Default contract content for when owner hasn't customized one
const defaultContractContent = `CONTRATO DE ARRENDAMIENTO DE LOCAL

En la ciudad de _____________, a {{currentDate}}

COMPARECEN:

Por una parte, {{landlordName}}, en adelante "EL ARRENDADOR"
Por otra parte, {{tenantName}}, en adelante "EL ARRENDATARIO"

CLAUSULAS:

PRIMERA - OBJETO DEL CONTRATO
El arrendador cede en arrendamiento al arrendatario el local denominado "{{localName}}", ubicado en {{localAddress}}.

SEGUNDA - DURACION
El presente contrato tendra vigencia desde {{startDate}} hasta {{endDate}}, con una duracion total de {{duration}}.

TERCERA - PRECIO
El precio total del arrendamiento es de S/. {{totalPrice}} (soles), que el arrendatario se compromete a pagar mediante voucher de deposito antes del inicio del periodo de alquiler.

CUARTA - USO DEL LOCAL
El arrendatario se compromete a utilizar el local unicamente para los fines acordados y a mantenerlo en buen estado durante el periodo de arrendamiento.

QUINTA - OBLIGACIONES DEL ARRENDATARIO
- Respetar las normas de uso del local
- No subarrendar total o parcialmente el local
- Devolver el local en las mismas condiciones en que lo recibio
- Asumir la responsabilidad por danos causados durante el uso

SEXTA - OBLIGACIONES DEL ARRENDADOR
- Entregar el local en condiciones optimas para su uso
- Garantizar el disfrute pacifico del local durante el periodo contratado
- Mantener las instalaciones basicas en funcionamiento

SEPTIMA - RESERVA
ID de la reserva: {{reservationId}}

Ambas partes firman el presente contrato en senal de conformidad.


_________________________          _________________________
     EL ARRENDADOR                      EL ARRENDATARIO
    {{landlordName}}                    {{tenantName}}
`;

const formatDuration = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutos`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours % 1) * 60);
  if (m === 0) return `${h} hora${h > 1 ? 's' : ''}`;
  return `${h}h ${m}min`;
};

const prepareContractContent = (content) => {
  const localStartDate = new Date(startDate.value);
  const localEndDate = new Date(endDate.value);

  const replacements = {
    landlordName: local.value.userUsername || 'Propietario',
    tenantName: authenticationStore.username || 'Arrendatario',
    localName: local.value.localName || 'Local',
    localAddress: local.value.address || 'Direccion no especificada',
    startDate: localStartDate.toLocaleString('es-PE'),
    endDate: localEndDate.toLocaleString('es-PE'),
    totalPrice: totalAmountToPay.value.toFixed(2),
    currentDate: new Date().toLocaleDateString('es-PE'),
    reservationId: `RES-${Date.now()}`,
    duration: formatDuration(reservationDurationHours.value)
  };

  let processedContent = content;
  Object.entries(replacements).forEach(([key, value]) => {
    processedContent = processedContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  return processedContent;
};

const initiateReservation = async () => {
  if (!isFormValid.value || !voucherImageUrl.value) return;

  try {
    // Try to get owner's contract template
    let contractContent = defaultContractContent;

    try {
      const templates = await contractsService.getContractTemplatesByUserId(local.value.userId);
      if (templates && templates.length > 0) {
        // Use default template or first available
        const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
        contractContent = defaultTemplate.content;
      }
    } catch (err) {
      console.log('No contract template found, using default');
    }

    // Prepare contract with actual data
    const processedContract = prepareContractContent(contractContent);

    contractToSign.value = {
      content: processedContract,
      localName: local.value.localName
    };

    showContractModal.value = true;
  } catch (error) {
    console.error('Error preparing contract:', error);
    alert('Error al preparar el contrato. Por favor, inténtelo de nuevo.');
  }
};

const handleContractSigned = async (signatureData) => {
  isProcessingReservation.value = true;

  try {
    const localStartDate = new Date(startDate.value);
    const localEndDate = new Date(endDate.value);

    // Ajustar las fechas a UTC pero sin cambiar la hora
    const startDateUTC = new Date(localStartDate.getTime() - localStartDate.getTimezoneOffset() * 60000);
    const endDateUTC = new Date(localEndDate.getTime() - localEndDate.getTimezoneOffset() * 60000);

    const formattedStartDate = startDateUTC.toISOString();
    const formattedEndDate = endDateUTC.toISOString();

    // Create reservation
    const reservationRequest = new ReservationRequest({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      localId: local.value.id,
      userId: authenticationStore.userId,
      price: totalAmountToPay.value,
      voucherImageUrl: voucherImageUrl.value,
    });

    const reservationResponse = await reservationsApiService.create(reservationRequest);

    // Create contract instance with signature
    try {
      await contractsService.createContractInstance({
        reservationId: reservationResponse.id || reservationResponse.data?.id,
        landlordId: local.value.userId,
        tenantId: authenticationStore.userId,
        content: contractToSign.value.content,
        status: 'signed',
        signatureImage: signatureData.signatureImage,
        signedAt: signatureData.signedAt,
        signerName: signatureData.signerName
      });
    } catch (contractError) {
      console.warn('Could not save contract instance:', contractError);
      // Continue anyway - the reservation was created successfully
    }

    // Create conversation between tenant and landlord for communication
    try {
      await chatStore.createOrGetConversation(authenticationStore.userId, local.value.userId);
    } catch (chatError) {
      console.warn('Could not create conversation:', chatError);
      // Continue anyway - the reservation was created successfully
    }

    showContractModal.value = false;
    alert('Reserva realizada correctamente. El contrato ha sido firmado.');
    router.push('/calendar');
  } catch (error) {
    console.error('Error al reservar el local:', error);
    alert('Error al reservar el local. Por favor, inténtelo de nuevo más tarde.');
  } finally {
    isProcessingReservation.value = false;
  }
};

const closeContractModal = () => {
  showContractModal.value = false;
  contractToSign.value = null;
};

const startChatWithOwner = async () => {
  if (!authenticationStore.isSignedIn) {
    router.push('/sign-in');
    return;
  }
  try {
    const conversation = await chatStore.createOrGetConversation(authenticationStore.userId, local.value.userId);
    router.push('/chat');
  } catch (error) {
    console.error('Error al iniciar chat:', error);
  }
};

// Image gallery functions
const selectPhoto = (photo, index) => {
  selectedPhoto.value = photo;
  selectedPhotoIndex.value = index;
};

const nextPhoto = () => {
  if (local.value.photoUrls && local.value.photoUrls.length > 0) {
    selectedPhotoIndex.value = (selectedPhotoIndex.value + 1) % local.value.photoUrls.length;
    selectedPhoto.value = local.value.photoUrls[selectedPhotoIndex.value];
  }
};

const prevPhoto = () => {
  if (local.value.photoUrls && local.value.photoUrls.length > 0) {
    selectedPhotoIndex.value = (selectedPhotoIndex.value - 1 + local.value.photoUrls.length) % local.value.photoUrls.length;
    selectedPhoto.value = local.value.photoUrls[selectedPhotoIndex.value];
  }
};

const openLightbox = () => {
  lightboxOpen.value = true;
};

const closeLightbox = () => {
  lightboxOpen.value = false;
};

// Keyboard navigation for lightbox
const handleKeydown = (event) => {
  if (!lightboxOpen.value) return;
  if (event.key === 'ArrowRight') nextPhoto();
  if (event.key === 'ArrowLeft') prevPhoto();
  if (event.key === 'Escape') closeLightbox();
};

</script>

<template>
  <NavbarComponent />
  <main class="px-4 sm:px-8 md:px-10 lg:px-16 py-10 w-full min-h-[80dvh] flex flex-col gap-6">
    <template v-if="isLoaded">
      <div class="flex items-center">
        <h2 class="text-3xl font-semibold min-w-70 text-(--text-color)">Detalles del local:</h2>
        <div class="w-full h-2 bg-(--secondary-color) rounded-md ml-4"></div>
      </div>
      
      <div class="w-full flex flex-col md:flex-row gap-6">
        <!-- Imagenes del local - Carrusel mejorado -->
        <div class="w-full md:w-2/3 flex flex-col shadow-lg bg-(--background-card-color) rounded-lg p-4 justify-center">
          <!-- Main Image with Navigation -->
          <div class="relative group">
            <OptimizedImageComponent
              :src="selectedPhoto"
              :alt="local.localName || 'Imagen del local'"
              :width="800"
              fit="cover"
              placeholder="blur"
              rounded="lg"
              class="w-full h-full max-h-160 cursor-pointer transition-transform hover:scale-[1.02]"
              @click="openLightbox"
            />

            <!-- Navigation Arrows -->
            <button
              v-if="local.photoUrls && local.photoUrls.length > 1"
              @click="prevPhoto"
              class="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-if="local.photoUrls && local.photoUrls.length > 1"
              @click="nextPhoto"
              class="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Image Counter -->
            <div v-if="local.photoUrls && local.photoUrls.length > 1" class="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {{ selectedPhotoIndex + 1 }} / {{ local.photoUrls.length }}
            </div>

            <!-- Expand Icon -->
            <button
              @click="openLightbox"
              class="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Ver en pantalla completa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="local.photoUrls && local.photoUrls.length > 1" class="flex gap-2 mt-4 overflow-x-auto pb-2">
            <img
              v-for="(photo, index) in local.photoUrls"
              :key="index"
              :src="getThumbnailUrl(photo, 150)"
              alt="Miniatura"
              loading="lazy"
              class="w-32 h-24 object-cover rounded cursor-pointer border-2 transition-all hover:opacity-80"
              :class="selectedPhotoIndex === index ? 'border-(--secondary-color) ring-2 ring-(--secondary-color)' : 'border-transparent'"
              @click="selectPhoto(photo, index)"
            />
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="flex flex-col justify-center gap-6 shadow-lg bg-(--background-card-color) rounded-lg p-4 w-full md:w-1/3  overflow-y-auto">

          <!-- Información del local -->
          <h1 class="text-3xl font-semibold mt-4 text-(--text-color)">{{ local.localName }}</h1>
          <p class="text-2xl text-(--text-color)">{{ `📍 ${local.address}` }}</p>
          <p class="text-2xl text-(--text-color)"><span class="font-semibold">👨‍👨‍👧‍👧 Aforo: </span>{{ local.capacity }} personas</p>
          <p class="text-2xl text-(--text-color)"><span class="font-semibold">👑 Propietario: </span>{{ local.userUsername }}</p>
          <p class="text-2xl font-semibold text-(--text-color)">🔎 Descripción:</p>
          <p class="text-xl text-justify text-(--text-color)">{{ local.descriptionMessage }}</p>
          <div v-if="local.features[0] !== ''" class="flex flex-col gap-2">
            <p class="text-2xl font-bold text-(--text-color)">📕 Características</p>
            <ul class="list-disc list-inside text-justify">
            <li v-for="(feature, index) in local.features" :key="index" class="text-lg text-(--text-color)">{{ feature }}</li>
          </ul>
          </div>

          <!-- Opciones -->
          <h2 class="text-2xl font-semibold text-(--text-color)">Opciones:</h2>
          <div class="flex flex-col gap-5 text-xl">
            <RouterLink :to="`/comments/${local.id}`" class="text-(--primary-color) hover:underline">
              💬 Ver comentarios >
            </RouterLink>
            <RouterLink :to="`/report/${local.id}`" class="text-(--primary-color) hover:underline">
              ⚠ Reportar espacio >
            </RouterLink>
            <button
              v-if="authenticationStore.isSignedIn && authenticationStore.userId !== local.userId"
              @click="startChatWithOwner"
              class="text-(--primary-color) hover:underline text-left"
            >
              💬 Chatear con propietario >
            </button>
          </div>

          <!-- Fechas -->
          <div v-if="authenticationStore.userId !== local.userId" class="flex flex-col gap-5 text-(--text-color)">
            <div class="flex gap-4 justify-between items-center">
              <p class="text-xl">Fecha y hora de inicio:</p>
              <input
                type="datetime-local"
                class="w-1/2 p-2 border-2 caret-(--text-color) rounded-lg"
                v-model="startDate"
              />
            </div>
            <p v-if="startDate && !isStartDateValid" class="text-red-500 text-sm">
              La fecha de inicio debe ser mayor o igual al momento actual.
            </p>

            <div class="flex gap-4 justify-between items-center">
              <p class="text-xl">Fecha y hora de fin:</p>
              <input
                type="datetime-local"
                class="w-1/2 p-2 border-2 caret-(--text-color) rounded-lg"
                v-model="endDate"
              />
            </div>
            <p v-if="endDate && !isEndDateValid" class="text-red-500 text-sm">
              La fecha de fin debe ser posterior a la fecha de inicio.
            </p>
            <p v-if="isEndDateValid && !isDurationValid" class="text-red-500 text-sm">
              La reserva no puede exceder las 24 horas.
            </p>
            <!-- Info de duración -->
            <div v-if="reservationDurationHours > 0 && isDurationValid" class="p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-700">
                <span class="font-semibold">Duracion:</span> {{ Math.floor(reservationDurationHours) }}h {{ Math.round((reservationDurationHours % 1) * 60) }}min
              </p>
            </div>
          </div>
          <div v-if="isFormValid" class="bg-(--background-card-color) text-(--text-color) p-4 rounded-lg mt-4 flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Cuenta del propietario:</h3>
            <ul class="flex flex-col gap-2">
              <p><span class="font-bold">Número de cuenta:</span> {{ bankAccounts.bankAccountNumber }}</p>
              <p><span class="font-bold">Número de cuenta interbancaria:</span> {{ bankAccounts.interbankAccountNumber }}</p>
              <p><span class="font-bold">Cantidad a depositar:</span> S/.{{ totalAmountToPay }}</p>
            </ul>
            <button @click="openUploadWidget" class="flex flex-col p-10 shadow-2xl hover:cursor-pointer">
              <img src="/svgs/camera.svg" alt="camera" class="w-1/2 max-w-30 mx-auto mt-4" />
              <span class="text-center text-(--text-color) text-2xl">Adjuntar imagen del voucher</span>
            </button>
          </div>
          <!-- Botón -->
          <button v-if="authenticationStore.userId !== local.userId"
            :disabled="!isFormValid || !voucherImageUrl || isProcessingReservation"
            class="bg-[var(--secondary-color)] rounded-md py-5 text-white text-xl hover:cursor-pointer hover:bg-[var(--secondary-color-hover)] transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            @click="initiateReservation"
          >
            <svg v-if="isProcessingReservation" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isProcessingReservation ? 'Procesando...' : 'Reservar y firmar contrato' }}
          </button>
        </div>
      </div>

      <!-- Map Section -->
      <div class="mt-6" v-if="local.latitude && local.longitude">
        <div class="flex items-center mb-4">
          <h2 class="text-2xl font-semibold min-w-40 text-(--text-color)">Ubicación</h2>
          <div class="w-full h-2 bg-(--secondary-color) rounded-md ml-4"></div>
        </div>
        <LeafletMapComponent
          :latitude="local.latitude"
          :longitude="local.longitude"
          :address="local.address"
          height="400px"
        />
      </div>

      <!-- Recommendations Section -->
      <div class="mt-6">
        <RecommendedLocalsComponent
          :local-id="local.id"
          type="similar"
          title="Espacios similares"
          :limit="4"
        />
      </div>
    </template>

    <!-- Skeleton mientras se carga -->
    <template v-else>
      <div class="flex items-center gap-4">
        <div class="h-8 w-1/4 skeleton"></div>
        <div class="h-2 w-full skeleton rounded-md"></div>
      </div>

      <div class="w-full flex flex-col md:flex-row gap-6">
        <!-- Skeleton de imagen principal -->
        <div class="w-full md:w-2/3 flex flex-col shadow-lg bg-(--background-card-color) rounded-lg p-4 gap-4">
          <!-- Imagen principal del local -->
          <div class="h-150 w-full skeleton"></div>
        </div>

        <!-- Skeleton panel lateral -->
        <div class="flex flex-col gap-4 shadow-lg bg-(--background-color) rounded-lg p-4 w-full md:w-1/3">
          <div class="h-8 w-2/3 skeleton"></div>
          <div class="h-6 w-1/2 skeleton"></div>
          <div class="h-6 w-3/4 skeleton"></div>
          <div class="h-6 w-1/2 skeleton"></div>
          <div class="h-24 w-full skeleton"></div>

          <div class="h-6 w-1/2 skeleton mt-4"></div>
          <div class="h-6 w-full skeleton"></div>
          <div class="h-6 w-full skeleton"></div>

          <div class="h-10 w-full skeleton mt-4"></div>
        </div>
      </div>
    </template>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        @click="closeLightbox"
        @keydown="handleKeydown"
        tabindex="0"
        class="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      >
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image Counter -->
        <div v-if="local.photoUrls && local.photoUrls.length > 1" class="absolute top-4 left-4 text-white text-lg">
          {{ selectedPhotoIndex + 1 }} / {{ local.photoUrls.length }}
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="local.photoUrls && local.photoUrls.length > 1"
          @click.stop="prevPhoto"
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-4 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="local.photoUrls && local.photoUrls.length > 1"
          @click.stop="nextPhoto"
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-4 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Main Image -->
        <img
          :src="getFullSizeUrl(selectedPhoto)"
          @click.stop
          class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          alt="Imagen del local en pantalla completa"
        />

        <!-- Thumbnail Strip at Bottom -->
        <div
          v-if="local.photoUrls && local.photoUrls.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-[90vw] overflow-x-auto"
        >
          <img
            v-for="(photo, index) in local.photoUrls"
            :key="index"
            :src="getThumbnailUrl(photo, 100)"
            @click.stop="selectPhoto(photo, index)"
            class="w-16 h-12 object-cover rounded cursor-pointer transition-all"
            :class="selectedPhotoIndex === index ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-100'"
            alt="Miniatura"
            loading="lazy"
          />
        </div>
      </div>
    </Teleport>

    <!-- Contract Signing Modal -->
    <ContractSigningModalComponent
      :visible="showContractModal"
      :contract="contractToSign"
      :signer-name="authenticationStore.username"
      @close="closeContractModal"
      @sign="handleContractSigned"
    />
  </main>
  <FooterComponent />
</template>