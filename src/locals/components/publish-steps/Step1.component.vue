<script setup>
import { useRouter } from 'vue-router';
import { ProfilesApiService } from '../../../profile/services/profiles-api.service';
import { useAuthenticationStore } from '../../../auth/services/authentication.store';
import { onMounted, ref } from 'vue';

const profilesApiService = new ProfilesApiService();
const authenticationStore = useAuthenticationStore();
const router = useRouter();

const isChecking = ref(true);
const hasBankAccount = ref(false);

onMounted(async () => {
  try {
    const userId = authenticationStore.userId;
    const bankAccounts = await profilesApiService.getBankAccountsByUserId(userId);

    if (bankAccounts.bankAccountNumber?.length === 0 || bankAccounts.interbankAccountNumber?.length === 0) {
      hasBankAccount.value = false;
      alert("No tienes cuentas bancarias registradas. Por favor, registra una cuenta bancaria para poder recibir pagos por la reserva de tu local.");
      router.push("/control-panel");
    } else {
      hasBankAccount.value = true;
    }
  } catch (error) {
    console.error('Error checking bank accounts:', error);
  } finally {
    isChecking.value = false;
  }
});

const features = [
  {
    icon: '📝',
    title: 'Describe tu espacio',
    description: 'Comparte la categoria, ubicacion y caracteristicas basicas de tu local',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '📸',
    title: 'Haz que destaque',
    description: 'Agrega fotos atractivas, un titulo llamativo y una descripcion detallada',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '🚀',
    title: 'Publica y gana',
    description: 'Establece tu precio por hora y comienza a recibir reservas',
    color: 'from-orange-500 to-red-500'
  }
];

const benefits = [
  { icon: '💰', text: 'Sin comisiones ocultas' },
  { icon: '🔒', text: 'Pagos seguros garantizados' },
  { icon: '📊', text: 'Panel de control completo' },
  { icon: '💬', text: 'Chat directo con clientes' }
];
</script>

<template>
  <div v-if="isChecking" class="flex items-center justify-center py-20">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-(--secondary-color) mx-auto mb-4"></div>
      <p class="text-gray-600">Verificando tu cuenta...</p>
    </div>
  </div>

  <div v-else class="w-full max-w-4xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-(--secondary-color)/10 rounded-full mb-6">
        <span class="text-lg">🎉</span>
        <span class="text-sm font-medium text-(--secondary-color)">Comienza a generar ingresos hoy</span>
      </div>

      <h1 class="text-4xl md:text-5xl font-bold text-(--text-color) mb-4">
        Publica tu espacio en
        <span class="text-(--secondary-color)">AlquilaFacil</span>
      </h1>

      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Convierte tu local en una fuente de ingresos. Miles de personas buscan espacios como el tuyo.
      </p>
    </div>

    <!-- Steps Cards -->
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
      >
        <!-- Step number -->
        <div class="absolute -top-3 -left-3 w-8 h-8 bg-(--secondary-color) text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
          {{ index + 1 }}
        </div>

        <!-- Icon -->
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 bg-gradient-to-br shadow-lg"
          :class="feature.color"
        >
          {{ feature.icon }}
        </div>

        <h3 class="text-xl font-bold text-gray-800 mb-2">{{ feature.title }}</h3>
        <p class="text-gray-600">{{ feature.description }}</p>

        <!-- Decorative line -->
        <div
          v-if="index < features.length - 1"
          class="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-gray-300"
        />
      </div>
    </div>

    <!-- Benefits -->
    <div class="bg-gradient-to-r from-(--primary-color) to-(--secondary-color) rounded-2xl p-8 text-white mb-8">
      <h3 class="text-2xl font-bold text-center mb-6">Por que elegir AlquilaFacil</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="benefit in benefits"
          :key="benefit.text"
          class="flex flex-col items-center text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm"
        >
          <span class="text-3xl mb-2">{{ benefit.icon }}</span>
          <span class="text-sm font-medium">{{ benefit.text }}</span>
        </div>
      </div>
    </div>

    <!-- Time estimate -->
    <div class="text-center">
      <div class="inline-flex items-center gap-2 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Tiempo estimado: <strong>5-10 minutos</strong></span>
      </div>
    </div>
  </div>
</template>
