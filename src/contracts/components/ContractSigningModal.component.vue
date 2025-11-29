<script setup>
import { ref, computed, watch } from 'vue';
import SignatureCanvasComponent from './SignatureCanvas.component.vue';

const props = defineProps({
  visible: Boolean,
  contract: Object,
  signerName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'sign']);

const signatureCanvas = ref(null);
const acceptedTerms = ref(false);
const signerFullName = ref('');
const signatureData = ref(null);
const currentStep = ref(1);
const isSubmitting = ref(false);

watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm();
    signerFullName.value = props.signerName;
  }
});

const resetForm = () => {
  acceptedTerms.value = false;
  signerFullName.value = '';
  signatureData.value = null;
  currentStep.value = 1;
  isSubmitting.value = false;
};

const canProceedStep1 = computed(() => {
  return signerFullName.value.trim().length >= 3;
});

const canProceedStep2 = computed(() => {
  return acceptedTerms.value;
});

const canSign = computed(() => {
  return signatureData.value !== null;
});

const goToStep = (step) => {
  currentStep.value = step;
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const handleSignatureCaptured = (data) => {
  signatureData.value = data;
};

const handleSignatureCleared = () => {
  signatureData.value = null;
};

const submitSignature = async () => {
  if (!canSign.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    emit('sign', {
      contractId: props.contract?.id,
      signerName: signerFullName.value,
      signatureImage: signatureData.value,
      acceptedTerms: acceptedTerms.value,
      signedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error signing contract:', error);
    isSubmitting.value = false;
  }
};

const close = () => {
  resetForm();
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-800">Firma Digital de Contrato</h2>
              <p class="text-sm text-gray-500 mt-1">Paso {{ currentStep }} de 3</p>
            </div>
            <button
              @click="close"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="flex gap-2 mt-4">
            <div
              v-for="step in 3"
              :key="step"
              class="flex-1 h-2 rounded-full transition-colors"
              :class="step <= currentStep ? 'bg-(--primary-color)' : 'bg-gray-200'"
            ></div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Step 1: Identity verification -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Verificacion de identidad</h3>
              <p class="text-sm text-gray-500">Confirma tu nombre completo para proceder</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre completo del firmante</label>
              <input
                v-model="signerFullName"
                type="text"
                placeholder="Ingresa tu nombre completo"
                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent text-lg"
              />
              <p class="text-xs text-gray-400 mt-2">Este nombre aparecera en el documento firmado</p>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="text-sm text-yellow-800 font-medium">Importante</p>
                  <p class="text-xs text-yellow-700 mt-1">Al firmar este contrato, aceptas que la firma digital tiene la misma validez legal que una firma manuscrita.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Terms acceptance -->
          <div v-if="currentStep === 2" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Revision del contrato</h3>
              <p class="text-sm text-gray-500">Lee y acepta los terminos del contrato</p>
            </div>

            <!-- Contract preview -->
            <div class="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
              <div class="prose prose-sm max-w-none">
                <pre class="whitespace-pre-wrap text-xs text-gray-700 font-sans">{{ contract?.content || 'Contenido del contrato no disponible' }}</pre>
              </div>
            </div>

            <!-- Terms checkbox -->
            <label class="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-(--primary-color) transition-colors">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                class="mt-1 h-5 w-5 text-(--primary-color) rounded focus:ring-(--primary-color)"
              />
              <div>
                <p class="text-sm font-medium text-gray-800">Acepto los terminos y condiciones</p>
                <p class="text-xs text-gray-500 mt-1">He leido el contrato completo y acepto todas las clausulas establecidas en el mismo.</p>
              </div>
            </label>
          </div>

          <!-- Step 3: Signature -->
          <div v-if="currentStep === 3" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Firma el contrato</h3>
              <p class="text-sm text-gray-500">Dibuja tu firma en el recuadro</p>
            </div>

            <!-- Signer info -->
            <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <div class="w-10 h-10 bg-(--primary-color) rounded-full flex items-center justify-center text-white font-bold">
                {{ signerFullName.substring(0, 2).toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ signerFullName }}</p>
                <p class="text-xs text-gray-500">Firmante</p>
              </div>
            </div>

            <!-- Signature canvas -->
            <SignatureCanvasComponent
              ref="signatureCanvas"
              @signature-captured="handleSignatureCaptured"
              @signature-cleared="handleSignatureCleared"
            />

            <!-- Signature preview if captured -->
            <div v-if="signatureData" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-green-800">Firma lista para enviar</span>
              </div>
              <p class="text-xs text-green-700">Tu firma ha sido capturada correctamente. Haz clic en "Firmar contrato" para completar el proceso.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 flex justify-between">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Atras
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <button
              @click="close"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <!-- Step 1 next -->
            <button
              v-if="currentStep === 1"
              @click="nextStep"
              :disabled="!canProceedStep1"
              class="px-6 py-2 bg-(--primary-color) text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continuar
            </button>

            <!-- Step 2 next -->
            <button
              v-if="currentStep === 2"
              @click="nextStep"
              :disabled="!canProceedStep2"
              class="px-6 py-2 bg-(--primary-color) text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continuar
            </button>

            <!-- Step 3 sign -->
            <button
              v-if="currentStep === 3"
              @click="submitSignature"
              :disabled="!canSign || isSubmitting"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ isSubmitting ? 'Firmando...' : 'Firmar contrato' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
