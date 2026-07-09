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
  baseUrl: document.getElementById('baseUrl'),
  statusSummary: document.getElementById('statusSummary'),
  statusRole: document.getElementById('statusRole'),
  responseStatus: document.getElementById('responseStatus'),
  responseBox: document.getElementById('responseBox'),
  balanceValue: document.getElementById('balanceValue'),
  accountNumberValue: document.getElementById('accountNumberValue'),
  userNameValue: document.getElementById('userNameValue'),
  loanStateValue: document.getElementById('loanStateValue'),
  txRows: document.getElementById('txRows'),
  loanIdInput: document.getElementById('loanId'),
  serviceId: document.getElementById('serviceId'),
  viewClientBtn: document.getElementById('viewClientBtn'),
  viewAdminBtn: document.getElementById('viewAdminBtn'),
  clientView: document.getElementById('clientView'),
  adminView: document.getElementById('adminView'),
  adminUsersCount: document.getElementById('adminUsersCount'),
  adminActiveLoans: document.getElementById('adminActiveLoans'),
  adminLoansAmount: document.getElementById('adminLoansAmount'),
  adminActivity: document.getElementById('adminActivity'),
  adminUsersRows: document.getElementById('adminUsersRows'),
  adminAuditLog: document.getElementById('adminAuditLog'),
  permClient: document.getElementById('permClient'),
  permAdmin: document.getElementById('permAdmin'),
  permManagerUsers: document.getElementById('permManagerUsers'),
  profileFirstName: document.getElementById('profileFirstName'),
  profileLastName: document.getElementById('profileLastName'),
  profileEmail: document.getElementById('profileEmail'),
  profilePhone: document.getElementById('profilePhone'),
  logoutBtn: document.getElementById('logoutBtn')
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

function hasManagerAccess() {
  return state.role === 'manager' && Boolean(state.managerToken || state.token);
}

function hasClientAccess() {
  return Boolean(state.token);
}

function pushAudit(eventText) {
  const timestamp = new Date().toISOString();
  state.auditLog = [`${timestamp} | ${eventText}`, ...(state.auditLog || [])].slice(0, 80);
  persistState();
  renderAuditLog();
}

function renderAuditLog() {
  const items = state.auditLog || [];
  if (items.length === 0) {
    el.adminAuditLog.innerHTML = '<li>Sin eventos de auditoria</li>';
    return;
  }

  el.adminAuditLog.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function setPermissionBadge(node, enabled) {
  node.textContent = enabled ? 'Habilitado' : 'Bloqueado';
  node.classList.toggle('ok', enabled);
}

function renderPermissions() {
  setPermissionBadge(el.permClient, hasClientAccess());
  setPermissionBadge(el.permAdmin, hasManagerAccess());
  setPermissionBadge(el.permManagerUsers, hasManagerAccess());
}

function clearSession(keepBaseUrl = true) {
  const baseUrl = keepBaseUrl ? state.baseUrl : defaultState.baseUrl;
  Object.assign(state, { ...defaultState, baseUrl });
  persistState();
  renderAuditLog();
  updateHeader();
}

function updateHeader() {
  el.statusSummary.textContent = state.token ? 'Autenticado' : 'Sin autenticar';
  el.statusRole.textContent = `Rol: ${state.role || '-'}`;
  el.accountNumberValue.textContent = state.accountNumber || '-';
  el.userNameValue.textContent = state.fullName || '-';
  renderPermissions();
}

function setView(view) {
  if (view === 'admin' && !hasManagerAccess()) {
    renderResponse(403, { errors: 'La vista admin requiere autenticacion manager.' });
    return;
  }

  state.activeView = view;
  el.clientView.classList.toggle('hidden', view !== 'client');
  el.adminView.classList.toggle('hidden', view !== 'admin');
  el.viewClientBtn.classList.toggle('active-view', view === 'client');
  el.viewAdminBtn.classList.toggle('active-view', view === 'admin');
  persistState();
}

function setDefaultDate() {
  const dateInput = document.getElementById('loanFirstDueDate');
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  dateInput.value = d.toISOString().slice(0, 10);
}

function renderResponse(status, payload) {
  el.responseStatus.textContent = `Status: ${status}`;
  el.responseBox.textContent = JSON.stringify(payload, null, 2);
}

function buildAuthHeader(authType) {
  if (authType === 'manager') {
    const token = state.managerToken || state.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  if (authType === 'public') {
    return {};
  }

  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function apiCall(path, method, body, authType = 'user') {
  const headers = {
    Accept: 'application/json',
    ...buildAuthHeader(authType)
  };

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

async function refreshServices() {
  const payload = await apiCall('/api/v1/services', 'GET', null, 'public');
  const services = payload.services || payload || [];
  el.serviceId.innerHTML = '';
  services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = `${service.id} - ${service.name}`;
    el.serviceId.append(option);
  });
}

async function refreshClientDashboard() {
  if (!state.token || !state.accountId) {
    return;
  }

  const accountPayload = await apiCall(`/api/v1/accounts/${state.accountId}`, 'GET');
  el.balanceValue.textContent = `S/ ${Number(accountPayload.balance || 0).toFixed(2)}`;

  if (accountPayload.loan && accountPayload.loan.has_active_loan) {
    el.loanStateValue.textContent = `Activo | Pendiente: ${Number(accountPayload.loan.outstanding_principal || 0).toFixed(2)}`;
    if (accountPayload.loan.id) {
      state.loanId = String(accountPayload.loan.id);
      el.loanIdInput.value = state.loanId;
    }
  } else {
    el.loanStateValue.textContent = 'Sin prestamo activo';
  }

  const txPayload = await apiCall(`/api/v1/accounts/${state.accountId}/transactions`, 'GET');
  const rows = txPayload.transactions || [];
  if (rows.length === 0) {
    el.txRows.innerHTML = '<tr><td colspan="5">Sin movimientos</td></tr>';
  } else {
    el.txRows.innerHTML = rows
      .slice(0, 25)
      .map(
        (tx) =>
          `<tr><td>${tx.id || '-'}</td><td>${tx.transaction_type || '-'}</td><td>${Number(tx.amount || 0).toFixed(2)}</td><td>${tx.status || '-'}</td><td>${tx.created_at || '-'}</td></tr>`
      )
      .join('');
  }

  persistState();
  updateHeader();
}

async function refreshProfileData() {
  if (!state.token || !state.userId) {
    return;
  }

  const payload = await apiCall(`/api/v1/users/${state.userId}/profile`, 'GET');
  const user = payload.user || {};
  el.profileFirstName.value = user.first_name || '';
  el.profileLastName.value = user.last_name || '';
  el.profileEmail.value = user.email || '';
  el.profilePhone.value = user.phone || '';
}

function sumLoansAmount(loans) {
  return loans.reduce((total, item) => {
    const value = Number(item.outstanding_principal || item.amount || 0);
    return total + value;
  }, 0);
}

async function refreshAdminDashboard() {
  if (!hasManagerAccess()) {
    return;
  }

  const usersPayload = await apiCall('/api/v1/manager/users', 'GET', null, 'manager');
  const users = usersPayload.users || [];
  el.adminUsersCount.textContent = String(usersPayload.total || users.length);
  pushAudit(`Consulta de usuarios manager total=${usersPayload.total || users.length}`);

  if (users.length === 0) {
    el.adminUsersRows.innerHTML = '<tr><td colspan="4">Sin usuarios</td></tr>';
  } else {
    el.adminUsersRows.innerHTML = users
      .slice(0, 50)
      .map((user) => `<tr><td>${user.id}</td><td>${user.first_name} ${user.last_name}</td><td>${user.email}</td><td>${user.role}</td></tr>`)
      .join('');
  }

  const loansPayload = await apiCall('/api/v1/manager/reports/loans?status=active', 'GET', null, 'manager');
  const loans = loansPayload.loans || [];
  const totalLoans = loansPayload.total || loans.length;
  const totalAmount = sumLoansAmount(loans);
  el.adminActiveLoans.textContent = String(totalLoans);
  el.adminLoansAmount.textContent = `S/ ${totalAmount.toFixed(2)}`;
  pushAudit(`Consulta reporte prestamos activos=${totalLoans} monto=${totalAmount.toFixed(2)}`);

  const activityPayload = await apiCall('/api/v1/manager/reports/accounts_activity?days=30', 'GET', null, 'manager');
  if (activityPayload.total_transactions) {
    el.adminActivity.textContent = `${activityPayload.total_transactions} tx`;
  } else if (Array.isArray(activityPayload.accounts)) {
    el.adminActivity.textContent = `${activityPayload.accounts.length} cuentas`;
  } else {
    el.adminActivity.textContent = 'Disponible';
  }
  pushAudit('Consulta reporte de actividad de cuentas (30 dias)');
}

function captureLogin(payload, isAdminIntent) {
  state.token = payload.token || '';
  state.userId = payload.user ? String(payload.user.id) : '';
  state.accountId = payload.account ? String(payload.account.id) : '';
  state.accountNumber = payload.account ? String(payload.account.account_number) : '';
  state.fullName = payload.user ? `${payload.user.first_name} ${payload.user.last_name}` : '';
  state.role = payload.user ? payload.user.role : '-';

  if (state.role === 'manager') {
    state.managerToken = state.token;
    pushAudit('Sesion manager iniciada');
  }

  if (isAdminIntent && state.role !== 'manager') {
    renderResponse(403, { errors: 'Este usuario no tiene rol manager/admin.' });
    setView('client');
  }

  persistState();
  updateHeader();
  document.getElementById('loginAccountNumber').value = state.accountNumber;
}

async function login(isAdminIntent) {
  const accountNumber = document.getElementById('loginAccountNumber').value.trim();
  const pinRaw = document.getElementById('loginPin').value.trim();
  const pin = pinRaw || '1234';

  const payload = await apiCall('/api/v1/login', 'POST', {
    account_number: accountNumber,
    pin
  }, 'public');

  captureLogin(payload, isAdminIntent);
  await refreshServices();
  await refreshClientDashboard();
  await refreshProfileData();
  if (state.role === 'manager') {
    await refreshAdminDashboard();
    if (isAdminIntent) {
      setView('admin');
    }
  }
}

function bindEvents() {
  document.getElementById('baseConfigForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.baseUrl = el.baseUrl.value.trim();
    persistState();
    renderResponse(200, { message: 'Base URL actualizada' });
  });

  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = await apiCall('/api/v1/register', 'POST', {
        first_name: document.getElementById('regFirstName').value.trim(),
        last_name: document.getElementById('regLastName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        pin: document.getElementById('regPin').value.trim()
      }, 'public');
      captureLogin(payload, false);
      await refreshServices();
      await refreshClientDashboard();
      await refreshProfileData();
      setView('client');
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await login(false);
      setView('client');
    } catch (error) {
      renderResponse(401, { errors: error.message });
    }
  });

  document.getElementById('adminLoginBtn').addEventListener('click', async () => {
    try {
      await login(true);
    } catch (error) {
      renderResponse(401, { errors: error.message });
    }
  });

  el.viewClientBtn.addEventListener('click', () => setView('client'));
  el.viewAdminBtn.addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Debes ingresar como manager para abrir la vista admin.' });
      return;
    }
    try {
      await refreshAdminDashboard();
      setView('admin');
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('depositForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/deposit`, 'POST', {
        amount: Number(document.getElementById('depositAmount').value),
        description: document.getElementById('depositDescription').value.trim()
      });
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('withdrawForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/withdraw`, 'POST', {
        amount: Number(document.getElementById('withdrawAmount').value),
        description: document.getElementById('withdrawDescription').value.trim()
      });
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('payServiceForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/pay_service`, 'POST', {
        service_id: Number(document.getElementById('serviceId').value),
        amount: Number(document.getElementById('serviceAmount').value),
        description: document.getElementById('serviceDescription').value.trim()
      });
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('createLoanForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = await apiCall(`/api/v1/accounts/${state.accountId}/loans`, 'POST', {
        amount: Number(document.getElementById('loanAmount').value),
        term_months: Number(document.getElementById('loanTermMonths').value),
        first_due_date: document.getElementById('loanFirstDueDate').value
      });
      if (payload.loan && payload.loan.id) {
        state.loanId = String(payload.loan.id);
        el.loanIdInput.value = state.loanId;
        persistState();
      }
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('payLoanForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const loanId = document.getElementById('loanId').value.trim();
    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/loans/${loanId}/pay`, 'POST', {
        amount: Number(document.getElementById('payLoanAmount').value)
      });
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('refreshDashboard').addEventListener('click', async () => {
    try {
      await refreshClientDashboard();
      await refreshProfileData();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('updateProfileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.userId) {
      renderResponse(401, { errors: 'Debes iniciar sesion para actualizar tus datos.' });
      return;
    }

    const payload = {
      first_name: el.profileFirstName.value.trim(),
      last_name: el.profileLastName.value.trim(),
      email: el.profileEmail.value.trim()
    };

    const phone = el.profilePhone.value.trim();
    if (phone) {
      payload.phone = phone;
    }

    try {
      await apiCall(`/api/v1/users/${state.userId}`, 'PATCH', payload);
      state.fullName = `${payload.first_name} ${payload.last_name}`.trim();
      persistState();
      updateHeader();
      await refreshProfileData();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('changePinForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.userId) {
      renderResponse(401, { errors: 'Debes iniciar sesion para cambiar PIN.' });
      return;
    }

    try {
      await apiCall(`/api/v1/users/${state.userId}/pin`, 'PUT', {
        current_pin: document.getElementById('currentPin').value.trim(),
        new_pin: document.getElementById('newPin').value.trim()
      });
      document.getElementById('currentPin').value = '';
      document.getElementById('newPin').value = '';
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminCreateUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }

    const payload = {
      first_name: document.getElementById('adminFirstName').value.trim(),
      last_name: document.getElementById('adminLastName').value.trim(),
      email: document.getElementById('adminEmail').value.trim(),
      pin: document.getElementById('adminPin').value.trim(),
      role: document.getElementById('adminRole').value
    };
    const phone = document.getElementById('adminPhone').value.trim();
    if (phone) {
      payload.phone = phone;
    }

    try {
      await apiCall('/api/v1/manager/users', 'POST', payload, 'manager');
      pushAudit(`Creacion de usuario por manager email=${payload.email} role=${payload.role}`);
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminDeleteUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }

    const userId = document.getElementById('adminDeleteUserId').value.trim();
    try {
      await apiCall(`/api/v1/manager/users/${userId}`, 'DELETE', null, 'manager');
      pushAudit(`Eliminacion de usuario por manager user_id=${userId}`);
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('refreshAdminDashboard').addEventListener('click', async () => {
    try {
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.logoutBtn.addEventListener('click', () => {
    clearSession(true);
    window.location.href = '/angelfire/';
  });
}

function hydrateInputs() {
  el.baseUrl.value = state.baseUrl;
  document.getElementById('loginAccountNumber').value = state.accountNumber || '9000000001';
  el.loanIdInput.value = state.loanId;
  renderAuditLog();
  updateHeader();
}

async function init() {
  if (!state.token) {
    window.location.href = '/angelfire/';
    return;
  }

  hydrateInputs();
  setDefaultDate();
  bindEvents();
  try {
    await refreshServices();
    await refreshClientDashboard();
    await refreshProfileData();
    if (hasManagerAccess()) {
      await refreshAdminDashboard();
    }
    setView(state.activeView || 'client');
  } catch (_error) {
    setView('client');
    renderResponse(200, { message: 'Listo para iniciar sesion y operar.' });
  }
}

init();
