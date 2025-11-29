import { computed, reactive } from 'vue';

/**
 * Composable for publish wizard validation
 */
export const usePublishValidation = (localData) => {
  const errors = reactive({
    localName: [],
    descriptionMessage: [],
    country: [],
    city: [],
    district: [],
    street: [],
    latitude: [],
    longitude: [],
    price: [],
    capacity: [],
    photoUrls: [],
    features: [],
    localCategoryId: []
  });

  const rules = {
    localName: [
      { test: (v) => !!v && v.trim().length > 0, message: 'El nombre es obligatorio' },
      { test: (v) => !v || v.length >= 5, message: 'El nombre debe tener al menos 5 caracteres' },
      { test: (v) => !v || v.length <= 100, message: 'El nombre no puede exceder 100 caracteres' },
      { test: (v) => !v || /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,()]+$/.test(v), message: 'El nombre contiene caracteres no permitidos' }
    ],
    descriptionMessage: [
      { test: (v) => !!v && v.trim().length > 0, message: 'La descripcion es obligatoria' },
      { test: (v) => !v || v.length >= 20, message: 'La descripcion debe tener al menos 20 caracteres' },
      { test: (v) => !v || v.length <= 1000, message: 'La descripcion no puede exceder 1000 caracteres' }
    ],
    country: [
      { test: (v) => !!v && v.trim().length > 0, message: 'El pais es obligatorio' },
      { test: (v) => !v || v.length >= 3, message: 'Ingresa un pais valido' }
    ],
    city: [
      { test: (v) => !!v && v.trim().length > 0, message: 'El departamento es obligatorio' },
      { test: (v) => !v || v.length >= 3, message: 'Ingresa un departamento valido' }
    ],
    district: [
      { test: (v) => !!v && v.trim().length > 0, message: 'El distrito es obligatorio' },
      { test: (v) => !v || v.length >= 3, message: 'Ingresa un distrito valido' }
    ],
    street: [
      { test: (v) => !!v && v.trim().length > 0, message: 'La direccion es obligatoria' },
      { test: (v) => !v || v.length >= 5, message: 'La direccion debe tener al menos 5 caracteres' }
    ],
    latitude: [
      { test: (v) => v !== null && v !== undefined, message: 'Selecciona la ubicacion en el mapa' },
      { test: (v) => !v || (v >= -90 && v <= 90), message: 'Latitud invalida' }
    ],
    longitude: [
      { test: (v) => v !== null && v !== undefined, message: 'Selecciona la ubicacion en el mapa' },
      { test: (v) => !v || (v >= -180 && v <= 180), message: 'Longitud invalida' }
    ],
    price: [
      { test: (v) => v !== null && v !== undefined && v !== '', message: 'El precio es obligatorio' },
      { test: (v) => !v || Number(v) > 0, message: 'El precio debe ser mayor a 0' },
      { test: (v) => !v || Number(v) <= 10000, message: 'El precio no puede exceder S/ 10,000 por hora' }
    ],
    capacity: [
      { test: (v) => v !== null && v !== undefined && v !== '', message: 'El aforo es obligatorio' },
      { test: (v) => !v || Number(v) >= 1, message: 'El aforo minimo es 1 persona' },
      { test: (v) => !v || Number(v) <= 10000, message: 'El aforo no puede exceder 10,000 personas' },
      { test: (v) => !v || Number.isInteger(Number(v)), message: 'El aforo debe ser un numero entero' }
    ],
    photoUrls: [
      { test: (v) => Array.isArray(v) && v.length > 0, message: 'Debes agregar al menos una imagen' },
      { test: (v) => !v || v.length <= 10, message: 'No puedes agregar mas de 10 imagenes' }
    ],
    features: [
      { test: (v) => Array.isArray(v) && v.length > 0, message: 'Debes agregar al menos una caracteristica' }
    ],
    localCategoryId: [
      { test: (v) => v !== null && v !== undefined && v > 0, message: 'Debes seleccionar una categoria' }
    ]
  };

  const validateField = (field, value) => {
    const fieldRules = rules[field] || [];
    const fieldErrors = [];

    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    }

    errors[field] = fieldErrors;
    return fieldErrors.length === 0;
  };

  const validateStep = (step) => {
    const stepFields = {
      3: ['localCategoryId'],
      4: ['country', 'city', 'district', 'street', 'latitude', 'longitude'],
      6: ['photoUrls'],
      7: ['localName', 'descriptionMessage', 'capacity', 'features'],
      9: ['price']
    };

    const fields = stepFields[step] || [];
    let isValid = true;

    for (const field of fields) {
      const value = localData.value ? localData.value[field] : localData[field];
      if (!validateField(field, value)) {
        isValid = false;
      }
    }

    return isValid;
  };

  const validateAll = () => {
    let isValid = true;
    const data = localData.value || localData;

    for (const field of Object.keys(rules)) {
      if (!validateField(field, data[field])) {
        isValid = false;
      }
    }

    return isValid;
  };

  const getFirstError = (field) => {
    return errors[field]?.[0] || null;
  };

  const hasError = (field) => {
    return errors[field]?.length > 0;
  };

  const clearErrors = (field = null) => {
    if (field) {
      errors[field] = [];
    } else {
      Object.keys(errors).forEach(key => {
        errors[key] = [];
      });
    }
  };

  const isStepValid = (step) => {
    const stepFields = {
      1: [], // Intro, no validation
      2: [], // Intro, no validation
      3: ['localCategoryId'],
      4: ['country', 'city', 'district', 'street'],
      5: [], // Intro, no validation
      6: ['photoUrls'],
      7: ['localName', 'descriptionMessage', 'capacity', 'features'],
      8: [], // Intro, no validation
      9: ['price'],
      10: [] // Preview
    };

    const fields = stepFields[step] || [];
    const data = localData.value || localData;

    for (const field of fields) {
      const fieldRules = rules[field] || [];
      for (const rule of fieldRules) {
        if (!rule.test(data[field])) {
          return false;
        }
      }
    }

    return true;
  };

  const getStepProgress = computed(() => {
    const data = localData.value || localData;
    const completedSteps = [];

    // Check each step
    if (data.localCategoryId > 0) completedSteps.push(3);
    if (data.country && data.city && data.district && data.street) completedSteps.push(4);
    if (data.photoUrls?.length > 0) completedSteps.push(6);
    if (data.localName && data.descriptionMessage && data.capacity && data.features?.length > 0) completedSteps.push(7);
    if (data.price > 0) completedSteps.push(9);

    return {
      completed: completedSteps.length,
      total: 5,
      percentage: Math.round((completedSteps.length / 5) * 100),
      steps: completedSteps
    };
  });

  return {
    errors,
    validateField,
    validateStep,
    validateAll,
    getFirstError,
    hasError,
    clearErrors,
    isStepValid,
    getStepProgress
  };
};

export default usePublishValidation;
