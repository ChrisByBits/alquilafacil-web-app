<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  sampleData: {
    type: Object,
    default: () => ({
      landlordName: 'Juan Perez',
      tenantName: 'Maria Garcia',
      localAddress: 'Av. Principal 123, Lima',
      startDate: '01/01/2025',
      endDate: '31/12/2025',
      totalPrice: '1,500.00',
      currentDate: new Date().toLocaleDateString('es-PE')
    })
  },
  showVariables: {
    type: Boolean,
    default: true
  }
});

const extractedVariables = computed(() => {
  if (!props.content) return [];
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set();
  let match;
  while ((match = regex.exec(props.content)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
});

const highlightedContent = computed(() => {
  if (!props.content) return '';
  return props.content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return `<span class="variable-highlight" data-variable="${variable}">${match}</span>`;
  });
});

const previewContent = computed(() => {
  if (!props.content) return '';
  let result = props.content;
  for (const [key, value] of Object.entries(props.sampleData)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
});

const getVariableDescription = (variable) => {
  const descriptions = {
    landlordName: 'Nombre del arrendador',
    tenantName: 'Nombre del arrendatario',
    localAddress: 'Direccion del local',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    totalPrice: 'Precio total',
    currentDate: 'Fecha actual',
    localName: 'Nombre del local',
    reservationId: 'ID de la reserva',
    duration: 'Duracion del alquiler'
  };
  return descriptions[variable] || 'Variable personalizada';
};

const formatVariable = (name) => {
  return `\{\{${name}\}\}`;
};
</script>

<template>
  <div class="template-preview">
    <!-- Variables panel -->
    <div v-if="showVariables && extractedVariables.length > 0" class="mb-4 p-4 bg-blue-50 rounded-lg">
      <h4 class="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Variables detectadas ({{ extractedVariables.length }})
      </h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="variable in extractedVariables"
          :key="variable"
          class="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-blue-200"
        >
          <code class="text-blue-600 font-mono">{{formatVariable(variable)}}</code>
          <span class="text-gray-500">- {{ getVariableDescription(variable) }}</span>
        </div>
      </div>
    </div>

    <!-- Preview content -->
    <div class="preview-content bg-white border border-gray-200 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed">
      <div v-html="highlightedContent"></div>
    </div>
  </div>
</template>

<style scoped>
:deep(.variable-highlight) {
  background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%);
  padding: 2px 6px;
  border-radius: 4px;
  color: #92400e;
  font-weight: 600;
  border: 1px dashed #f59e0b;
}
</style>
