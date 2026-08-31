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
const previewRatesMode = queryParams.get('showRates') === '1';
let ratesLoaded = false;

const el = {
  responseStatus: document.getElementById('responseStatus'),
  responseBox: document.getElementById('responseBox'),
  loginAccountNumber: document.getElementById('loginAccountNumber'),
  loginPin: document.getElementById('loginPin'),
  createdAccountNumber: document.getElementById('createdAccountNumber'),
  registerForm: document.getElementById('registerForm'),
  showRegisterBtn: document.getElementById('showRegisterBtn'),
  hideRegisterBtn: document.getElementById('hideRegisterBtn'),
  regPin: document.getElementById('regPin'),
  toggleLoginPinBtn: document.getElementById('toggleLoginPinBtn'),
  toggleRegisterPinBtn: document.getElementById('toggleRegisterPinBtn'),
  toggleRatesLink: document.getElementById('toggleRatesLink'),
  ratesPanel: document.getElementById('ratesPanel'),
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
el.responseCard = document.getElementById('responseCard');

function renderDynamicWebTable() {
  if (!el.dynamicTableBody) {
    return;
  }

  const now = new Date();
  const rows = [
    ['Current time', now.toLocaleString('es-BO')],
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
    const status = payload.status === 'ok' ? 'fuente BCB' : 'datos de respaldo';
    const updatedAt = payload.updated_at ? new Date(payload.updated_at).toLocaleString('es-BO') : 'sin fecha';
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

async function loadCurrencyRates() {
  if (ratesLoaded) {
    return;
  }

  try {
    const response = await fetch('/api/v1/currency_rates', {
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
  } catch (_error) {
    if (el.ratesUpdatedAt) {
      el.ratesUpdatedAt.textContent = 'Actualizacion: no se pudo consultar API, usando tabla local.';
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
  state.token = payload.token || '';
  state.userId = payload.user ? String(payload.user.id) : '';
  state.accountId = payload.account ? String(payload.account.id) : '';
  state.accountNumber = payload.account ? String(payload.account.account_number) : '';
  state.fullName = payload.user ? `${payload.user.first_name} ${payload.user.last_name}` : '';
  state.role = payload.user ? payload.user.role : '-';
  state.activeView = state.role === 'manager' ? 'admin' : 'client';

  if (state.role === 'manager') {
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
  el.registerForm.classList.toggle('hidden', !show);
  el.showRegisterBtn.classList.toggle('hidden', show);
}

function showCredentials(show) {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.classList.toggle('hidden', !show);
  if (el.registerForm) el.registerForm.classList.toggle('hidden', !show);
  if (el.responseCard) el.responseCard.classList.toggle('hidden', !show);
}

async function performLogin(isAdminIntent = false) {
  const accountNumber = el.loginAccountNumber.value.trim();
  const pin = el.loginPin.value.trim() || '1234';

  const payload = await apiCall('/api/v1/login', 'POST', {
    account_number: accountNumber,
    pin
  });

  if (isAdminIntent && payload.user && payload.user.role !== 'manager') {
    renderResponse(403, { errors: 'Este usuario no tiene rol manager/admin.' });
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

    try {
      const registerPayload = await apiCall('/api/v1/register', 'POST', {
        first_name: document.getElementById('regFirstName').value.trim(),
        last_name: document.getElementById('regLastName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        pin
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
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.showRegisterBtn.addEventListener('click', () => showRegisterForm(true));
  el.hideRegisterBtn.addEventListener('click', () => showRegisterForm(false));

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
  showRegisterForm(false);
  // Hide credentials by default; show only when requested via query param or button
  const showParam = queryParams.get('show') || queryParams.get('showLogin');
  const shouldShow = showParam === '1' || showParam === 'true';
  showCredentials(Boolean(shouldShow));
  bindEvents();

  if (previewRatesMode) {
    setRatesPanelOpen(true);
    loadCurrencyRates();
  }

  renderDynamicWebTable();
}

init();
