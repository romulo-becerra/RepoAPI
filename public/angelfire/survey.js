const form = document.getElementById('surveyForm');
const resultStatus = document.getElementById('resultStatus');
const resultBox = document.getElementById('resultBox');
const satisfaction = document.getElementById('satisfaction');
const satisfactionOutput = document.getElementById('satisfactionOutput');
const nps = document.getElementById('nps');
const experienceMeter = document.getElementById('experienceMeter');
const completionProgress = document.getElementById('completionProgress');
const operationsGroup = document.getElementById('operationsGroup');

const fieldRules = {
  full_name: {
    element: form.full_name,
    validate: (value) => {
      if (!value) {
        return 'El nombre completo es obligatorio.';
      }
      if (value.length < 5) {
        return 'El nombre debe tener al menos 5 caracteres.';
      }
      if (!value.includes(' ')) {
        return 'Incluye nombre y apellido.';
      }
      return '';
    }
  },
  email: {
    element: form.email,
    validate: (value) => {
      if (!value) {
        return 'El correo es obligatorio.';
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return 'Ingresa un correo valido.';
      }
      return '';
    }
  },
  phone: {
    element: form.phone,
    validate: (value) => {
      if (!value) {
        return '';
      }

      const digits = value.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        return 'El telefono debe tener entre 8 y 15 digitos.';
      }
      return '';
    }
  },
  country: {
    element: form.country,
    validate: (value) => {
      if (!value) {
        return 'Selecciona un pais.';
      }
      return '';
    }
  },
  age_range: {
    element: form.age_range,
    validate: (value) => {
      if (!value) {
        return 'Selecciona un rango de edad.';
      }
      return '';
    }
  },
  account_type: {
    element: form.account_type,
    validate: (value) => {
      if (!value) {
        return 'Selecciona tu tipo de cuenta principal.';
      }
      return '';
    }
  },
  products_used: {
    element: form.products_used,
    validate: () => {
      if (selectedOptions(form.products_used).length === 0) {
        return 'Selecciona al menos un producto usado.';
      }
      return '';
    }
  },
  usage_frequency: {
    element: form.usage_frequency,
    validate: (value) => {
      if (!value) {
        return 'Selecciona la frecuencia de uso digital.';
      }
      return '';
    }
  },
  nps: {
    element: form.nps,
    validate: (value) => {
      if (value === '') {
        return 'El NPS es obligatorio.';
      }

      const parsed = Number(value);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
        return 'El NPS debe estar entre 0 y 100.';
      }
      return '';
    }
  },
  bank_site: {
    element: form.bank_site,
    validate: (value) => {
      if (!value) {
        return '';
      }

      try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return 'La URL debe iniciar con http:// o https://.';
        }
      } catch (_error) {
        return 'Ingresa una URL valida.';
      }

      return '';
    }
  },
  comments: {
    element: form.comments,
    validate: (value) => {
      if (!value) {
        return 'Comparte un comentario para continuar.';
      }
      if (value.length < 10) {
        return 'El comentario debe tener al menos 10 caracteres.';
      }
      return '';
    }
  }
};

function updateLiveWidgets() {
  const sat = Number(satisfaction.value || 0);
  const npsValue = Number(nps.value || 0);

  satisfactionOutput.textContent = String(sat);
  experienceMeter.value = npsValue;

  const completion = Math.min(100, Math.max(0, sat * 10));
  completionProgress.value = completion;
}

function selectedValues(nodeList) {
  return Array.from(nodeList).filter((node) => node.checked).map((node) => node.value);
}

function selectedOptions(select) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function fileName(input) {
  if (!input.files || input.files.length === 0) {
    return null;
  }

  return input.files[0].name;
}

function errorIdFor(element) {
  const token = element.id || element.name;
  return `error-${token}`;
}

function ensureErrorNode(element) {
  const errorId = errorIdFor(element);
  let node = document.getElementById(errorId);
  if (node) {
    return node;
  }

  node = document.createElement('p');
  node.id = errorId;
  node.className = 'field-error';
  node.setAttribute('data-testid', `survey-error-${element.name || element.id}`);
  node.hidden = true;
  element.insertAdjacentElement('afterend', node);
  return node;
}

function setFieldError(element, message) {
  const errorNode = ensureErrorNode(element);
  if (!message) {
    errorNode.textContent = '';
    errorNode.hidden = true;
    element.classList.remove('is-invalid');
    element.removeAttribute('aria-invalid');
    element.removeAttribute('aria-describedby');
    return;
  }

  errorNode.textContent = message;
  errorNode.hidden = false;
  element.classList.add('is-invalid');
  element.setAttribute('aria-invalid', 'true');
  element.setAttribute('aria-describedby', errorNode.id);
}

function ensureGroupErrorNode() {
  let node = document.getElementById('error-operations-group');
  if (node) {
    return node;
  }

  node = document.createElement('p');
  node.id = 'error-operations-group';
  node.className = 'field-error';
  node.setAttribute('data-testid', 'survey-error-operations');
  node.hidden = true;
  operationsGroup.insertAdjacentElement('afterend', node);
  return node;
}

function setOperationsError(message) {
  const errorNode = ensureGroupErrorNode();
  if (!message) {
    errorNode.textContent = '';
    errorNode.hidden = true;
    operationsGroup.classList.remove('group-invalid');
    return;
  }

  errorNode.textContent = message;
  errorNode.hidden = false;
  operationsGroup.classList.add('group-invalid');
}

function validateField(fieldName) {
  const config = fieldRules[fieldName];
  if (!config) {
    return true;
  }

  const value = config.element.value.trim();
  const error = config.validate(value);
  setFieldError(config.element, error);
  return !error;
}

function validateOperations() {
  const ops = selectedValues(form.querySelectorAll('input[name="operations"]'));
  const error = ops.length > 0 ? '' : 'Selecciona al menos una operacion frecuente.';
  setOperationsError(error);
  return !error;
}

function validateForm() {
  const fieldNames = Object.keys(fieldRules);
  const allFieldsValid = fieldNames.map((name) => validateField(name)).every(Boolean);
  const operationsValid = validateOperations();
  return allFieldsValid && operationsValid;
}

function collectFormData() {
  const data = {
    full_name: form.full_name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    country: form.country.value,
    age_range: form.age_range.value,
    account_type: form.account_type.value,
    main_product: form.main_product.value.trim(),
    channel: form.channel.value,
    operations: selectedValues(form.querySelectorAll('input[name="operations"]')),
    products_used: selectedOptions(form.products_used),
    usage_frequency: form.usage_frequency.value,
    satisfaction: Number(form.satisfaction.value),
    nps: Number(form.nps.value),
    preferred_date: form.preferred_date.value,
    preferred_time: form.preferred_time.value,
    theme_color: form.theme_color.value,
    avatar_file: fileName(form.avatar_file),
    bank_site: form.bank_site.value.trim(),
    comments: form.comments.value.trim(),
    allow_contact: form.allow_contact.checked,
    submitted_at: new Date().toISOString()
  };

  return data;
}

satisfaction.addEventListener('input', updateLiveWidgets);
nps.addEventListener('input', updateLiveWidgets);

Object.entries(fieldRules).forEach(([fieldName, config]) => {
  const eventName = config.element.tagName === 'SELECT' ? 'change' : 'input';
  config.element.addEventListener(eventName, () => {
    validateField(fieldName);
  });
  config.element.addEventListener('blur', () => {
    validateField(fieldName);
  });
});

form.querySelectorAll('input[name="operations"]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    validateOperations();
  });
});

form.addEventListener('reset', () => {
  window.requestAnimationFrame(() => {
    updateLiveWidgets();
    Object.values(fieldRules).forEach((config) => {
      setFieldError(config.element, '');
    });
    setOperationsError('');
    resultStatus.textContent = 'Status: formulario reiniciado';
    resultBox.textContent = 'Sin respuestas aun.';
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const isValid = validateForm();
  if (!isValid) {
    resultStatus.textContent = 'Status: corrige los campos en rojo';
    resultBox.textContent = 'El formulario tiene errores de validacion.';
    return;
  }

  const payload = collectFormData();

  resultStatus.textContent = 'Status: encuesta enviada';
  resultBox.textContent = JSON.stringify(payload, null, 2);
});

updateLiveWidgets();
