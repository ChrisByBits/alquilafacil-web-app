<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  price: [String, Number],
});

const emit = defineEmits([
  'update:price',
]);

const error = ref(null);

const validatePrice = (value) => {
  const num = Number(value);
  if (!value || num <= 0) {
    error.value = 'Ingresa un precio valido';
    return false;
  }
  if (num > 10000) {
    error.value = 'El precio maximo es S/ 10,000 por hora';
    return false;
  }
  error.value = null;
  return true;
};

const handleInput = (event) => {
  emit('update:price', event.target.value);
  validatePrice(event.target.value);
};

// Price calculations
const dailyEstimate = computed(() => {
  const hourly = Number(props.price) || 0;
  return hourly * 8; // 8 hours workday
});

const weeklyEstimate = computed(() => {
  return dailyEstimate.value * 5; // 5 days
});

const monthlyEstimate = computed(() => {
  return dailyEstimate.value * 20; // 20 work days
});

// Similar prices reference
const similarPrices = [
  { type: 'Oficinas', range: 'S/ 20 - 50/hora' },
  { type: 'Salas de reunion', range: 'S/ 30 - 80/hora' },
  { type: 'Locales para eventos', range: 'S/ 50 - 150/hora' },
  { type: 'Estudios creativos', range: 'S/ 40 - 100/hora' }
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0
  }).format(value);
};
</script>

<template>
  <div class="w-full max-w-3xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl md:text-4xl font-bold text-(--text-color) mb-3">
        Establece tu precio por hora
      </h1>
      <p class="text-lg text-gray-600">
        Puedes ajustarlo cuando quieras
      </p>
    </div>

    <!-- Price input card -->
    <div class="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
      <div class="flex flex-col items-center">
        <!-- Price input -->
        <div class="relative mb-4">
          <span class="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400">S/</span>
          <input
            type="number"
            :value="props.price"
            @input="handleInput"
            class="w-64 h-24 text-center text-5xl font-bold pl-14 pr-6 border-2 rounded-2xl transition-all outline-none"
            :class="error
              ? 'border-red-400 focus:border-red-500 text-red-500'
              : 'border-gray-200 focus:border-(--secondary-color) text-gray-800'"
            placeholder="0"
            min="1"
            max="10000"
          />
        </div>

        <p class="text-xl text-gray-600 mb-2">por hora</p>

        <!-- Error -->
        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

        <!-- Quick price buttons -->
        <div class="flex flex-wrap justify-center gap-2 mt-4">
          <button
            v-for="quickPrice in [20, 30, 50, 80, 100]"
            :key="quickPrice"
            @click="emit('update:price', quickPrice)"
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="Number(props.price) === quickPrice
              ? 'bg-(--secondary-color) text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            S/ {{ quickPrice }}
          </button>
        </div>
      </div>
    </div>

    <!-- Earnings estimate -->
    <div v-if="Number(props.price) > 0" class="bg-gradient-to-r from-(--primary-color) to-(--secondary-color) rounded-2xl p-6 text-white mb-8">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
        </svg>
        Potencial de ingresos estimado
      </h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <p class="text-2xl font-bold">{{ formatCurrency(dailyEstimate) }}</p>
          <p class="text-sm opacity-80">Por dia (8h)</p>
        </div>
        <div class="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <p class="text-2xl font-bold">{{ formatCurrency(weeklyEstimate) }}</p>
          <p class="text-sm opacity-80">Por semana</p>
        </div>
        <div class="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <p class="text-2xl font-bold">{{ formatCurrency(monthlyEstimate) }}</p>
          <p class="text-sm opacity-80">Por mes</p>
        </div>
      </div>
      <p class="text-xs opacity-70 mt-3 text-center">*Estimacion basada en uso promedio. Los ingresos reales pueden variar.</p>
    </div>

    <!-- Reference prices -->
    <div class="bg-gray-50 rounded-2xl p-6">
      <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-(--secondary-color)" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        Precios de referencia en tu zona
      </h3>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="item in similarPrices"
          :key="item.type"
          class="flex justify-between items-center p-3 bg-white rounded-xl"
        >
          <span class="text-sm text-gray-600">{{ item.type }}</span>
          <span class="text-sm font-semibold text-gray-800">{{ item.range }}</span>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-6 text-center text-sm text-gray-500">
      <p>Puedes ajustar el precio despues de publicar segun la demanda</p>
    </div>
  </div>
</template>
