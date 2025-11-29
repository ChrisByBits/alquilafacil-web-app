<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: null
  },
  hint: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: null
  },
  minLength: {
    type: Number,
    default: null
  },
  min: {
    type: Number,
    default: null
  },
  max: {
    type: Number,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  textarea: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const isFocused = ref(false);
const inputRef = ref(null);

const hasValue = computed(() => {
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined;
});

const characterCount = computed(() => {
  if (!props.maxLength) return null;
  const currentLength = String(props.modelValue || '').length;
  return `${currentLength}/${props.maxLength}`;
});

const inputClasses = computed(() => {
  const base = 'w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-white';
  const focus = 'focus:ring-2 focus:ring-(--secondary-color)/20';

  if (props.error) {
    return `${base} ${focus} border-red-400 focus:border-red-500`;
  }

  if (isFocused.value || hasValue.value) {
    return `${base} ${focus} border-(--secondary-color)`;
  }

  return `${base} ${focus} border-gray-200 hover:border-gray-300`;
});

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const handleFocus = () => {
  isFocused.value = true;
  emit('focus');
};

const handleBlur = () => {
  isFocused.value = false;
  emit('blur');
};

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({ focus });
</script>

<template>
  <div class="validated-input w-full">
    <!-- Label -->
    <label
      class="flex items-center gap-1 text-sm font-medium mb-2 transition-colors"
      :class="error ? 'text-red-600' : 'text-gray-700'"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input container -->
    <div class="relative">
      <!-- Icon -->
      <div
        v-if="icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <span class="text-lg">{{ icon }}</span>
      </div>

      <!-- Textarea -->
      <textarea
        v-if="textarea"
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :minlength="minLength"
        :rows="rows"
        :class="[inputClasses, icon ? 'pl-12' : '']"
        class="resize-none"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Input -->
      <input
        v-else
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :minlength="minLength"
        :min="min"
        :max="max"
        :class="[inputClasses, icon ? 'pl-12' : '']"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Character count -->
      <span
        v-if="characterCount && (textarea || type === 'text')"
        class="absolute right-3 bottom-3 text-xs"
        :class="error ? 'text-red-400' : 'text-gray-400'"
      >
        {{ characterCount }}
      </span>
    </div>

    <!-- Error message -->
    <div v-if="error" class="flex items-center gap-1 mt-2 text-sm text-red-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>

    <!-- Hint -->
    <p v-else-if="hint" class="mt-2 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>
