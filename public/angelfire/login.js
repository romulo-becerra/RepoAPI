const storageKey = 'angelfire-dashboard-state';

const defaultState = {
  baseUrl: 'http://localhost:3001',
  token: '',
  managerToken: '',
  userId: '',
  accountId: '',
  accountNumber: '',
  fullName: '',
  role: '-',
  loanId: '',
  activeView: 'client',
  auditLog: []
};

const state = loadState();
const queryParams = new URLSearchParams(window.location.search);
const previewRatesMode = queryParams.get('showRates') === '1' || queryParams.get('mockRates') === '1';
let ratesLoaded = false;
let registrationStep = 0;
let ratesSource = queryParams.get('mockRates') === '1' ? 'mock' : 'real';

const el = {
  responseStatus: document.getElementById('responseStatus'),
  responseBox: document.getElementById('responseBox'),
  loginAccountNumber: document.getElementById('loginAccountNumber'),
  loginPin: document.getElementById('loginPin'),
  createdAccountNumber: document.getElementById('createdAccountNumber'),
  registrationSuccessCard: document.getElementById('registrationSuccessCard'),
  continueToLoginBtn: document.getElementById('continueToLoginBtn'),
  registerForm: document.getElementById('registerForm'),
  registrationReview: document.getElementById('registrationReview'),
  registerError: document.getElementById('registerError'),
  showRegisterBtn: document.getElementById('showRegisterBtn'),
  hideRegisterBtn: document.getElementById('hideRegisterBtn'),
  regPin: document.getElementById('regPin'),
  toggleLoginPinBtn: document.getElementById('toggleLoginPinBtn'),
  toggleRegisterPinBtn: document.getElementById('toggleRegisterPinBtn'),
  toggleRatesLink: document.getElementById('toggleRatesLink'),
  ratesPanel: document.getElementById('ratesPanel'),
  ratesApiMode: document.getElementById('ratesApiMode'),
  refreshRatesBtn: document.getElementById('refreshRatesBtn'),
  closeRatesBtn: document.getElementById('closeRatesBtn'),
  ratesTitle: document.getElementById('ratesTitle'),
  ratesUpdatedAt: document.getElementById('ratesUpdatedAt'),
  ratesSourceLink: document.getElementById('ratesSourceLink'),
  ratesOfficialBody: document.getElementById('ratesOfficialBody'),
  ratesCurrenciesBody: document.getElementById('ratesCurrenciesBody'),
  ratesUfvBody: document.getElementById('ratesUfvBody'),
  dynamicTableBody: document.getElementById('dynamicTableBody'),
  refreshDynamicTableBtn: document.getElementById('refreshDynamicTableBtn')
};

// Controls for showing/hiding the credential UI when needed
el.formsPanel = document.getElementById('formsPanel');
el.showCredentialsBtn = document.getElementById('showCredentialsBtn');
el.introCard = document.getElementById('introCard');
el.responseCard = document.getElementById('responseCard');
el.loginForm = document.getElementById('loginForm');

function renderDynamicWebTable() {
  if (!el.dynamicTableBody) {
    return;
  }

  const now = new Date();
  const rows = [
    ['Current time', now.toLocaleString(window.AngelFireI18n?.localeTag() || 'es-BO')],
    ['Is online', navigator.onLine ? 'true' : 'false'],
    ['Has token', state.token ? 'true' : 'false'],
    ['Last rates status', ratesLoaded ? 'loaded from API' : 'using local fallback']
  ];

  replaceRows(el.dynamicTableBody, rows);
}

function setRatesPanelOpen(open) {
  if (!el.ratesPanel || !el.toggleRatesLink) {
    return;
  }

  el.ratesPanel.classList.toggle('hidden', !open);
  el.toggleRatesLink.setAttribute('aria-expanded', String(open));
}

function normalizeCell(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
}

function replaceRows(tbody, rows) {
  if (!tbody || !Array.isArray(rows)) {
    return;
  }

  tbody.replaceChildren();

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cellValue) => {
      const td = document.createElement('td');
      td.textContent = normalizeCell(cellValue);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function replaceUfvRow(tbody, ufv) {
  if (!tbody || !ufv) {
    return;
  }

  tbody.replaceChildren();
  const tr = document.createElement('tr');

  const header = document.createElement('th');
  header.textContent = normalizeCell(ufv.country);
  tr.appendChild(header);

  [ufv.description, ufv.code, ufv.value].forEach((value) => {
    const td = document.createElement('td');
    td.textContent = normalizeCell(value);
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}

function renderRatesPayload(payload) {
  if (!payload) {
    return;
  }

  if (el.ratesTitle && payload.title) {
    el.ratesTitle.textContent = payload.title;
  }

  if (el.ratesSourceLink && payload.source_url) {
    el.ratesSourceLink.href = payload.source_url;
  }

  if (el.ratesUpdatedAt) {
    const status = payload.status === 'mock'
      ? 'respuesta simulada'
      : payload.status === 'ok'
        ? 'fuente BCB'
        : 'datos de respaldo';
    const updatedAt = payload.updated_at ? new Date(payload.updated_at).toLocaleString(window.AngelFireI18n?.localeTag() || 'es-BO') : 'sin fecha';
    el.ratesUpdatedAt.textContent = `Actualizacion: ${updatedAt} (${status})`;
  }

  if (payload.official_rate) {
    replaceRows(el.ratesOfficialBody, [[
      payload.official_rate.country,
      payload.official_rate.currency,
      payload.official_rate.code,
      payload.official_rate.tco_bs_usd
    ]]);
  }

  if (Array.isArray(payload.currencies) && payload.currencies.length > 0) {
    const rows = payload.currencies.map((row) => [
      row.country_region,
      row.currency,
      row.code,
      row.bs_per_unit,
      row.fx_rate
    ]);
    replaceRows(el.ratesCurrenciesBody, rows);
  }

  if (payload.ufv) {
    replaceUfvRow(el.ratesUfvBody, payload.ufv);
  }
}

async function loadCurrencyRates(force = false) {
  if (ratesLoaded && !force) {
    return;
  }

  try {
    const endpoint = ratesSource === 'mock'
      ? '/angelfire/mock-data/currency_rates.json'
      : '/api/v1/currency_rates';
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    const payload = await response.json();
    renderRatesPayload(payload);
    ratesLoaded = true;
  } catch (error) {
    console.error('No se pudieron consultar las cotizaciones.', error);
    if (el.ratesUpdatedAt) {
      el.ratesUpdatedAt.textContent = ratesSource === 'mock'
        ? 'Error: no se pudo consultar la respuesta simulada.'
        : 'Error: no se pudo consultar la API real; se conservan los datos visibles.';
    }
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    return { ...defaultState, ...(raw ? JSON.parse(raw) : {}) };
  } catch (_error) {
    return { ...defaultState };
  }
}

function persistState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function renderResponse(status, payload) {
  el.responseStatus.textContent = `Status: ${status}`;
  el.responseBox.textContent = JSON.stringify(payload, null, 2);
}

async function apiCall(path, method, body) {
  const headers = { Accept: 'application/json' };
  const options = { method, headers };

  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${state.baseUrl}${path}`, options);
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_error) {
    payload = { raw: text };
  }

  renderResponse(response.status, payload);
  if (!response.ok) {
    throw new Error(payload.errors || payload.error || 'Operacion fallida');
  }

  return payload;
}

function setSession(payload, isAdminIntent = false) {
  Object.assign(state, {
    ...defaultState,
    baseUrl: state.baseUrl || defaultState.baseUrl,
    token: '',
    managerToken: '',
    userId: '',
    accountId: '',
    accountNumber: '',
    fullName: '',
    role: '-',
    activeView: 'client',
    auditLog: []
  });

  state.token = payload.token || '';
  state.userId = payload.user ? String(payload.user.id) : '';
  state.accountId = payload.account ? String(payload.account.id) : '';
  state.accountNumber = payload.account ? String(payload.account.account_number) : '';
  state.fullName = payload.user ? `${payload.user.first_name} ${payload.user.last_name}` : '';
  state.role = payload.user ? String(payload.user.role) : '-';
  state.activeView =
    state.role === 'cashier' ? 'cashier'
      : state.role === 'customer_service' ? 'customer_service'
        : ['admin', 'manager'].includes(state.role) ? 'admin'
          : 'client';

  if (state.role !== 'customer') {
    state.managerToken = state.token;
  }

  persistState();
}

function togglePinVisibility(input, button) {
  const nextType = input.type === 'password' ? 'text' : 'password';
  input.type = nextType;
  button.textContent = nextType === 'password' ? 'Ver PIN' : 'Ocultar PIN';
}

function showRegisterForm(show) {
  if (el.registerForm) el.registerForm.classList.toggle('hidden', !show);
  if (el.loginForm) el.loginForm.classList.toggle('hidden', show);
  if (el.showRegisterBtn) el.showRegisterBtn.classList.toggle('hidden', show);
  if (el.responseCard) el.responseCard.classList.toggle('hidden', show);
  if (show && el.registrationSuccessCard) el.registrationSuccessCard.classList.add('hidden');
  if (show) setRegistrationStep(0);
}

function validateRegistrationStep(step) {
  const panel = el.registerForm.querySelector(`[data-registration-step-panel="${step}"]`);
  if (!panel) {
    return true;
  }

  const invalidField = [...panel.querySelectorAll('input, textarea, select')].find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    return false;
  }

  return true;
}

function addReviewField(label, value) {
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');
  description.textContent = value.trim() || '-';
  el.registrationReview.append(term, description);
}

function renderRegistrationReview() {
  if (!el.registrationReview) {
    return;
  }

  el.registrationReview.replaceChildren();
  [
    ['First Name', document.getElementById('regFirstName').value],
    ['Last Name', document.getElementById('regLastName').value],
    ['Email', document.getElementById('regEmail').value],
    ['Phone', document.getElementById('regPhone').value],
    ['Date of Birth', document.getElementById('regDateOfBirth').value],
    ['Country', document.getElementById('regCountry').value],
    ['City', document.getElementById('regCity').value],
    ['Province / State', document.getElementById('regProvince').value],
    ['Street', document.getElementById('regStreet').value],
    ['Street number', document.getElementById('regStreetNumber').value],
    ['District', document.getElementById('regDistrict').value],
    ['Postal code', document.getElementById('regPostalCode').value],
    ['Address reference', document.getElementById('regAddressReference').value]
  ].forEach(([label, value]) => addReviewField(label, value));
}

function setRegistrationStep(step) {
  if (!el.registerForm) {
    return;
  }

  registrationStep = Math.max(0, Math.min(Number(step) || 0, 2));
  if (el.registerError) {
    el.registerError.hidden = true;
    el.registerError.textContent = '';
  }
  el.registerForm.querySelectorAll('[data-registration-step-panel]').forEach((panel) => {
    const active = Number(panel.dataset.registrationStepPanel) === registrationStep;
    panel.classList.toggle('hidden', !active);
    panel.hidden = !active;
  });
  el.registerForm.querySelectorAll('[data-registration-step]').forEach((tab) => {
    const active = Number(tab.dataset.registrationStep) === registrationStep;
    tab.classList.toggle('is-current', active);
    tab.setAttribute('aria-selected', String(active));
    tab.setAttribute('tabindex', active ? '0' : '-1');
  });

  if (registrationStep === 2) {
    renderRegistrationReview();
  }
}

function goToRegistrationStep(step) {
  const target = Number(step);
  if (target > registrationStep) {
    for (let index = registrationStep; index < target; index += 1) {
      if (!validateRegistrationStep(index)) {
        return;
      }
    }
  }

  setRegistrationStep(target);
}

function showCredentials(show) {
  if (el.loginForm) el.loginForm.classList.toggle('hidden', !show);
  if (el.registerForm) el.registerForm.classList.toggle('hidden', true);
  if (el.responseCard) el.responseCard.classList.toggle('hidden', !show);
  if (el.introCard) el.introCard.classList.toggle('hidden', show);
  if (el.showRegisterBtn) el.showRegisterBtn.classList.toggle('hidden', !show);
}

async function performLogin(isAdminIntent = false) {
  const accountNumber = el.loginAccountNumber.value.trim();
  const pin = el.loginPin.value.trim() || '1234';

  const payload = await apiCall('/api/v1/login', 'POST', {
    account_number: accountNumber,
    pin
  });

  if (isAdminIntent && payload.user && !['admin', 'manager'].includes(payload.user.role)) {
    renderResponse(403, { errors: 'Este usuario no tiene rol Admin o Manager.' });
    return;
  }

  setSession(payload, isAdminIntent);
  window.location.href = '/angelfire/dashboard.html';
}

function bindEvents() {
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await performLogin(false);
    } catch (error) {
      renderResponse(401, { errors: error.message });
    }
  });

  document.getElementById('adminLoginBtn').addEventListener('click', async () => {
    try {
      await performLogin(true);
    } catch (error) {
      renderResponse(401, { errors: error.message });
    }
  });

  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const pin = document.getElementById('regPin').value.trim();
    if (!validateRegistrationStep(0) || !validateRegistrationStep(1)) {
      return;
    }

    if (el.registerError) {
      el.registerError.hidden = true;
      el.registerError.textContent = '';
    }

    try {
      const registerPayload = await apiCall('/api/v1/register', 'POST', {
        first_name: document.getElementById('regFirstName').value.trim(),
        last_name: document.getElementById('regLastName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        date_of_birth: document.getElementById('regDateOfBirth').value,
        pin,
        address: {
          country: document.getElementById('regCountry').value.trim(),
          city: document.getElementById('regCity').value.trim(),
          province: document.getElementById('regProvince').value.trim(),
          street: document.getElementById('regStreet').value.trim(),
          street_number: document.getElementById('regStreetNumber').value.trim(),
          district: document.getElementById('regDistrict').value.trim(),
          postal_code: document.getElementById('regPostalCode').value.trim(),
          reference: document.getElementById('regAddressReference').value.trim()
        }
      });

      const createdAccountNumber = registerPayload.account ? registerPayload.account.account_number : '';
      if (el.createdAccountNumber) el.createdAccountNumber.textContent = createdAccountNumber || '-';
      el.loginAccountNumber.value = createdAccountNumber || '';
      el.loginPin.value = pin;

      renderResponse(201, {
        message: 'Usuario registrado correctamente. Usa este account_number para hacer login.',
        account_number: createdAccountNumber
      });
      showRegisterForm(false);
      if (el.registrationSuccessCard) el.registrationSuccessCard.classList.remove('hidden');
    } catch (error) {
      if (el.registerError) {
        el.registerError.textContent = error.message;
        el.registerError.hidden = false;
      }
      renderResponse(422, { errors: error.message });
    }
  });

  el.showRegisterBtn.addEventListener('click', () => showRegisterForm(true));
  el.hideRegisterBtn.addEventListener('click', () => showRegisterForm(false));
  if (el.continueToLoginBtn) {
    el.continueToLoginBtn.addEventListener('click', () => {
      el.loginForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.loginPin.focus();
    });
  }
  el.registerForm.querySelectorAll('[data-registration-step]').forEach((tab) => {
    tab.addEventListener('click', () => goToRegistrationStep(tab.dataset.registrationStep));
  });
  el.registerForm.querySelectorAll('[data-registration-next]').forEach((button) => {
    button.addEventListener('click', () => goToRegistrationStep(button.dataset.registrationNext));
  });
  el.registerForm.querySelectorAll('[data-registration-back]').forEach((button) => {
    button.addEventListener('click', () => goToRegistrationStep(button.dataset.registrationBack));
  });
  document.getElementById('cancelRegisterConfirmBtn').addEventListener('click', () => showRegisterForm(false));

  el.toggleLoginPinBtn.addEventListener('click', () => {
    togglePinVisibility(el.loginPin, el.toggleLoginPinBtn);
  });

  el.toggleRegisterPinBtn.addEventListener('click', () => {
    togglePinVisibility(el.regPin, el.toggleRegisterPinBtn);
  });

  if (el.toggleRatesLink && el.ratesPanel) {
    el.toggleRatesLink.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = !el.ratesPanel.classList.contains('hidden');
      const nextOpen = !isOpen;
      setRatesPanelOpen(nextOpen);

      if (nextOpen) {
        loadCurrencyRates();
      }
    });
  }

  if (el.closeRatesBtn) {
    el.closeRatesBtn.addEventListener('click', () => {
      setRatesPanelOpen(false);
    });
  }

  if (el.ratesApiMode) {
    el.ratesApiMode.value = ratesSource;
    el.ratesApiMode.addEventListener('change', () => {
      ratesSource = el.ratesApiMode.value;
      ratesLoaded = false;
      loadCurrencyRates();
    });
  }

  if (el.refreshRatesBtn) {
    el.refreshRatesBtn.addEventListener('click', () => {
      loadCurrencyRates(true);
    });
  }

  if (el.refreshDynamicTableBtn) {
    el.refreshDynamicTableBtn.addEventListener('click', () => {
      renderDynamicWebTable();
    });
  }

  if (el.showCredentialsBtn) {
    el.showCredentialsBtn.addEventListener('click', () => showCredentials(true));
  }

  const goDashboardBtn = document.getElementById('goDashboardBtn');
  if (goDashboardBtn) {
    goDashboardBtn.addEventListener('click', () => {
      window.location.href = '/angelfire/dashboard.html';
    });
  }
}

function init() {
  if (state.token && !previewRatesMode) {
    window.location.href = '/angelfire/dashboard.html';
    return;
  }

  if (state.accountNumber) {
    el.loginAccountNumber.value = state.accountNumber;
    if (el.createdAccountNumber) el.createdAccountNumber.textContent = state.accountNumber;
  }

  showCredentials(true);
  showRegisterForm(false);

  const showParam = queryParams.get('show') || queryParams.get('showLogin');
  const shouldShow = showParam === '1' || showParam === 'true';
  if (shouldShow) {
    showCredentials(true);
  }

  const registerParam = queryParams.get('register');
  const hashRegister = window.location.hash === '#register';
  if (registerParam === '1' || registerParam === 'true' || hashRegister) {
    showRegisterForm(true);
  }

  bindEvents();

  if (previewRatesMode) {
    setRatesPanelOpen(true);
    loadCurrencyRates();
  }

  renderDynamicWebTable();
}

init();
