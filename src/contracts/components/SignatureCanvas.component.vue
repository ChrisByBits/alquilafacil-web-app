<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['signature-captured', 'signature-cleared']);

const canvas = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const hasSignature = ref(false);
const lastX = ref(0);
const lastY = ref(0);

onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d');
    setupCanvas();
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const setupCanvas = () => {
  if (!canvas.value || !ctx.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.value.width = rect.width * dpr;
  canvas.value.height = rect.height * dpr;

  ctx.value.scale(dpr, dpr);
  ctx.value.strokeStyle = '#1a1a2e';
  ctx.value.lineWidth = 2;
  ctx.value.lineCap = 'round';
  ctx.value.lineJoin = 'round';

  // Draw signature line
  drawSignatureLine();
};

const drawSignatureLine = () => {
  if (!ctx.value || !canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  ctx.value.save();
  ctx.value.strokeStyle = '#e5e7eb';
  ctx.value.lineWidth = 1;
  ctx.value.setLineDash([5, 5]);
  ctx.value.beginPath();
  ctx.value.moveTo(20, rect.height - 40);
  ctx.value.lineTo(rect.width - 20, rect.height - 40);
  ctx.value.stroke();
  ctx.value.restore();

  // Label
  ctx.value.save();
  ctx.value.fillStyle = '#9ca3af';
  ctx.value.font = '12px sans-serif';
  ctx.value.fillText('Firma aqui', 20, rect.height - 20);
  ctx.value.restore();
};

const handleResize = () => {
  setupCanvas();
};

const getCoordinates = (event) => {
  if (!canvas.value) return { x: 0, y: 0 };

  const rect = canvas.value.getBoundingClientRect();
  let x, y;

  if (event.touches && event.touches.length > 0) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }

  return { x, y };
};

const startDrawing = (event) => {
  event.preventDefault();
  isDrawing.value = true;
  const { x, y } = getCoordinates(event);
  lastX.value = x;
  lastY.value = y;
};

const draw = (event) => {
  if (!isDrawing.value || !ctx.value) return;
  event.preventDefault();

  const { x, y } = getCoordinates(event);

  ctx.value.beginPath();
  ctx.value.strokeStyle = '#1a1a2e';
  ctx.value.lineWidth = 2;
  ctx.value.setLineDash([]);
  ctx.value.moveTo(lastX.value, lastY.value);
  ctx.value.lineTo(x, y);
  ctx.value.stroke();

  lastX.value = x;
  lastY.value = y;
  hasSignature.value = true;
};

const stopDrawing = () => {
  if (isDrawing.value && hasSignature.value) {
    // Emit signature data when user stops drawing
    const signatureData = getSignatureData();
    if (signatureData) {
      emit('signature-captured', signatureData);
    }
  }
  isDrawing.value = false;
};

const clearSignature = () => {
  if (!ctx.value || !canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  ctx.value.clearRect(0, 0, rect.width, rect.height);
  drawSignatureLine();
  hasSignature.value = false;
  emit('signature-cleared');
};

const getSignatureData = () => {
  if (!canvas.value || !hasSignature.value) return null;
  return canvas.value.toDataURL('image/png');
};

const confirmSignature = () => {
  const signatureData = getSignatureData();
  if (signatureData) {
    emit('signature-captured', signatureData);
  }
};

defineExpose({
  getSignatureData,
  clearSignature,
  hasSignature
});
</script>

<template>
  <div class="signature-canvas-container">
    <div class="relative">
      <canvas
        ref="canvas"
        class="signature-canvas w-full h-48 border-2 border-gray-300 rounded-lg bg-white cursor-crosshair touch-none"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
      ></canvas>

      <!-- Instructions overlay when empty -->
      <div
        v-if="!hasSignature"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div class="text-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <p class="text-sm">Dibuja tu firma</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center mt-3">
      <button
        @click="clearSignature"
        :disabled="!hasSignature"
        class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Borrar
      </button>

      <div class="flex items-center gap-2">
        <span v-if="hasSignature" class="text-xs text-green-600 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Firma capturada
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signature-canvas {
  touch-action: none;
}
</style>
