<script setup>
import { onMounted, ref } from 'vue';
import { useAuthenticationStore } from '../../auth/services/authentication.store';
import { LocalsApiService } from '../../locals/services/locals-api.service';

const authenticationStore = useAuthenticationStore();
const localsApiService = new LocalsApiService();

const locals = ref([]);

onMounted(async () => {
  try {
    const userId = authenticationStore.userId;
    const response = await localsApiService.getUserLocals(userId);
    locals.value = response;
  } catch (error) {
    console.error('Error fetching published spaces:', error);
  }
});

</script>

<template>
  <div v-if="locals" class="w-full p-4 flex flex-col gap-10">
    <h2 class="text-xl md:text-4xl font-bold text-center mb-6 text-(--text-color)">
      Espacios publicados
    </h2>
    <div class="w-full flex justify-center items-center">
      <div v-if="locals.length === 0" class="w-full flex items-center justify-center">
        <p class="text-lg text-center text-(--text-color)">No tienes espacios publicados aún.</p>
      </div>
    </div>  
    <div v-for="local in locals" :key="local.id" class="w-full px-10 py-4 text-(--text-color) bg-(--background-color) shadow-md rounded-lg flex items-center justify-between transition duration-300 ease-in-out">
      <div class="flex flex-col xl:flex-row gap-4 w-full items-center">
        <img :src="local.photoUrls[0]" alt="Local Image" class="w-full xl:w-32 h-32 object-cover rounded-lg" />
        <div class="flex flex-col justify-center gap-4 w-full">
          <h3 class="text-2xl font-semibold">{{ local.localName }}</h3>
          <p class="text-xl font-semibold">📍 {{ local.address }}</p>
          <p class="text-lg">{{ `💵 Precio: S/.${local.price} por hora` }}</p>
        </div>
        <div class="w-full flex flex-col items-center justify-center gap-2">
          <RouterLink :to="`/local/${local.id}`" class="w-full px-4 py-2 bg-(--button-color) hover:bg-(--button-color-hover) text-xl text-black text-center rounded-md hover:cursor-pointer">
            Ver detalles
          </RouterLink>
          <RouterLink :to="`/edit-local/${local.id}`" class="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xl text-white text-center rounded-md hover:cursor-pointer">
            Editar
          </RouterLink>
          <RouterLink :to="`/stats/${local.id}`" class="w-full px-4 py-2 bg-(--primary-color) text-xl text-white text-center rounded-md hover:bg-(--primary-color-hover) hover:cursor-pointer">
            Estadisticas
          </RouterLink>
          <RouterLink :to="`/availability/${local.id}`" class="w-full px-4 py-2 bg-purple-600 text-xl text-white text-center rounded-md hover:bg-purple-700 hover:cursor-pointer">
            Disponibilidad
          </RouterLink>
          <RouterLink :to="`/monitoring/${local.id}`" class="w-full px-4 py-2 bg-(--secondary-color) text-xl text-white text-center rounded-md hover:bg-(--secondary-color-hover) hover:cursor-pointer">
            Monitorear
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

