<script setup>
import { ref, computed } from 'vue';
import NavbarComponent from '@/public/components/Navbar.component.vue'
import Step1Component from '../components/publish-steps/Step1.component.vue';
import Step3Component from '../components/publish-steps/Step3.component.vue';
import Step4Component from '../components/publish-steps/Step4.component.vue';
import Step6Component from '../components/publish-steps/Step6.component.vue';
import Step7Component from '../components/publish-steps/Step7.component.vue';
import Step9Component from '../components/publish-steps/Step9.component.vue';
import Step8ContractComponent from '../components/publish-steps/Step8Contract.component.vue';
import Step10Component from '../components/publish-steps/Step10.component.vue';
import { LocalsApiService } from '../services/locals-api.service';
import { useRouter } from 'vue-router';
import { LocalRequest } from '../model/local.request';
import { LocalResponse } from '../model/local.response';
import { useAuthenticationStore } from '../../auth/services/authentication.store';
import FooterComponent from '../../public/components/Footer.component.vue';

const router = useRouter();
const authenticationStore = useAuthenticationStore();
const isPublishing = ref(false);

const localData = ref({
  localName: '',
  descriptionMessage: '',
  country: '',
  city: '',
  district: '',
  street: '',
  latitude: null,
  longitude: null,
  price: 0,
  capacity: '',
  photoUrls: [],
  features: [],
  localCategoryId: null,
  userId: '',
  contractTemplateId: null,
  contractContent: '',
});

const pageNumber = ref(1);
const totalSteps = 8;

// Step definitions - 8 steps including contract
const steps = [
  { number: 1, label: 'Inicio', icon: '🏠' },
  { number: 2, label: 'Categoria', icon: '📁' },
  { number: 3, label: 'Ubicacion', icon: '📍' },
  { number: 4, label: 'Fotos', icon: '📸' },
  { number: 5, label: 'Detalles', icon: '✏️' },
  { number: 6, label: 'Precio', icon: '💵' },
  { number: 7, label: 'Contrato', icon: '📄' },
  { number: 8, label: 'Publicar', icon: '🚀' }
];

// Validation for each step
const stepValidation = computed(() => {
  return {
    1: true, // Intro
    2: !!localData.value.localCategoryId,
    3: localData.value.country?.length >= 3 &&
       localData.value.city?.length >= 3 &&
       localData.value.district?.length >= 3 &&
       localData.value.street?.length >= 5,
    4: localData.value.photoUrls?.length >= 3,
    5: localData.value.localName?.length >= 5 &&
       localData.value.descriptionMessage?.length >= 20 &&
       localData.value.capacity > 0 &&
       localData.value.features?.length > 0,
    6: localData.value.price > 0 && localData.value.price <= 10000,
    7: true, // Contract - always valid (default contract is used if none selected)
    8: true // Preview
  };
});

const isCurrentStepValid = computed(() => {
  return stepValidation.value[pageNumber.value];
});

const isFormComplete = computed(() => {
  return localData.value.localName &&
         localData.value.descriptionMessage?.length >= 20 &&
         localData.value.country &&
         localData.value.city &&
         localData.value.district &&
         localData.value.street &&
         localData.value.price > 0 &&
         localData.value.capacity > 0 &&
         localData.value.photoUrls?.length >= 3 &&
         localData.value.features?.length > 0 &&
         localData.value.localCategoryId;
});

const progressPercentage = computed(() => {
  return Math.round((pageNumber.value / totalSteps) * 100);
});

const changePage = (number) => {
  const nextPage = pageNumber.value + number;
  if (nextPage > 0 && nextPage <= totalSteps) {
    pageNumber.value = nextPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const goToStep = (stepNumber) => {
  if (stepNumber <= pageNumber.value || stepNumber === pageNumber.value + 1) {
    pageNumber.value = stepNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const publishLocal = async () => {
  if (!isFormComplete.value || isPublishing.value) return;

  isPublishing.value = true;
  localData.value.userId = authenticationStore.userId;

  const localsApiService = new LocalsApiService();
  const localRequest = new LocalRequest(localData.value);

  try {
    const response = await localsApiService.create(localRequest);
    const localResponse = new LocalResponse(response);
    router.push(`/local/${localResponse.id}`);
  } catch (error) {
    console.error('Error al publicar el local:', error);
    router.push('/error');
  } finally {
    isPublishing.value = false;
  }
};

const getStepStatus = (stepNumber) => {
  if (stepNumber < pageNumber.value) {
    return stepValidation.value[stepNumber] ? 'completed' : 'incomplete';
  }
  if (stepNumber === pageNumber.value) return 'current';
  return 'pending';
};
</script>

<template>
  <NavbarComponent />

  <main class="min-h-screen bg-gray-50">
    <!-- Content -->
    <div class="pt-8 pb-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Progress bar (inline, not sticky) -->
        <div class="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <!-- Mobile progress -->
          <div class="md:hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-600">
                Paso {{ pageNumber }} de {{ totalSteps }}
              </span>
              <span class="text-sm font-semibold text-(--secondary-color)">
                {{ progressPercentage }}%
              </span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-(--primary-color) to-(--secondary-color) transition-all duration-500"
                :style="{ width: `${progressPercentage}%` }"
              />
            </div>
          </div>

          <!-- Desktop step indicator -->
          <div class="hidden md:flex items-center justify-between">
            <div class="flex items-center gap-1">
              <template v-for="(step, index) in steps" :key="step.number">
                <!-- Step indicator -->
                <button
                  @click="goToStep(step.number)"
                  class="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
                  :class="{
                    'bg-(--secondary-color) text-white': step.number === pageNumber,
                    'bg-green-100 text-green-700 hover:bg-green-200': getStepStatus(step.number) === 'completed',
                    'bg-orange-100 text-orange-700 hover:bg-orange-200': getStepStatus(step.number) === 'incomplete',
                    'bg-gray-100 text-gray-400 cursor-not-allowed': getStepStatus(step.number) === 'pending',
                    'cursor-pointer': step.number <= pageNumber
                  }"
                  :disabled="step.number > pageNumber + 1"
                >
                  <span class="text-sm">{{ step.icon }}</span>
                  <span class="text-xs font-medium hidden lg:inline">{{ step.label }}</span>
                </button>

                <!-- Connector line -->
                <div
                  v-if="index < steps.length - 1"
                  class="w-4 h-0.5 mx-0.5"
                  :class="step.number < pageNumber ? 'bg-green-400' : 'bg-gray-300'"
                />
              </template>
            </div>

            <span class="text-sm font-medium text-gray-500">
              {{ progressPercentage }}% completado
            </span>
          </div>
        </div>
        <!-- Step content -->
        <Transition name="fade" mode="out-in">
          <div :key="pageNumber">
            <Step1Component v-if="pageNumber === 1" />
            <Step3Component v-if="pageNumber === 2" v-model:localCategoryId="localData.localCategoryId" />
            <Step4Component
              v-if="pageNumber === 3"
              v-model:country="localData.country"
              v-model:city="localData.city"
              v-model:district="localData.district"
              v-model:street="localData.street"
              v-model:latitude="localData.latitude"
              v-model:longitude="localData.longitude"
            />
            <Step6Component v-if="pageNumber === 4" v-model:photoUrls="localData.photoUrls" />
            <Step7Component
              v-if="pageNumber === 5"
              v-model:localName="localData.localName"
              v-model:descriptionMessage="localData.descriptionMessage"
              v-model:capacity="localData.capacity"
              v-model:features="localData.features"
            />
            <Step9Component v-if="pageNumber === 6" v-model:price="localData.price" />
            <Step8ContractComponent
              v-if="pageNumber === 7"
              v-model:selectedTemplateId="localData.contractTemplateId"
              v-model:customContent="localData.contractContent"
            />
            <Step10Component v-if="pageNumber === 8" :localData="localData" />
          </div>
        </Transition>

        <!-- Navigation buttons (inline, not fixed) -->
        <div class="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <!-- Back button -->
            <button
              v-if="pageNumber > 1"
              @click="changePage(-1)"
              class="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="hidden sm:inline">Atras</span>
            </button>
            <div v-else></div>

            <!-- Step indicator (mobile) -->
            <div class="md:hidden text-center">
              <span class="text-sm text-gray-500">{{ steps[pageNumber - 1]?.label }}</span>
            </div>

            <!-- Next/Publish button -->
            <div>
              <!-- Start button (step 1) -->
              <button
                v-if="pageNumber === 1"
                @click="changePage(1)"
                class="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-(--primary-color) to-(--secondary-color) text-white font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                Comencemos
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Next button (steps 2-7) -->
              <button
                v-else-if="pageNumber < 8"
                @click="changePage(1)"
                :disabled="!isCurrentStepValid"
                class="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all"
                :class="isCurrentStepValid
                  ? 'bg-gradient-to-r from-(--primary-color) to-(--secondary-color) text-white hover:opacity-90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              >
                <span>Siguiente</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Publish button (step 8) -->
              <button
                v-else
                @click="publishLocal"
                :disabled="!isFormComplete || isPublishing"
                class="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all"
                :class="isFormComplete && !isPublishing
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              >
                <template v-if="isPublishing">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Publicando...</span>
                </template>
                <template v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Publicar local</span>
                </template>
              </button>
            </div>
          </div>

          <!-- Validation message -->
          <div
            v-if="!isCurrentStepValid && pageNumber > 1 && pageNumber < 8"
            class="mt-3 text-center text-sm text-orange-600"
          >
            Completa los campos requeridos para continuar
          </div>
        </div>
      </div>
    </div>
  </main>

  <FooterComponent />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
