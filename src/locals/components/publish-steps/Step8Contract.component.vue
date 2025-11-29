<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthenticationStore } from '@/auth/services/authentication.store';
import { ContractsService } from '@/contracts/services/contracts.service';

const props = defineProps({
  selectedTemplateId: {
    type: Number,
    default: null
  },
  customContent: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:selectedTemplateId', 'update:customContent']);

const authStore = useAuthenticationStore();
const contractsService = new ContractsService();

const templates = ref([]);
const isLoading = ref(true);
const useCustomContract = ref(false);
const showPreview = ref(false);

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

const customContractContent = ref(props.customContent || defaultContractContent);

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

const selectedTemplate = computed(() => {
  if (props.selectedTemplateId) {
    return templates.value.find(t => t.id === props.selectedTemplateId);
  }
  return null;
});

const previewContent = computed(() => {
  if (useCustomContract.value) {
    return customContractContent.value;
  }
  return selectedTemplate.value?.content || defaultContractContent;
});

const previewWithSampleData = computed(() => {
  let content = previewContent.value;
  const sampleData = {
    landlordName: 'Juan Perez',
    tenantName: 'Maria Garcia',
    localName: 'Salon de Eventos Premium',
    localAddress: 'Av. Principal 123, Lima',
    startDate: '15/12/2024 10:00',
    endDate: '15/12/2024 22:00',
    totalPrice: '500.00',
    currentDate: new Date().toLocaleDateString('es-PE'),
    reservationId: 'RES-12345',
    duration: '12 horas'
  };

  Object.entries(sampleData).forEach(([key, value]) => {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  return content;
});

onMounted(async () => {
  try {
    const userTemplates = await contractsService.getContractTemplatesByUserId(authStore.userId);
    templates.value = userTemplates;

    // Si tiene un template por defecto, seleccionarlo
    const defaultTemplate = userTemplates.find(t => t.isDefault);
    if (defaultTemplate && !props.selectedTemplateId) {
      emit('update:selectedTemplateId', defaultTemplate.id);
    }
  } catch (error) {
    console.log('No se encontraron plantillas previas');
  } finally {
    isLoading.value = false;
  }
});

const selectTemplate = (templateId) => {
  emit('update:selectedTemplateId', templateId);
  useCustomContract.value = false;
};

const selectCustomContract = () => {
  emit('update:selectedTemplateId', null);
  useCustomContract.value = true;
};

const updateCustomContent = () => {
  emit('update:customContent', customContractContent.value);
};

const insertVariable = (variableName) => {
  const textarea = document.getElementById('customContractTextarea');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = customContractContent.value;
  const variable = `{{${variableName}}}`;

  customContractContent.value = text.substring(0, start) + variable + text.substring(end);
  updateCustomContent();

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + variable.length, start + variable.length);
  }, 0);
};

const useDefaultTemplate = () => {
  customContractContent.value = defaultContractContent;
  updateCustomContent();
};
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Contrato de arrendamiento</h2>
      <p class="text-gray-500 max-w-xl mx-auto">
        Personaliza el contrato que los inquilinos deberan firmar al reservar tu local.
        Puedes usar una plantilla existente o crear una personalizada.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
    </div>

    <div v-else class="grid lg:grid-cols-2 gap-6">
      <!-- Left: Template selection -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-700">Selecciona una opcion:</h3>

        <!-- Default contract option -->
        <div
          @click="selectCustomContract(); useDefaultTemplate()"
          class="p-4 border-2 rounded-xl cursor-pointer transition-all"
          :class="useCustomContract && customContractContent === defaultContractContent
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300'"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">Contrato estandar AlquilaFacil</p>
              <p class="text-sm text-gray-500">Plantilla predeterminada con clausulas basicas</p>
            </div>
          </div>
        </div>

        <!-- User's saved templates -->
        <div v-if="templates.length > 0" class="space-y-3">
          <p class="text-sm font-medium text-gray-600">Tus plantillas guardadas:</p>
          <div
            v-for="template in templates"
            :key="template.id"
            @click="selectTemplate(template.id)"
            class="p-4 border-2 rounded-xl cursor-pointer transition-all"
            :class="selectedTemplateId === template.id && !useCustomContract
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ template.title }}</p>
                  <p class="text-xs text-gray-500">{{ template.category || 'Personalizado' }}</p>
                </div>
              </div>
              <span v-if="template.isDefault" class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Predeterminada
              </span>
            </div>
          </div>
        </div>

        <!-- Custom contract option -->
        <div
          @click="selectCustomContract"
          class="p-4 border-2 rounded-xl cursor-pointer transition-all"
          :class="useCustomContract && customContractContent !== defaultContractContent
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300'"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">Crear contrato personalizado</p>
              <p class="text-sm text-gray-500">Escribe tu propio contrato con variables dinamicas</p>
            </div>
          </div>
        </div>

        <!-- Custom contract editor -->
        <div v-if="useCustomContract" class="mt-4 space-y-4">
          <!-- Variables panel -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Variables disponibles (clic para insertar):</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="variable in availableVariables"
                :key="variable.name"
                @click="insertVariable(variable.name)"
                class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:border-purple-400 hover:bg-purple-50 transition-colors"
                :title="variable.description"
              >
                <code class="text-purple-600">{{formatVariable(variable.name)}}</code>
              </button>
            </div>
          </div>

          <!-- Textarea -->
          <textarea
            id="customContractTextarea"
            v-model="customContractContent"
            @input="updateCustomContent"
            rows="12"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
            placeholder="Escribe el contenido de tu contrato..."
          ></textarea>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-700">Vista previa:</h3>
          <button
            @click="showPreview = !showPreview"
            class="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ showPreview ? 'Ver variables' : 'Ver con datos de ejemplo' }}
          </button>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6 max-h-[600px] overflow-y-auto shadow-inner">
          <pre class="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{{ showPreview ? previewWithSampleData : previewContent }}</pre>
        </div>

        <!-- Info box -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-800">Como funciona</p>
              <p class="text-xs text-blue-700 mt-1">
                Las variables como <code class="bg-blue-100 px-1 rounded">{{formatVariable('tenantName')}}</code> se reemplazaran
                automaticamente con los datos reales cuando el inquilino realice la reserva.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
