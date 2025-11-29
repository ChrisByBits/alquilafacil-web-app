<script setup>
import { computed } from 'vue';

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'duplicate', 'preview', 'use']);

const variableCount = computed(() => {
  if (!props.template.content) return 0;
  const matches = props.template.content.match(/\{\{\w+\}\}/g);
  return matches ? matches.length : 0;
});

const wordCount = computed(() => {
  if (!props.template.content) return 0;
  return props.template.content.split(/\s+/).filter(word => word.length > 0).length;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getCategoryInfo = (category) => {
  const categories = {
    'standard': { label: 'Estandar', color: 'bg-gray-100 text-gray-700', icon: '📄' },
    'short-term': { label: 'Corto plazo', color: 'bg-blue-100 text-blue-700', icon: '⏱️' },
    'long-term': { label: 'Largo plazo', color: 'bg-purple-100 text-purple-700', icon: '📅' },
    'commercial': { label: 'Comercial', color: 'bg-green-100 text-green-700', icon: '🏢' },
    'event': { label: 'Eventos', color: 'bg-orange-100 text-orange-700', icon: '🎉' },
    'custom': { label: 'Personalizado', color: 'bg-pink-100 text-pink-700', icon: '✨' }
  };
  return categories[category] || categories['standard'];
};

const categoryInfo = computed(() => getCategoryInfo(props.template.category || 'standard'));

const contentPreview = computed(() => {
  if (!props.template.content) return '';
  const cleanContent = props.template.content.replace(/\{\{\w+\}\}/g, '[...]');
  return cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : '');
});
</script>

<template>
  <div class="template-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
    <!-- Header -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span :class="['text-xs px-2 py-0.5 rounded-full', categoryInfo.color]">
              {{ categoryInfo.icon }} {{ categoryInfo.label }}
            </span>
            <span v-if="template.isDefault" class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              Predeterminada
            </span>
          </div>
          <h3 class="font-semibold text-gray-800 truncate">{{ template.title }}</h3>
        </div>

        <!-- Quick actions menu -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="emit('preview', template)"
            class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Vista previa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            @click="emit('duplicate', template)"
            class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Duplicar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Content preview -->
    <div class="p-4 bg-gray-50">
      <p class="text-xs text-gray-500 font-mono leading-relaxed line-clamp-3">
        {{ contentPreview }}
      </p>
    </div>

    <!-- Stats -->
    <div class="px-4 py-3 flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100">
      <div class="flex items-center gap-1" title="Variables">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        {{ variableCount }} variables
      </div>
      <div class="flex items-center gap-1" title="Palabras">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ wordCount }} palabras
      </div>
      <div class="flex-1"></div>
      <span class="text-gray-400">{{ formatDate(template.createdAt) }}</span>
    </div>

    <!-- Actions -->
    <div class="px-4 py-3 flex gap-2 border-t border-gray-100 bg-white">
      <button
        @click="emit('use', template)"
        class="flex-1 px-3 py-2 bg-(--secondary-color) text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Usar
      </button>
      <button
        @click="emit('edit', template)"
        class="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        Editar
      </button>
      <button
        @click="emit('delete', template)"
        class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Eliminar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
