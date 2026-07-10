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
  toggleRegisterPinBtn: document.getElementById('toggleRegisterPinBtn')
};

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
      el.createdAccountNumber.textContent = createdAccountNumber || '-';
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

  document.getElementById('goDashboardBtn').addEventListener('click', () => {
    window.location.href = '/angelfire/dashboard.html';
  });
}

function init() {
  if (state.token) {
    window.location.href = '/angelfire/dashboard.html';
    return;
  }

  if (state.accountNumber) {
    el.loginAccountNumber.value = state.accountNumber;
    el.createdAccountNumber.textContent = state.accountNumber;
  }
  showRegisterForm(false);
  bindEvents();
}

init();
