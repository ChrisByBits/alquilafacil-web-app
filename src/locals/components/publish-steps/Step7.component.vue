<script setup>
import { ref, computed } from 'vue';
import ValidatedInput from '@/shared/components/ValidatedInput.component.vue';

const props = defineProps({
  localName: String,
  descriptionMessage: String,
  capacity: [String, Number],
  features: Array,
});

const emit = defineEmits([
  'update:localName',
  'update:descriptionMessage',
  'update:capacity',
  'update:features'
]);

const newFeature = ref('');
const errors = ref({
  localName: null,
  descriptionMessage: null,
  capacity: null
});

// Suggested features
const suggestedFeatures = [
  { icon: '📶', text: 'WiFi gratis' },
  { icon: '❄️', text: 'Aire acondicionado' },
  { icon: '🅿️', text: 'Estacionamiento' },
  { icon: '🚻', text: 'Banos privados' },
  { icon: '☕', text: 'Area de cafe' },
  { icon: '📽️', text: 'Proyector' },
  { icon: '🔊', text: 'Sistema de audio' },
  { icon: '🛋️', text: 'Sala de espera' },
  { icon: '🔒', text: 'Seguridad 24/7' },
  { icon: '♿', text: 'Acceso para discapacitados' }
];

// Validation
const validateLocalName = (value) => {
  if (!value || value.trim().length < 5) {
    errors.value.localName = 'El nombre debe tener al menos 5 caracteres';
    return false;
  }
  if (value.length > 100) {
    errors.value.localName = 'El nombre no puede exceder 100 caracteres';
    return false;
  }
  errors.value.localName = null;
  return true;
};

const validateDescription = (value) => {
  if (!value || value.trim().length < 20) {
    errors.value.descriptionMessage = 'La descripcion debe tener al menos 20 caracteres';
    return false;
  }
  if (value.length > 1000) {
    errors.value.descriptionMessage = 'La descripcion no puede exceder 1000 caracteres';
    return false;
  }
  errors.value.descriptionMessage = null;
  return true;
};

const validateCapacity = (value) => {
  const num = Number(value);
  if (!value || num < 1) {
    errors.value.capacity = 'El aforo debe ser al menos 1 persona';
    return false;
  }
  if (num > 10000) {
    errors.value.capacity = 'El aforo no puede exceder 10,000 personas';
    return false;
  }
  errors.value.capacity = null;
  return true;
};

const descriptionLength = computed(() => {
  return props.descriptionMessage?.length || 0;
});

const nameLength = computed(() => {
  return props.localName?.length || 0;
});

const addFeature = () => {
  const trimmed = newFeature.value.trim();
  if (trimmed && !props.features.includes(trimmed)) {
    emit('update:features', [...props.features, trimmed]);
    newFeature.value = '';
  }
};

const addSuggestedFeature = (feature) => {
  if (!props.features.includes(feature.text)) {
    emit('update:features', [...props.features, feature.text]);
  }
};

const removeFeature = (index) => {
  const updated = [...props.features];
  updated.splice(index, 1);
  emit('update:features', updated);
};

const isFeatureAdded = (featureText) => {
  return props.features.includes(featureText);
};

const completionProgress = computed(() => {
  let score = 0;
  if (props.localName?.length >= 5) score += 25;
  if (props.descriptionMessage?.length >= 20) score += 25;
  if (Number(props.capacity) >= 1) score += 25;
  if (props.features?.length >= 1) score += 25;
  return score;
});
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-(--text-color) mb-3">
        Anade los detalles de tu espacio
      </h1>
      <p class="text-lg text-gray-600">
        Un buen titulo y descripcion ayudan a destacar tu local
      </p>
    </div>

    <!-- Progress -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-600">Completado</span>
        <span class="text-sm font-semibold text-(--secondary-color)">{{ completionProgress }}%</span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-(--primary-color) to-(--secondary-color) transition-all duration-500"
          :style="{ width: `${completionProgress}%` }"
        />
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Left column: Name, Description, Capacity -->
      <div class="space-y-6">
        <!-- Local name -->
        <div>
          <ValidatedInput
            :model-value="props.localName"
            @update:model-value="emit('update:localName', $event)"
            @blur="validateLocalName(props.localName)"
            label="Nombre de tu espacio"
            placeholder="Ej: Sala de reuniones ejecutiva"
            icon="✏️"
            :error="errors.localName"
            :max-length="100"
            required
          />
          <div class="flex justify-between mt-1 text-xs text-gray-400">
            <span>Los titulos cortos y descriptivos funcionan mejor</span>
            <span :class="nameLength > 80 ? 'text-orange-500' : ''">{{ nameLength }}/100</span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="flex items-center gap-1 text-sm font-medium mb-2 text-gray-700">
            Descripcion
            <span class="text-red-500">*</span>
          </label>
          <textarea
            :value="props.descriptionMessage"
            @input="emit('update:descriptionMessage', $event.target.value)"
            @blur="validateDescription(props.descriptionMessage)"
            rows="6"
            class="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none resize-none"
            :class="[
              errors.descriptionMessage
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-200 hover:border-gray-300 focus:border-(--secondary-color)'
            ]"
            placeholder="Describe tu espacio: que lo hace especial, para que se puede usar, que incluye..."
            maxlength="1000"
          ></textarea>
          <div class="flex justify-between mt-1 text-xs">
            <span v-if="errors.descriptionMessage" class="text-red-500">{{ errors.descriptionMessage }}</span>
            <span v-else class="text-gray-400">Minimo 20 caracteres</span>
            <span :class="descriptionLength > 900 ? 'text-orange-500' : 'text-gray-400'">{{ descriptionLength }}/1000</span>
          </div>
        </div>

        <!-- Capacity -->
        <ValidatedInput
          :model-value="props.capacity"
          @update:model-value="emit('update:capacity', $event)"
          @blur="validateCapacity(props.capacity)"
          label="Aforo maximo"
          type="number"
          placeholder="Ej: 50"
          icon="👥"
          :error="errors.capacity"
          :min="1"
          :max="10000"
          hint="Numero maximo de personas que pueden estar en el espacio"
          required
        />
      </div>

      <!-- Right column: Features -->
      <div>
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-xl">📋</span>
            Caracteristicas del espacio
          </h3>

          <!-- Feature input -->
          <div class="flex items-center gap-2 mb-4">
            <input
              v-model="newFeature"
              @keyup.enter="addFeature"
              type="text"
              placeholder="Escribe una caracteristica..."
              class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-(--secondary-color) outline-none transition-colors"
            />
            <button
              @click="addFeature"
              :disabled="!newFeature.trim()"
              class="px-4 py-2.5 bg-(--secondary-color) text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Suggested features -->
          <div class="mb-4">
            <p class="text-sm text-gray-500 mb-2">Sugerencias rapidas:</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="feature in suggestedFeatures"
                :key="feature.text"
                @click="addSuggestedFeature(feature)"
                :disabled="isFeatureAdded(feature.text)"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all"
                :class="isFeatureAdded(feature.text)
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'"
              >
                <span>{{ feature.icon }}</span>
                <span>{{ feature.text }}</span>
                <svg v-if="isFeatureAdded(feature.text)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Added features list -->
          <div v-if="props.features?.length > 0">
            <p class="text-sm font-medium text-gray-700 mb-2">
              Caracteristicas agregadas ({{ props.features.length }}):
            </p>
            <ul class="space-y-2">
              <li
                v-for="(feature, index) in props.features"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-xl group"
              >
                <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  {{ feature }}
                </span>
                <button
                  @click="removeFeature(index)"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-6 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Agrega al menos una caracteristica</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
