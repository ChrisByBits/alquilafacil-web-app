<script setup>
import { ref, computed } from 'vue';
import { cloudinaryWidget } from '@/shared/components/cloudinary-widget';

const props = defineProps({
  currentAvatar: {
    type: String,
    default: null
  },
  userName: {
    type: String,
    default: 'Usuario'
  },
  size: {
    type: String,
    default: 'lg', // sm, md, lg, xl
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
});

const emit = defineEmits(['avatar-changed', 'avatar-removed']);

const isUploading = ref(false);
const showRemoveConfirm = ref(false);
const localAvatar = ref(props.currentAvatar);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-16 h-16 text-xl';
    case 'md': return 'w-24 h-24 text-2xl';
    case 'lg': return 'w-32 h-32 text-4xl';
    case 'xl': return 'w-40 h-40 text-5xl';
    default: return 'w-32 h-32 text-4xl';
  }
});

const userInitials = computed(() => {
  if (!props.userName) return 'U';
  const names = props.userName.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return props.userName.substring(0, 2).toUpperCase();
});

const openUploadWidget = () => {
  isUploading.value = true;

  cloudinaryWidget(
    (uploadedUrl) => {
      localAvatar.value = uploadedUrl;
      emit('avatar-changed', uploadedUrl);
      isUploading.value = false;
    },
    {
      folder: 'avatars',
      cropping: true,
      croppingAspectRatio: 1,
      croppingShowDimensions: true,
      maxFiles: 1,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
  );
};

const confirmRemoveAvatar = () => {
  showRemoveConfirm.value = true;
};

const removeAvatar = () => {
  localAvatar.value = null;
  emit('avatar-removed');
  showRemoveConfirm.value = false;
};

const cancelRemove = () => {
  showRemoveConfirm.value = false;
};
</script>

<template>
  <div class="avatar-upload flex flex-col items-center gap-4">
    <!-- Avatar display -->
    <div class="relative group">
      <!-- Avatar image or initials -->
      <div
        :class="[
          'rounded-full overflow-hidden flex items-center justify-center font-bold transition-all',
          sizeClasses,
          localAvatar
            ? 'bg-gray-200'
            : 'bg-gradient-to-br from-(--primary-color) to-(--secondary-color) text-white'
        ]"
      >
        <img
          v-if="localAvatar"
          :src="localAvatar"
          :alt="userName"
          class="w-full h-full object-cover"
        />
        <span v-else>{{ userInitials }}</span>
      </div>

      <!-- Hover overlay -->
      <div
        class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        @click="openUploadWidget"
      >
        <div class="text-white text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs mt-1 block">Cambiar foto</span>
        </div>
      </div>

      <!-- Upload indicator -->
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center"
      >
        <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Remove button -->
      <button
        v-if="localAvatar && !isUploading"
        @click="confirmRemoveAvatar"
        class="absolute -bottom-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
        title="Eliminar foto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2">
      <button
        @click="openUploadWidget"
        :disabled="isUploading"
        class="px-4 py-2 text-sm bg-(--primary-color) text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ localAvatar ? 'Cambiar foto' : 'Subir foto' }}
      </button>
    </div>

    <!-- Info text -->
    <p class="text-xs text-gray-500 text-center">
      Formatos: JPG, PNG, GIF, WebP
      <br />
      Tamano maximo: 5MB
    </p>

    <!-- Remove confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showRemoveConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cancelRemove"
      >
        <div class="bg-white rounded-xl p-6 max-w-sm w-full">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Eliminar foto de perfil</h3>
            <p class="text-gray-500 mb-6">¿Estas seguro de que deseas eliminar tu foto de perfil?</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="cancelRemove"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="removeAvatar"
              class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
