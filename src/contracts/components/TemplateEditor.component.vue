<script setup>
import { ref, computed, watch } from 'vue';
import TemplatePreviewComponent from './TemplatePreview.component.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  template: {
    type: Object,
    default: null
  },
  defaultContent: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'save']);

const activeTab = ref('edit');
const title = ref('');
const content = ref('');
const category = ref('standard');
const isDefault = ref(false);
const textareaRef = ref(null);

const categories = [
  { value: 'standard', label: 'Estandar', icon: '📄' },
  { value: 'short-term', label: 'Corto plazo', icon: '⏱️' },
  { value: 'long-term', label: 'Largo plazo', icon: '📅' },
  { value: 'commercial', label: 'Comercial', icon: '🏢' },
  { value: 'event', label: 'Eventos', icon: '🎉' },
  { value: 'custom', label: 'Personalizado', icon: '✨' }
];

const availableVariables = [
  { name: 'landlordName', description: 'Nombre del arrendador' },
  { name: 'tenantName', description: 'Nombre del arrendatario' },
  { name: 'localName', description: 'Nombre del local' },
  { name: 'localAddress', description: 'Direccion del local' },
  { name: 'startDate', description: 'Fecha de inicio' },
  { name: 'endDate', description: 'Fecha de fin' },
  { name: 'totalPrice', description: 'Precio total' },
  { name: 'currentDate', description: 'Fecha actual' },
  { name: 'reservationId', description: 'ID de la reserva' },
  { name: 'duration', description: 'Duracion del alquiler' }
];

const formatVariable = (name) => {
  return `\{\{${name}\}\}`;
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.template) {
      title.value = props.template.title || '';
      content.value = props.template.content || '';
      category.value = props.template.category || 'standard';
      isDefault.value = props.template.isDefault || false;
    } else {
      title.value = '';
      content.value = props.defaultContent;
      category.value = 'standard';
      isDefault.value = false;
    }
    activeTab.value = 'edit';
  }
});

const isEditing = computed(() => !!props.template);
const modalTitle = computed(() => isEditing.value ? 'Editar Plantilla' : 'Nueva Plantilla');

const isValid = computed(() => {
  return title.value.trim().length > 0 && content.value.trim().length > 0;
});

const insertVariable = (variableName) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = content.value;
  const variable = `{{${variableName}}}`;

  content.value = text.substring(0, start) + variable + text.substring(end);

  // Restore cursor position
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + variable.length, start + variable.length);
  }, 0);
};

const handleSave = () => {
  if (!isValid.value) return;

  emit('save', {
    id: props.template?.id,
    title: title.value.trim(),
    content: content.value.trim(),
    category: category.value,
    isDefault: isDefault.value
  });
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ modalTitle }}</h2>
            <p class="text-sm text-gray-500 mt-0.5">Crea contratos personalizados con variables dinamicas</p>
          </div>
          <button
            @click="handleClose"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 px-6 py-2 border-b border-gray-200 bg-gray-50">
          <button
            @click="activeTab = 'edit'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'edit'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </span>
          </button>
          <button
            @click="activeTab = 'preview'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'preview'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vista previa
            </span>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Edit tab -->
          <div v-if="activeTab === 'edit'" class="flex h-full">
            <!-- Main form -->
            <div class="flex-1 p-6 space-y-4 overflow-y-auto">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Titulo de la plantilla *
                </label>
                <input
                  v-model="title"
                  type="text"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-(--secondary-color) focus:ring-1 focus:ring-(--secondary-color)"
                  placeholder="Ej: Contrato de arrendamiento estandar"
                />
              </div>

              <!-- Category and default -->
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    v-model="category"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-(--secondary-color) bg-white"
                  >
                    <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                      {{ cat.icon }} {{ cat.label }}
                    </option>
                  </select>
                </div>
                <div class="flex items-end">
                  <label class="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      v-model="isDefault"
                      type="checkbox"
                      class="w-4 h-4 rounded text-(--secondary-color) focus:ring-(--secondary-color)"
                    />
                    <span class="text-sm text-gray-700">Predeterminada</span>
                  </label>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contenido del contrato *
                </label>
                <textarea
                  ref="textareaRef"
                  v-model="content"
                  rows="18"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-(--secondary-color) font-mono text-sm resize-none"
                  placeholder="Escribe el contenido del contrato..."
                ></textarea>
              </div>
            </div>

            <!-- Variables sidebar -->
            <div class="w-64 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
              <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Variables disponibles
              </h3>
              <p class="text-xs text-gray-500 mb-4">
                Haz clic en una variable para insertarla en el documento
              </p>

              <div class="space-y-2">
                <button
                  v-for="variable in availableVariables"
                  :key="variable.name"
                  @click="insertVariable(variable.name)"
                  class="w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
                >
                  <code class="text-xs font-mono text-blue-600 group-hover:text-blue-700">
                    {{formatVariable(variable.name)}}
                  </code>
                  <p class="text-xs text-gray-500 mt-0.5">{{ variable.description }}</p>
                </button>
              </div>

              <!-- Tips -->
              <div class="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 class="text-xs font-semibold text-blue-800 mb-2">Consejos</h4>
                <ul class="text-xs text-blue-700 space-y-1">
                  <li>- Las variables se reemplazan automaticamente al generar el contrato</li>
                  <li>- Puedes crear variables personalizadas usando el formato {{formatVariable('nombre')}}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Preview tab -->
          <div v-if="activeTab === 'preview'" class="p-6">
            <TemplatePreviewComponent
              :content="content"
              :show-variables="true"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-500">
            <span v-if="content">{{ content.split(/\s+/).filter(w => w).length }} palabras</span>
          </p>
          <div class="flex gap-3">
            <button
              @click="handleClose"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleSave"
              :disabled="!isValid"
              class="px-6 py-2 bg-(--secondary-color) text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ isEditing ? 'Guardar cambios' : 'Crear plantilla' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
