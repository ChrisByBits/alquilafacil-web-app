<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  blockedDates: {
    type: Array,
    default: () => []
  },
  reservedDates: {
    type: Array,
    default: () => []
  },
  selectedDates: {
    type: Array,
    default: () => []
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: null
  },
  selectable: {
    type: Boolean,
    default: false
  },
  multiSelect: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['date-selected', 'date-deselected', 'dates-changed']);

const currentDate = ref(new Date());
const internalSelectedDates = ref([...props.selectedDates]);

watch(() => props.selectedDates, (newVal) => {
  internalSelectedDates.value = [...newVal];
}, { deep: true });

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
});

const daysOfWeek = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days = [];

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date,
      dateString: formatDateString(date),
      day,
      isCurrentMonth: false,
      isToday: false,
      isBlocked: isDateBlocked(date),
      isReserved: isDateReserved(date),
      isSelected: isDateSelected(date),
      isPast: isPastDate(date)
    });
  }

  // Add days of current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    days.push({
      date,
      dateString: formatDateString(date),
      day,
      isCurrentMonth: true,
      isToday,
      isBlocked: isDateBlocked(date),
      isReserved: isDateReserved(date),
      isSelected: isDateSelected(date),
      isPast: isPastDate(date)
    });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      dateString: formatDateString(date),
      day,
      isCurrentMonth: false,
      isToday: false,
      isBlocked: isDateBlocked(date),
      isReserved: isDateReserved(date),
      isSelected: isDateSelected(date),
      isPast: isPastDate(date)
    });
  }

  return days;
});

const formatDateString = (date) => {
  return date.toISOString().split('T')[0];
};

const isDateBlocked = (date) => {
  const dateStr = formatDateString(date);
  return props.blockedDates.some(d =>
    (typeof d === 'string' ? d : d.date) === dateStr
  );
};

const isDateReserved = (date) => {
  const dateStr = formatDateString(date);
  return props.reservedDates.some(d =>
    (typeof d === 'string' ? d : d.date) === dateStr
  );
};

const isDateSelected = (date) => {
  const dateStr = formatDateString(date);
  return internalSelectedDates.value.includes(dateStr);
};

const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const isDateDisabled = (dayInfo) => {
  if (dayInfo.isPast) return true;
  if (dayInfo.isBlocked) return true;
  if (dayInfo.isReserved) return true;

  if (props.minDate) {
    const min = new Date(props.minDate);
    if (dayInfo.date < min) return true;
  }

  if (props.maxDate) {
    const max = new Date(props.maxDate);
    if (dayInfo.date > max) return true;
  }

  return false;
};

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

const goToToday = () => {
  currentDate.value = new Date();
};

const handleDayClick = (dayInfo) => {
  if (!props.selectable) return;
  if (isDateDisabled(dayInfo)) return;

  const dateStr = dayInfo.dateString;

  if (props.multiSelect) {
    const index = internalSelectedDates.value.indexOf(dateStr);
    if (index > -1) {
      internalSelectedDates.value.splice(index, 1);
      emit('date-deselected', dateStr);
    } else {
      internalSelectedDates.value.push(dateStr);
      emit('date-selected', dateStr);
    }
    emit('dates-changed', [...internalSelectedDates.value]);
  } else {
    if (internalSelectedDates.value[0] === dateStr) {
      internalSelectedDates.value = [];
      emit('date-deselected', dateStr);
    } else {
      internalSelectedDates.value = [dateStr];
      emit('date-selected', dateStr);
    }
    emit('dates-changed', [...internalSelectedDates.value]);
  }
};

const getDayClasses = (dayInfo) => {
  const classes = ['calendar-day', 'relative', 'h-12', 'flex', 'items-center', 'justify-center', 'text-sm', 'rounded-lg', 'transition-all'];

  if (!dayInfo.isCurrentMonth) {
    classes.push('text-gray-300');
  }

  if (dayInfo.isToday) {
    classes.push('ring-2', 'ring-(--primary-color)');
  }

  if (dayInfo.isSelected) {
    classes.push('bg-(--primary-color)', 'text-white', 'font-semibold');
  } else if (dayInfo.isBlocked) {
    classes.push('bg-red-100', 'text-red-400', 'line-through');
  } else if (dayInfo.isReserved) {
    classes.push('bg-blue-100', 'text-blue-600');
  } else if (dayInfo.isPast) {
    classes.push('text-gray-300', 'cursor-not-allowed');
  } else if (dayInfo.isCurrentMonth && props.selectable) {
    classes.push('hover:bg-gray-100', 'cursor-pointer');
  }

  return classes.join(' ');
};
</script>

<template>
  <div class="availability-calendar bg-white rounded-xl shadow-md overflow-hidden">
    <!-- Header -->
    <div class="p-4 bg-gradient-to-r from-(--primary-color) to-(--secondary-color) text-white">
      <div class="flex items-center justify-between">
        <button
          @click="previousMonth"
          class="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="text-center">
          <h3 class="text-lg font-semibold capitalize">{{ monthName }}</h3>
          <button
            @click="goToToday"
            class="text-xs hover:underline opacity-80"
          >
            Ir a hoy
          </button>
        </div>

        <button
          @click="nextMonth"
          class="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Days of week header -->
    <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="p-3 text-center text-xs font-semibold text-gray-600 uppercase"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1 p-2">
      <div
        v-for="(dayInfo, index) in calendarDays"
        :key="index"
        :class="getDayClasses(dayInfo)"
        @click="handleDayClick(dayInfo)"
      >
        {{ dayInfo.day }}

        <!-- Indicators -->
        <div
          v-if="dayInfo.isReserved && !dayInfo.isSelected"
          class="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"
        ></div>
      </div>
    </div>

    <!-- Legend -->
    <div class="p-4 border-t border-gray-200 bg-gray-50">
      <div class="flex flex-wrap gap-4 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-(--primary-color)"></div>
          <span class="text-gray-600">Seleccionado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
          <span class="text-gray-600">Bloqueado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
          <span class="text-gray-600">Reservado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded ring-2 ring-(--primary-color)"></div>
          <span class="text-gray-600">Hoy</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-day {
  aspect-ratio: 1;
}
</style>
