<script setup>
import { computed } from 'vue';
import StarRating from 'vue3-star-ratings';

const props = defineProps({
  local: {
    type: Object,
    required: true
  },
  reservations: {
    type: Array,
    default: () => []
  },
  comments: {
    type: Array,
    default: () => []
  }
});

// Calculate statistics
const totalReservations = computed(() => props.reservations.length);

const completedReservations = computed(() => {
  return props.reservations.filter(r => new Date(r.endDate) < new Date()).length;
});

const upcomingReservations = computed(() => {
  return props.reservations.filter(r => new Date(r.startDate) > new Date()).length;
});

const activeReservations = computed(() => {
  const now = new Date();
  return props.reservations.filter(r =>
    new Date(r.startDate) <= now && new Date(r.endDate) >= now
  ).length;
});

const totalRevenue = computed(() => {
  return props.reservations.reduce((sum, r) => sum + (r.price || 0), 0);
});

const averageRating = computed(() => {
  if (props.comments.length === 0) return 0;
  const sum = props.comments.reduce((acc, c) => acc + (c.rating || 0), 0);
  return (sum / props.comments.length).toFixed(1);
});

const totalReviews = computed(() => props.comments.length);

const premiumReservations = computed(() => {
  return props.reservations.filter(r => r.isSubscribe).length;
});

const regularReservations = computed(() => {
  return props.reservations.filter(r => !r.isSubscribe).length;
});

const occupancyRate = computed(() => {
  if (totalReservations.value === 0) return 0;
  // Simple calculation: completed / total * 100
  return ((completedReservations.value / totalReservations.value) * 100).toFixed(0);
});

// Monthly revenue chart data
const monthlyRevenue = computed(() => {
  const months = {};
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    months[key] = {
      label: monthNames[date.getMonth()],
      revenue: 0,
      count: 0
    };
  }

  // Sum revenue by month
  props.reservations.forEach(r => {
    const date = new Date(r.startDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (months[key]) {
      months[key].revenue += r.price || 0;
      months[key].count++;
    }
  });

  return Object.values(months);
});

const maxMonthlyRevenue = computed(() => {
  return Math.max(...monthlyRevenue.value.map(m => m.revenue), 1);
});

// Rating distribution
const ratingDistribution = computed(() => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  props.comments.forEach(comment => {
    const rating = Math.round(comment.rating || 0);
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });
  return distribution;
});

const getPercentage = (stars) => {
  if (totalReviews.value === 0) return 0;
  return ((ratingDistribution.value[stars] / totalReviews.value) * 100).toFixed(0);
};
</script>

<template>
  <div class="stats-dashboard">
    <!-- Header Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <!-- Total Reservations -->
      <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="stat-value">{{ totalReservations }}</div>
        <div class="stat-label">Total Reservas</div>
      </div>

      <!-- Revenue -->
      <div class="stat-card bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-value">S/. {{ totalRevenue.toFixed(2) }}</div>
        <div class="stat-label">Ingresos Totales</div>
      </div>

      <!-- Rating -->
      <div class="stat-card bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-80" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div class="stat-value">{{ averageRating }}</div>
        <div class="stat-label">{{ totalReviews }} Resenas</div>
      </div>

      <!-- Occupancy -->
      <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="stat-value">{{ occupancyRate }}%</div>
        <div class="stat-label">Tasa Completadas</div>
      </div>
    </div>

    <!-- Second Row: Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Monthly Revenue Chart -->
      <div class="chart-card bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Ingresos Mensuales</h3>
        <div class="flex items-end justify-between gap-2 h-40">
          <div
            v-for="(month, index) in monthlyRevenue"
            :key="index"
            class="flex flex-col items-center flex-1"
          >
            <div class="text-xs text-gray-500 mb-1">S/.{{ month.revenue.toFixed(0) }}</div>
            <div
              class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
              :style="{ height: `${(month.revenue / maxMonthlyRevenue) * 100}%`, minHeight: month.revenue > 0 ? '8px' : '2px' }"
            ></div>
            <div class="text-xs text-gray-600 mt-2 font-medium">{{ month.label }}</div>
            <div class="text-xs text-gray-400">{{ month.count }} res.</div>
          </div>
        </div>
      </div>

      <!-- Reservation Status Breakdown -->
      <div class="chart-card bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Estado de Reservas</h3>
        <div class="space-y-4">
          <!-- Completed -->
          <div class="flex items-center gap-4">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600">Completadas</span>
                <span class="text-sm font-semibold text-gray-800">{{ completedReservations }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 rounded-full transition-all duration-500"
                  :style="{ width: totalReservations > 0 ? `${(completedReservations / totalReservations) * 100}%` : '0%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Active -->
          <div class="flex items-center gap-4">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600">En curso</span>
                <span class="text-sm font-semibold text-gray-800">{{ activeReservations }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all duration-500"
                  :style="{ width: totalReservations > 0 ? `${(activeReservations / totalReservations) * 100}%` : '0%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Upcoming -->
          <div class="flex items-center gap-4">
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600">Proximas</span>
                <span class="text-sm font-semibold text-gray-800">{{ upcomingReservations }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  :style="{ width: totalReservations > 0 ? `${(upcomingReservations / totalReservations) * 100}%` : '0%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Premium vs Regular -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Tipo de Cliente</h4>
            <div class="flex gap-4">
              <div class="flex-1 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-amber-600">{{ premiumReservations }}</div>
                <div class="text-xs text-amber-700">Premium</div>
              </div>
              <div class="flex-1 bg-gradient-to-r from-gray-100 to-slate-100 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-gray-600">{{ regularReservations }}</div>
                <div class="text-xs text-gray-700">Regular</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Third Row: Reviews Summary -->
    <div class="chart-card bg-white rounded-xl shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Resumen de Calificaciones</h3>
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Average Rating -->
        <div class="flex flex-col items-center justify-center md:w-1/3">
          <div class="text-5xl font-bold text-(--primary-color)">{{ averageRating }}</div>
          <StarRating
            :model-value="parseFloat(averageRating)"
            :star-color="'#fb9e49'"
            :inactive-color="'#e5e7eb'"
            :number-of-stars="5"
            :star-size="24"
            :disable-click="true"
            class="my-2"
          />
          <div class="text-sm text-gray-600">{{ totalReviews }} resena{{ totalReviews !== 1 ? 's' : '' }}</div>
        </div>

        <!-- Rating Distribution -->
        <div class="flex-1 space-y-2">
          <div v-for="stars in [5, 4, 3, 2, 1]" :key="stars" class="flex items-center gap-3">
            <div class="w-12 text-sm text-gray-600 flex items-center gap-1">
              <span>{{ stars }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-yellow-400 rounded-full transition-all duration-500"
                :style="{ width: `${getPercentage(stars)}%` }"
              ></div>
            </div>
            <div class="w-16 text-sm text-gray-500 text-right">
              {{ ratingDistribution[stars] }} ({{ getPercentage(stars) }}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply rounded-xl p-4 relative overflow-hidden;
}

.stat-icon {
  @apply absolute top-3 right-3;
}

.stat-value {
  @apply text-2xl md:text-3xl font-bold mt-2;
}

.stat-label {
  @apply text-sm opacity-90 mt-1;
}

.chart-card {
  border: 1px solid #e5e7eb;
}
</style>
