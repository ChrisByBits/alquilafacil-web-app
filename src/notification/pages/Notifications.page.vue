<script setup>
import { onMounted, computed } from 'vue';
import NavbarComponent from '@/public/components/Navbar.component.vue';
import FooterComponent from '@/public/components/Footer.component.vue';
import { useNotificationsStore } from '../services/notifications.store';
import { useAuthenticationStore } from '@/auth/services/authentication.store';

const notificationsStore = useNotificationsStore();
const authStore = useAuthenticationStore();

const notifications = computed(() => notificationsStore.notifications);
const isLoading = computed(() => notificationsStore.isLoading);

onMounted(async () => {
  if (authStore.isSignedIn) {
    await notificationsStore.loadNotifications();
  }
});

const handleMarkAsRead = async (notificationId) => {
  await notificationsStore.markAsRead(notificationId);
};

const handleDelete = async (notificationId) => {
  await notificationsStore.deleteNotification(notificationId);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  return date.toLocaleDateString('es-PE');
};
</script>

<template>
  <NavbarComponent />
  <main class="px-4 sm:px-8 md:px-10 lg:px-16 py-10 w-full min-h-[80dvh]">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-(--text-color)">Notificaciones</h1>
        <span v-if="notificationsStore.unreadCount > 0" class="px-3 py-1 bg-(--secondary-color) text-white text-sm rounded-full">
          {{ notificationsStore.unreadCount }} sin leer
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-(--primary-color) border-t-transparent"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="notifications.length === 0" class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-gray-500 text-lg">No tienes notificaciones</p>
        <p class="text-gray-400 text-sm mt-1">Las notificaciones apareceran aqui</p>
      </div>

      <!-- Notifications list -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-white shadow-sm rounded-xl p-4 border transition-all hover:shadow-md"
          :class="notification.isRead ? 'border-gray-200' : 'border-l-4 border-l-(--secondary-color) border-gray-200'"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-lg font-semibold text-(--text-color)">{{ notification.title }}</h2>
                <span v-if="!notification.isRead" class="w-2 h-2 bg-(--secondary-color) rounded-full"></span>
              </div>
              <p class="text-gray-600">{{ notification.message || notification.content }}</p>
              <p class="text-xs text-gray-400 mt-2">{{ formatDate(notification.createdAt) }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="!notification.isRead"
                @click="handleMarkAsRead(notification.id)"
                class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Marcar como leido"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button
                @click="handleDelete(notification.id)"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <FooterComponent />
</template>
