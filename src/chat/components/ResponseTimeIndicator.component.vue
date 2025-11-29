<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ChatService } from '../services/chat.service.js';

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  }
});

const chatService = new ChatService();
const metrics = ref(null);
const loading = ref(false);
const error = ref(null);

const loadMetrics = async () => {
  if (!props.userId) return;

  loading.value = true;
  error.value = null;

  try {
    metrics.value = await chatService.getChatMetricsByUserId(props.userId);
  } catch (err) {
    console.error('Error loading chat metrics:', err);
    error.value = 'No se pudo cargar las métricas';
    metrics.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadMetrics();
});

watch(() => props.userId, () => {
  loadMetrics();
});

const averageResponseTime = computed(() => {
  if (!metrics.value || !metrics.value.averageResponseTimeMinutes) return null;
  return metrics.value.averageResponseTimeMinutes;
});

const responseLevel = computed(() => {
  if (!averageResponseTime.value) return 'unknown';

  const minutes = averageResponseTime.value;
  if (minutes <= 5) return 'fast';
  if (minutes <= 30) return 'medium';
  if (minutes <= 60) return 'slow';
  return 'very-slow';
});

const levelConfig = computed(() => {
  const configs = {
    'fast': {
      label: 'Responde rápido',
      shortLabel: '< 5 min',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: '⚡'
    },
    'medium': {
      label: 'Responde en minutos',
      shortLabel: '< 30 min',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: '🕐'
    },
    'slow': {
      label: 'Responde en una hora',
      shortLabel: '< 1 hora',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: '🕑'
    },
    'very-slow': {
      label: 'Puede tardar en responder',
      shortLabel: '> 1 hora',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: '🕓'
    },
    'unknown': {
      label: 'Sin datos',
      shortLabel: 'N/A',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: '❓'
    }
  };

  return configs[responseLevel.value] || configs['unknown'];
});

const formattedResponseTime = computed(() => {
  if (!averageResponseTime.value) return 'Sin datos';

  const minutes = averageResponseTime.value;

  if (minutes < 1) {
    return 'Menos de 1 min';
  } else if (minutes < 60) {
    return `~${Math.round(minutes)} min`;
  } else if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `~${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.round(minutes / 1440);
    return `~${days} día${days > 1 ? 's' : ''}`;
  }
});

const totalMessagesReceived = computed(() => {
  return metrics.value?.totalMessagesReceived || 0;
});

const totalMessagesSent = computed(() => {
  return metrics.value?.totalMessagesSent || 0;
});
</script>

<template>
  <div class="response-time-indicator">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center gap-1 text-gray-400 text-xs">
      <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Cargando...</span>
    </div>

    <!-- Metrics display -->
    <div v-else-if="metrics" class="flex items-center gap-2">
      <!-- Response time badge -->
      <div
        class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
        :class="[levelConfig.bgColor, levelConfig.color]"
        :title="`Tiempo promedio de respuesta: ${formattedResponseTime}`"
      >
        <span>{{ levelConfig.icon }}</span>
        <span class="font-medium">{{ formattedResponseTime }}</span>
      </div>

      <!-- Tooltip with more details -->
      <div class="group relative">
        <button class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Tooltip content -->
        <div class="absolute left-0 top-6 z-50 hidden group-hover:block w-48 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
          <h4 class="font-semibold text-gray-800 text-sm mb-2">Estadísticas de chat</h4>
          <div class="space-y-1 text-xs text-gray-600">
            <div class="flex justify-between">
              <span>Tiempo de respuesta:</span>
              <span class="font-medium" :class="levelConfig.color">{{ formattedResponseTime }}</span>
            </div>
            <div class="flex justify-between">
              <span>Mensajes enviados:</span>
              <span class="font-medium">{{ totalMessagesSent }}</span>
            </div>
            <div class="flex justify-between">
              <span>Mensajes recibidos:</span>
              <span class="font-medium">{{ totalMessagesReceived }}</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-100">
            <p class="text-xs" :class="levelConfig.color">{{ levelConfig.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No metrics available -->
    <div v-else-if="!loading && !error" class="text-gray-400 text-xs">
      Sin historial de chat
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-gray-400 text-xs">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.response-time-indicator {
  display: inline-flex;
  align-items: center;
}
</style>
