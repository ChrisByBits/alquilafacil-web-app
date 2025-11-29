<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    default: 10
  },
  stepValidation: {
    type: Object,
    default: () => ({})
  }
});

const steps = [
  { number: 1, label: 'Inicio', icon: '🏠', section: 1 },
  { number: 2, label: 'Describe', icon: '📝', section: 1 },
  { number: 3, label: 'Categoria', icon: '📂', section: 1 },
  { number: 4, label: 'Ubicacion', icon: '📍', section: 1 },
  { number: 5, label: 'Destaca', icon: '✨', section: 2 },
  { number: 6, label: 'Fotos', icon: '📷', section: 2 },
  { number: 7, label: 'Detalles', icon: '📋', section: 2 },
  { number: 8, label: 'Precio', icon: '💰', section: 3 },
  { number: 9, label: 'Tarifa', icon: '🏷️', section: 3 },
  { number: 10, label: 'Publicar', icon: '🚀', section: 3 }
];

const sections = [
  { id: 1, label: 'Describe tu espacio', steps: [1, 2, 3, 4] },
  { id: 2, label: 'Haz que destaque', steps: [5, 6, 7] },
  { id: 3, label: 'Publicar', steps: [8, 9, 10] }
];

const currentSection = computed(() => {
  const step = steps.find(s => s.number === props.currentStep);
  return step?.section || 1;
});

const sectionProgress = computed(() => {
  const section = sections.find(s => s.id === currentSection.value);
  if (!section) return 0;

  const stepsInSection = section.steps;
  const currentIndexInSection = stepsInSection.indexOf(props.currentStep);

  if (currentIndexInSection === -1) return 0;
  return ((currentIndexInSection + 1) / stepsInSection.length) * 100;
});

const overallProgress = computed(() => {
  return Math.round((props.currentStep / props.totalSteps) * 100);
});

const getStepStatus = (stepNumber) => {
  if (stepNumber < props.currentStep) return 'completed';
  if (stepNumber === props.currentStep) return 'current';
  return 'pending';
};

const isSectionActive = (sectionId) => {
  return currentSection.value === sectionId;
};

const isSectionCompleted = (sectionId) => {
  const section = sections.find(s => s.id === sectionId);
  if (!section) return false;
  return props.currentStep > Math.max(...section.steps);
};
</script>

<template>
  <div class="wizard-progress w-full">
    <!-- Mobile Progress Bar -->
    <div class="md:hidden mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-600">Paso {{ currentStep }} de {{ totalSteps }}</span>
        <span class="text-sm font-semibold text-(--secondary-color)">{{ overallProgress }}%</span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-(--primary-color) to-(--secondary-color) transition-all duration-500 ease-out"
          :style="{ width: `${overallProgress}%` }"
        />
      </div>
    </div>

    <!-- Desktop Progress Sections -->
    <div class="hidden md:block mb-8">
      <div class="flex items-center justify-between gap-4">
        <div
          v-for="(section, index) in sections"
          :key="section.id"
          class="flex-1"
        >
          <div class="flex items-center">
            <!-- Section indicator -->
            <div
              class="flex items-center gap-3 flex-1 p-4 rounded-xl transition-all duration-300"
              :class="{
                'bg-(--secondary-color) text-white shadow-lg': isSectionActive(section.id),
                'bg-green-100 text-green-800': isSectionCompleted(section.id),
                'bg-gray-100 text-gray-500': !isSectionActive(section.id) && !isSectionCompleted(section.id)
              }"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                :class="{
                  'bg-white/20': isSectionActive(section.id),
                  'bg-green-500 text-white': isSectionCompleted(section.id),
                  'bg-gray-300': !isSectionActive(section.id) && !isSectionCompleted(section.id)
                }"
              >
                <svg v-if="isSectionCompleted(section.id)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else>{{ section.id }}</span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-sm">{{ section.label }}</p>
                <p class="text-xs opacity-75">{{ section.steps.length }} pasos</p>
              </div>
            </div>

            <!-- Connector -->
            <div
              v-if="index < sections.length - 1"
              class="w-8 h-1 mx-2"
              :class="isSectionCompleted(section.id) ? 'bg-green-400' : 'bg-gray-200'"
            />
          </div>

          <!-- Section progress bar -->
          <div
            v-if="isSectionActive(section.id)"
            class="mt-2 mx-4"
          >
            <div class="h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                class="h-full bg-white transition-all duration-300"
                :style="{ width: `${sectionProgress}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Step Info -->
    <div class="text-center mb-4">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
        <span class="text-2xl">{{ steps[currentStep - 1]?.icon }}</span>
        <span class="font-medium text-gray-700">{{ steps[currentStep - 1]?.label }}</span>
      </div>
    </div>
  </div>
</template>
