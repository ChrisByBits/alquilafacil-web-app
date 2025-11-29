<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import AvailabilityCalendarComponent from './AvailabilityCalendar.component.vue';
import { AvailabilityService } from '../services/availability.service';
import { ReservationsApiService } from '@/booking/services/reservations-api.service';

const props = defineProps({
  localId: {
    type: [Number, String],
    required: true
  },
  ownerId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['availability-updated']);

const availabilityService = new AvailabilityService();
const reservationsApiService = new ReservationsApiService();

const isLoading = ref(true);
const calendar = ref(null);
const blockedDates = ref([]);
const reservedDates = ref([]);
const rules = ref([]);
const selectedDatesToBlock = ref([]);
const blockReason = ref('');
const activeTab = ref('calendar');
const showAddRuleModal = ref(false);

// Rule form
const ruleForm = ref({
  dayOfWeek: null,
  startTime: '09:00',
  endTime: '18:00',
  isRecurring: true
});

const daysOfWeekOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miercoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sabado' }
];

const blockedDateStrings = computed(() => {
  return blockedDates.value.map(d => d.date || d);
});

onMounted(async () => {
  await loadCalendar();
});

const loadCalendar = async () => {
  isLoading.value = true;
  try {
    calendar.value = await availabilityService.getCalendarByLocalId(props.localId);
    if (calendar.value) {
      await loadBlockedDates();
      await loadRules();
    }
    await loadReservations();
  } catch (error) {
    console.error('Error loading availability calendar:', error);
    // Calendar might not exist yet, that's okay
  } finally {
    isLoading.value = false;
  }
};

const loadReservations = async () => {
  try {
    const allReservations = await reservationsApiService.getByOwnerId(props.ownerId);
    // Filter reservations for this specific local and extract dates
    const localReservations = allReservations.filter(r => r.localId === parseInt(props.localId));

    // Convert reservations to date strings for the calendar
    const dates = [];
    localReservations.forEach(reservation => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);

      // Add all dates in the reservation range
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    reservedDates.value = [...new Set(dates)]; // Remove duplicates
  } catch (error) {
    console.error('Error loading reservations:', error);
    reservedDates.value = [];
  }
};

const createCalendar = async () => {
  try {
    calendar.value = await availabilityService.createCalendar(props.localId, props.ownerId);
    emit('availability-updated');
  } catch (error) {
    console.error('Error creating calendar:', error);
    alert('Error al crear el calendario de disponibilidad');
  }
};

const loadBlockedDates = async () => {
  if (!calendar.value) return;
  try {
    blockedDates.value = await availabilityService.getBlockedDates(calendar.value.id);
  } catch (error) {
    console.error('Error loading blocked dates:', error);
  }
};

const loadRules = async () => {
  if (!calendar.value) return;
  try {
    rules.value = await availabilityService.getAvailabilityRules(calendar.value.id);
  } catch (error) {
    console.error('Error loading rules:', error);
  }
};

const handleDatesChanged = (dates) => {
  selectedDatesToBlock.value = dates;
};

const blockSelectedDates = async () => {
  if (selectedDatesToBlock.value.length === 0) return;

  try {
    if (selectedDatesToBlock.value.length === 1) {
      await availabilityService.addBlockedDate(
        calendar.value.id,
        selectedDatesToBlock.value[0],
        blockReason.value
      );
    } else {
      // Sort dates and block range
      const sortedDates = [...selectedDatesToBlock.value].sort();
      await availabilityService.addBlockedDateRange(
        calendar.value.id,
        sortedDates[0],
        sortedDates[sortedDates.length - 1],
        blockReason.value
      );
    }

    selectedDatesToBlock.value = [];
    blockReason.value = '';
    await loadBlockedDates();
    emit('availability-updated');
  } catch (error) {
    console.error('Error blocking dates:', error);
    alert('Error al bloquear las fechas');
  }
};

const removeBlockedDate = async (blockedDate) => {
  try {
    await availabilityService.removeBlockedDate(calendar.value.id, blockedDate.id);
    await loadBlockedDates();
    emit('availability-updated');
  } catch (error) {
    console.error('Error removing blocked date:', error);
    alert('Error al desbloquear la fecha');
  }
};

const clearAllBlockedDates = async () => {
  if (!confirm('¿Estas seguro de desbloquear todas las fechas?')) return;

  try {
    await availabilityService.clearBlockedDates(calendar.value.id);
    blockedDates.value = [];
    emit('availability-updated');
  } catch (error) {
    console.error('Error clearing blocked dates:', error);
  }
};

const openAddRuleModal = () => {
  ruleForm.value = {
    dayOfWeek: null,
    startTime: '09:00',
    endTime: '18:00',
    isRecurring: true
  };
  showAddRuleModal.value = true;
};

const saveRule = async () => {
  if (ruleForm.value.dayOfWeek === null) {
    alert('Selecciona un dia de la semana');
    return;
  }

  try {
    await availabilityService.addAvailabilityRule(calendar.value.id, {
      dayOfWeek: ruleForm.value.dayOfWeek,
      startTime: ruleForm.value.startTime,
      endTime: ruleForm.value.endTime,
      isRecurring: ruleForm.value.isRecurring
    });
    showAddRuleModal.value = false;
    await loadRules();
    emit('availability-updated');
  } catch (error) {
    console.error('Error saving rule:', error);
    alert('Error al guardar la regla');
  }
};

const deleteRule = async (ruleId) => {
  if (!confirm('¿Estas seguro de eliminar esta regla?')) return;

  try {
    await availabilityService.deleteAvailabilityRule(calendar.value.id, ruleId);
    await loadRules();
    emit('availability-updated');
  } catch (error) {
    console.error('Error deleting rule:', error);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const getDayName = (dayOfWeek) => {
  return daysOfWeekOptions.find(d => d.value === dayOfWeek)?.label || '';
};
</script>

<template>
  <div class="availability-manager">
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-(--primary-color)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- No calendar yet -->
    <div v-else-if="!calendar" class="text-center py-12 bg-white rounded-xl shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Calendario no configurado</h3>
      <p class="text-gray-500 mb-4">Crea un calendario de disponibilidad para gestionar las fechas</p>
      <button
        @click="createCalendar"
        class="px-6 py-2 bg-(--primary-color) text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Crear calendario
      </button>
    </div>

    <!-- Calendar manager -->
    <template v-else>
      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'calendar'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'calendar' ? 'bg-(--primary-color) text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          Calendario
        </button>
        <button
          @click="activeTab = 'rules'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'rules' ? 'bg-(--primary-color) text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          Reglas de disponibilidad
        </button>
        <button
          @click="activeTab = 'blocked'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'blocked' ? 'bg-(--primary-color) text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          Fechas bloqueadas
        </button>
      </div>

      <!-- Calendar Tab -->
      <div v-if="activeTab === 'calendar'" class="grid md:grid-cols-2 gap-6">
        <AvailabilityCalendarComponent
          :blocked-dates="blockedDateStrings"
          :reserved-dates="reservedDates"
          :selected-dates="selectedDatesToBlock"
          :selectable="true"
          :multi-select="true"
          @dates-changed="handleDatesChanged"
        />

        <div class="bg-white rounded-xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Bloquear fechas</h3>

          <div v-if="selectedDatesToBlock.length === 0" class="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Selecciona fechas en el calendario para bloquearlas</p>
          </div>

          <div v-else>
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">Fechas seleccionadas:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="date in selectedDatesToBlock"
                  :key="date"
                  class="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                >
                  {{ formatDate(date) }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
              <input
                v-model="blockReason"
                type="text"
                placeholder="Ej: Mantenimiento, evento privado..."
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
              />
            </div>

            <button
              @click="blockSelectedDates"
              class="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Bloquear {{ selectedDatesToBlock.length }} fecha{{ selectedDatesToBlock.length > 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Rules Tab -->
      <div v-if="activeTab === 'rules'" class="bg-white rounded-xl shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Reglas de disponibilidad</h3>
            <p class="text-sm text-gray-500">Define horarios disponibles por dia de la semana</p>
          </div>
          <button
            @click="openAddRuleModal"
            class="px-4 py-2 bg-(--primary-color) text-white rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva regla
          </button>
        </div>

        <div v-if="rules.length === 0" class="text-center py-8 text-gray-500">
          <p>No hay reglas configuradas</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="rule in rules"
            :key="rule.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-(--primary-color) text-white rounded-lg flex items-center justify-center font-semibold">
                {{ getDayName(rule.dayOfWeek).substring(0, 2) }}
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ getDayName(rule.dayOfWeek) }}</p>
                <p class="text-sm text-gray-500">{{ rule.startTime }} - {{ rule.endTime }}</p>
              </div>
              <span
                v-if="rule.isRecurring"
                class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
              >
                Recurrente
              </span>
            </div>
            <button
              @click="deleteRule(rule.id)"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Blocked dates Tab -->
      <div v-if="activeTab === 'blocked'" class="bg-white rounded-xl shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Fechas bloqueadas</h3>
            <p class="text-sm text-gray-500">{{ blockedDates.length }} fecha{{ blockedDates.length !== 1 ? 's' : '' }} bloqueada{{ blockedDates.length !== 1 ? 's' : '' }}</p>
          </div>
          <button
            v-if="blockedDates.length > 0"
            @click="clearAllBlockedDates"
            class="text-red-500 hover:text-red-700 text-sm"
          >
            Desbloquear todas
          </button>
        </div>

        <div v-if="blockedDates.length === 0" class="text-center py-8 text-gray-500">
          <p>No hay fechas bloqueadas</p>
        </div>

        <div v-else class="grid gap-2 max-h-96 overflow-y-auto">
          <div
            v-for="blocked in blockedDates"
            :key="blocked.id"
            class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-800">{{ formatDate(blocked.date) }}</p>
              <p v-if="blocked.reason" class="text-sm text-gray-500">{{ blocked.reason }}</p>
            </div>
            <button
              @click="removeBlockedDate(blocked)"
              class="text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Rule Modal -->
    <Teleport to="body">
      <div
        v-if="showAddRuleModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showAddRuleModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Nueva regla de disponibilidad</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dia de la semana</label>
              <select
                v-model="ruleForm.dayOfWeek"
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
              >
                <option :value="null" disabled>Seleccionar dia</option>
                <option v-for="day in daysOfWeekOptions" :key="day.value" :value="day.value">
                  {{ day.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <input
                  v-model="ruleForm.startTime"
                  type="time"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <input
                  v-model="ruleForm.endTime"
                  type="time"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
                />
              </div>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="ruleForm.isRecurring"
                type="checkbox"
                class="h-4 w-4 text-(--primary-color) rounded focus:ring-(--primary-color)"
              />
              <span class="text-sm text-gray-700">Aplicar todas las semanas</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showAddRuleModal = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              @click="saveRule"
              class="px-4 py-2 bg-(--primary-color) text-white rounded-lg hover:opacity-90"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
