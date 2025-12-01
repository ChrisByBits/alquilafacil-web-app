<script setup>
import { ref, onMounted, computed } from 'vue';
import NavbarComponent from '@/public/components/Navbar.component.vue';
import { useAuthenticationStore } from '@/auth/services/authentication.store';
import { ContractsService } from '../services/contracts.service';
import ContractSigningModalComponent from '../components/ContractSigningModal.component.vue';
import TemplateCardComponent from '../components/TemplateCard.component.vue';
import TemplateEditorComponent from '../components/TemplateEditor.component.vue';
import TemplatePreviewComponent from '../components/TemplatePreview.component.vue';

const authStore = useAuthenticationStore();
const contractsService = new ContractsService();

const currentUserId = computed(() => authStore.currentUserId);
const currentUsername = computed(() => authStore.username || '');
const activeTab = ref('templates');

// Templates
const templates = ref([]);
const isLoadingTemplates = ref(false);
const showTemplateEditor = ref(false);
const editingTemplate = ref(null);
const selectedCategory = ref('all');
const searchQuery = ref('');

// Preview modal
const showPreviewModal = ref(false);
const previewTemplate = ref(null);

// Contract Instances
const contracts = ref([]);
const isLoadingContracts = ref(false);
const contractStatusFilter = ref('all');

// Signing Modal
const showSigningModal = ref(false);
const contractToSign = ref(null);

const categories = [
  { value: 'all', label: 'Todas', icon: '📋' },
  { value: 'standard', label: 'Estandar', icon: '📄' },
  { value: 'short-term', label: 'Corto plazo', icon: '⏱️' },
  { value: 'long-term', label: 'Largo plazo', icon: '📅' },
  { value: 'commercial', label: 'Comercial', icon: '🏢' },
  { value: 'event', label: 'Eventos', icon: '🎉' },
  { value: 'custom', label: 'Personalizado', icon: '✨' }
];

const defaultTemplateContent = `CONTRATO DE ARRENDAMIENTO DE ESPACIO

Entre {{landlordName}}, en adelante "EL ARRENDADOR", y {{tenantName}}, en adelante "EL ARRENDATARIO", se celebra el presente contrato de arrendamiento.

PRIMERA: OBJETO DEL CONTRATO
EL ARRENDADOR cede en arrendamiento a EL ARRENDATARIO el espacio ubicado en {{localAddress}}, para uso temporal.

SEGUNDA: PLAZO
El presente contrato tendra vigencia desde el {{startDate}} hasta el {{endDate}}.

TERCERA: PRECIO
El precio del arrendamiento es de S/ {{totalPrice}} soles.

CUARTA: OBLIGACIONES
Las partes se comprometen a cumplir con las obligaciones establecidas en los terminos y condiciones de la plataforma AlquilaFacil.

Firmado en Lima, a los {{currentDate}}.

_______________________          _______________________
     EL ARRENDADOR                    EL ARRENDATARIO
`;

const filteredTemplates = computed(() => {
  let result = templates.value;

  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(t => (t.category || 'standard') === selectedCategory.value);
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query)
    );
  }

  return result;
});

const filteredContracts = computed(() => {
  if (contractStatusFilter.value === 'all') {
    return contracts.value;
  }
  return contracts.value.filter(c => c.status === contractStatusFilter.value);
});

const templateStats = computed(() => {
  const total = templates.value.length;
  const byCategory = {};
  categories.forEach(cat => {
    if (cat.value !== 'all') {
      byCategory[cat.value] = templates.value.filter(t => (t.category || 'standard') === cat.value).length;
    }
  });
  return { total, byCategory };
});

onMounted(async () => {
  if (currentUserId.value) {
    await Promise.all([loadTemplates(), loadContracts()]);
  }
});

const loadTemplates = async () => {
  isLoadingTemplates.value = true;
  try {
    templates.value = await contractsService.getContractTemplatesByUserId(currentUserId.value);
  } catch (error) {
    console.error('Error loading templates:', error);
  } finally {
    isLoadingTemplates.value = false;
  }
};

const loadContracts = async () => {
  isLoadingContracts.value = true;
  try {
    contracts.value = await contractsService.getContractInstancesByUserId(currentUserId.value);
  } catch (error) {
    console.error('Error loading contracts:', error);
  } finally {
    isLoadingContracts.value = false;
  }
};

const openNewTemplateEditor = () => {
  editingTemplate.value = null;
  showTemplateEditor.value = true;
};

const openEditTemplateEditor = (template) => {
  editingTemplate.value = template;
  showTemplateEditor.value = true;
};

const closeTemplateEditor = () => {
  showTemplateEditor.value = false;
  editingTemplate.value = null;
};

const handleSaveTemplate = async (templateData) => {
  try {
    if (templateData.id) {
      await contractsService.updateContractTemplate(
        templateData.id,
        templateData.title,
        templateData.content,
        templateData.category,
        templateData.isDefault
      );
    } else {
      await contractsService.createContractTemplate(
        templateData.title,
        templateData.content,
        currentUserId.value,
        templateData.category,
        templateData.isDefault
      );
    }
    await loadTemplates();
    closeTemplateEditor();
  } catch (error) {
    console.error('Error saving template:', error);
    alert('Error al guardar la plantilla');
  }
};

const handleDuplicateTemplate = async (template) => {
  try {
    await contractsService.duplicateContractTemplate(template.id);
    await loadTemplates();
  } catch (error) {
    console.error('Error duplicating template:', error);
    alert('Error al duplicar la plantilla');
  }
};

const handleDeleteTemplate = async (template) => {
  if (confirm('¿Estas seguro de eliminar esta plantilla?')) {
    try {
      await contractsService.deleteContractTemplate(template.id);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error al eliminar la plantilla');
    }
  }
};

const handlePreviewTemplate = (template) => {
  previewTemplate.value = template;
  showPreviewModal.value = true;
};

const closePreviewModal = () => {
  showPreviewModal.value = false;
  previewTemplate.value = null;
};

const handleUseTemplate = (template) => {
  // In a real scenario, this would navigate to create a contract using this template
  alert(`Usar plantilla: ${template.title}\n\nEsta funcionalidad se activa al crear una reserva.`);
};

const openSigningModal = (contract) => {
  contractToSign.value = contract;
  showSigningModal.value = true;
};

const closeSigningModal = () => {
  showSigningModal.value = false;
  contractToSign.value = null;
};

const handleContractSigned = async (signatureData) => {
  try {
    await contractsService.signContractWithSignature(signatureData.contractId, signatureData);
    await loadContracts();
    closeSigningModal();
    alert('Contrato firmado exitosamente con firma digital');
  } catch (error) {
    console.error('Error signing contract:', error);
    alert('Error al firmar el contrato');
  }
};

const signContract = async (contractId) => {
  const contract = contracts.value.find(c => c.id === contractId);
  if (contract) {
    openSigningModal(contract);
  }
};

const downloadContract = async (contractId) => {
  try {
    const blob = await contractsService.downloadContractPdf(contractId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-${contractId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading contract:', error);
    alert('Error al descargar el contrato');
  }
};

const cancelContract = async (contractId) => {
  if (confirm('¿Estas seguro de cancelar este contrato?')) {
    try {
      await contractsService.cancelContract(contractId, currentUserId.value);
      await loadContracts();
    } catch (error) {
      console.error('Error canceling contract:', error);
      alert('Error al cancelar el contrato');
    }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Signed': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'Draft': return 'Borrador';
    case 'Pending': return 'Pendiente';
    case 'Signed': return 'Firmado';
    case 'Cancelled': return 'Cancelado';
    default: return status;
  }
};
</script>

<template>
  <NavbarComponent />
  <div class="contracts-page min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Gestion de Contratos</h1>
        <p class="text-gray-600 mt-1">Administra tus plantillas y contratos de arrendamiento</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'templates'"
          class="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
          :class="activeTab === 'templates' ? 'bg-(--secondary-color) text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Mis Plantillas
          <span v-if="templateStats.total > 0" class="px-2 py-0.5 text-xs rounded-full" :class="activeTab === 'templates' ? 'bg-white/20' : 'bg-gray-200'">
            {{ templateStats.total }}
          </span>
        </button>
        <button
          @click="activeTab = 'contracts'"
          class="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
          :class="activeTab === 'contracts' ? 'bg-(--secondary-color) text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Mis Contratos
          <span v-if="contracts.length > 0" class="px-2 py-0.5 text-xs rounded-full" :class="activeTab === 'contracts' ? 'bg-white/20' : 'bg-gray-200'">
            {{ contracts.length }}
          </span>
        </button>
      </div>

      <!-- Templates Tab -->
      <div v-if="activeTab === 'templates'">
        <!-- Toolbar -->
        <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar plantillas..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-(--secondary-color)"
              />
            </div>

            <!-- Category filter -->
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="cat in categories"
                :key="cat.value"
                @click="selectedCategory = cat.value"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  selectedCategory === cat.value
                    ? 'bg-(--secondary-color) text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ cat.icon }} {{ cat.label }}
                <span v-if="cat.value !== 'all' && templateStats.byCategory[cat.value]" class="ml-1 opacity-70">
                  ({{ templateStats.byCategory[cat.value] }})
                </span>
              </button>
            </div>

            <!-- New template button -->
            <button
              @click="openNewTemplateEditor"
              class="px-4 py-2.5 bg-(--secondary-color) text-white rounded-lg hover:opacity-90 flex items-center gap-2 whitespace-nowrap shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Plantilla
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoadingTemplates" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-(--secondary-color)"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="templates.length === 0" class="bg-white rounded-xl p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No tienes plantillas</h3>
          <p class="text-gray-500 mb-6">Crea tu primera plantilla de contrato para empezar</p>
          <button
            @click="openNewTemplateEditor"
            class="px-6 py-3 bg-(--secondary-color) text-white rounded-lg hover:opacity-90"
          >
            Crear mi primera plantilla
          </button>
        </div>

        <!-- No results -->
        <div v-else-if="filteredTemplates.length === 0" class="bg-white rounded-xl p-8 text-center">
          <p class="text-gray-500">No se encontraron plantillas con los filtros seleccionados</p>
        </div>

        <!-- Templates grid -->
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TemplateCardComponent
            v-for="template in filteredTemplates"
            :key="template.id"
            :template="template"
            @edit="openEditTemplateEditor"
            @delete="handleDeleteTemplate"
            @duplicate="handleDuplicateTemplate"
            @preview="handlePreviewTemplate"
            @use="handleUseTemplate"
          />
        </div>
      </div>

      <!-- Contracts Tab -->
      <div v-if="activeTab === 'contracts'">
        <!-- Filter bar -->
        <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="status in ['all', 'Draft', 'Pending', 'Signed', 'Cancelled']"
              :key="status"
              @click="contractStatusFilter = status"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                contractStatusFilter === status
                  ? 'bg-(--secondary-color) text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ status === 'all' ? 'Todos' : getStatusText(status) }}
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoadingContracts" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-(--secondary-color)"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="contracts.length === 0" class="bg-white rounded-xl p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No tienes contratos</h3>
          <p class="text-gray-500">Los contratos se generan automaticamente al crear reservas</p>
        </div>

        <!-- Contracts list -->
        <div v-else class="space-y-4">
          <div
            v-for="contract in filteredContracts"
            :key="contract.id"
            class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold text-gray-800">{{ contract.templateName || 'Contrato #' + contract.id }}</h3>
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(contract.status)]">
                    {{ getStatusText(contract.status) }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Local #{{ contract.localId }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(contract.startDate) }} - {{ formatDate(contract.endDate) }}
                  </span>
                </div>
              </div>

              <!-- Signature info -->
              <div v-if="contract.status === 'Signed' && contract.signatureInfo" class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-green-700">
                  Firmado por {{ contract.signatureInfo?.signerName }}
                </span>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 flex-wrap">
                <button
                  v-if="contract.status === 'Pending' && contract.tenantUserId === currentUserId"
                  @click="signContract(contract.id)"
                  class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Firmar
                </button>
                <button
                  v-if="contract.status === 'Signed'"
                  @click="downloadContract(contract.id)"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </button>
                <button
                  v-if="contract.status !== 'Signed' && contract.status !== 'Cancelled'"
                  @click="cancelContract(contract.id)"
                  class="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Editor Modal -->
    <TemplateEditorComponent
      :visible="showTemplateEditor"
      :template="editingTemplate"
      :default-content="defaultTemplateContent"
      @close="closeTemplateEditor"
      @save="handleSaveTemplate"
    />

    <!-- Preview Modal -->
    <Teleport to="body">
      <div
        v-if="showPreviewModal && previewTemplate"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closePreviewModal"
      >
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 class="text-xl font-semibold text-gray-800">{{ previewTemplate.title }}</h2>
              <p class="text-sm text-gray-500">Vista previa de la plantilla</p>
            </div>
            <button
              @click="closePreviewModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            <TemplatePreviewComponent :content="previewTemplate.content" :show-variables="true" />
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              @click="closePreviewModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              @click="openEditTemplateEditor(previewTemplate); closePreviewModal()"
              class="px-4 py-2 bg-(--secondary-color) text-white rounded-lg hover:opacity-90"
            >
              Editar plantilla
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Signing Modal -->
    <ContractSigningModalComponent
      :visible="showSigningModal"
      :contract="contractToSign"
      :signer-name="currentUsername"
      @close="closeSigningModal"
      @sign="handleContractSigned"
    />
  </div>
</template>
