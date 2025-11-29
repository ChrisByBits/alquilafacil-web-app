<script setup>
import { watch, ref } from 'vue';
import { ProfileResponse } from '../model/profile.response';
import EditableProfileField from './EditableProfileField.component.vue';
import AvatarUploadComponent from './AvatarUpload.component.vue';
import { ProfilesApiService } from '../services/profiles-api.service';
import { useAuthenticationStore } from '../../auth/services/authentication.store';
import { ProfileRequest } from '../model/profile.request';

const props = defineProps({
  profile: Object,
});

const profileResponse = ref(null);
const profilesApiService = new ProfilesApiService();
const authenticationStore = useAuthenticationStore();
const isLoaded = ref(false);
const isSaving = ref(false);

watch(
  () => props.profile,
  (newVal) => {
    if (newVal && Object.keys(newVal).length) {
      profileResponse.value = new ProfileResponse(newVal);
      isLoaded.value = true;
    }
  },
  { immediate: true }
);

const handleAvatarChanged = async (newAvatarUrl) => {
  if (profileResponse.value) {
    profileResponse.value.avatarUrl = newAvatarUrl;
    await updateProfile();
  }
};

const handleAvatarRemoved = async () => {
  if (profileResponse.value) {
    profileResponse.value.avatarUrl = null;
    await updateProfile();
  }
};

const updateProfile = async () => {
  isSaving.value = true;
  try {
    const profileRequest = new ProfileRequest(profileResponse.value);
    await profilesApiService.update(authenticationStore.userId, profileRequest);
    alert('Perfil actualizado correctamente');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error al actualizar el perfil');
  } finally {
    isSaving.value = false;
  }
};

</script>

<template>
  <div v-if="isLoaded" class="w-full p-4 flex flex-col gap-10">
    <!-- Avatar and welcome section -->
    <div class="flex flex-col items-center gap-6">
      <AvatarUploadComponent
        :current-avatar="profileResponse.avatarUrl"
        :user-name="profileResponse.fullName"
        size="xl"
        @avatar-changed="handleAvatarChanged"
        @avatar-removed="handleAvatarRemoved"
      />
      <h2 class="text-xl md:text-4xl font-bold text-center text-(--text-color)">
        Bienvenido, {{ profileResponse.fullName }}
      </h2>
    </div>

    <form class="grid grid-cols-1 md:grid-cols-2 gap-10 xl:gap-18 justify-center items-center">
      <EditableProfileField
        v-model="profileResponse.name"
        label="Nombre"
      />
      <EditableProfileField
        v-model="profileResponse.fatherName"
        label="Apellido paterno"
      />
      <EditableProfileField
        v-model="profileResponse.motherName"
        label="Apellido materno"
      />
      <EditableProfileField
        v-model="profileResponse.phone"
        label="Teléfono"
      />
      <EditableProfileField
        v-model="profileResponse.documentNumber"
        label="Número de documento"
      />
      <EditableProfileField
        v-model="profileResponse.dateOfBirth"
        label="Fecha de nacimiento"
      />
      <EditableProfileField
        v-model="profileResponse.bankAccountNumber"
        label="Código de cuenta bancaria"
      />
      <EditableProfileField
        v-model="profileResponse.interbankAccountNumber"
        label="Código de cuenta interbancaria"
      />
      <button 
        type="button" 
        @click="updateProfile"
        class="bg-(--secondary-color) hover:bg-(--secondary-color-hover) transition text-white p-4 rounded-md hover:cursor-pointer md:col-span-2"
      >
        Guardar cambios
      </button>
    </form>
  </div>
  <div v-else class="w-full p-4 flex justify-center items-center">
    <p class="text-gray-500 text-xl">Cargando perfil...</p>
  </div>
</template>
