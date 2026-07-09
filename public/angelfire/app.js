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
  pendingInstallmentsPage: 1,
  pendingInstallmentsPerPage: 10,
  txPage: 1,
  txPerPage: 10,
  txFilter: 'all',
  adminUsersPage: 1,
  adminUsersPerPage: 10,
  adminPlanPage: 1,
  adminPlanPerPage: 10,
  adminInspectAccountLookup: '',
  adminInspectLoanId: '',
  adminInspectUserId: '',
  activeView: 'client',
  auditLog: []
};

const state = loadState();
let pendingInstallmentsCache = [];
let pendingPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let txPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let adminUsersPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let adminPlanPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };

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
  loanMonthlySummary: document.getElementById('loanMonthlySummary'),
  nextPendingInstallmentAmount: document.getElementById('nextPendingInstallmentAmount'),
  pendingInstallmentsRows: document.getElementById('pendingInstallmentsRows'),
  paidInstallmentsRows: document.getElementById('paidInstallmentsRows'),
  payLoanAmount: document.getElementById('payLoanAmount'),
  loanInstallmentsToPay: document.getElementById('loanInstallmentsToPay'),
  pendingInstallmentsPerPage: document.getElementById('pendingInstallmentsPerPage'),
  pendingInstallmentsPageInfo: document.getElementById('pendingInstallmentsPageInfo'),
  pendingPrevPageBtn: document.getElementById('pendingPrevPageBtn'),
  pendingNextPageBtn: document.getElementById('pendingNextPageBtn'),
  txFilter: document.getElementById('txFilter'),
  txPerPage: document.getElementById('txPerPage'),
  txPrevPageBtn: document.getElementById('txPrevPageBtn'),
  txNextPageBtn: document.getElementById('txNextPageBtn'),
  txPageInfo: document.getElementById('txPageInfo'),
  txRows: document.getElementById('txRows'),
  serviceId: document.getElementById('serviceId'),
  viewClientBtn: document.getElementById('viewClientBtn'),
  viewAdminBtn: document.getElementById('viewAdminBtn'),
  clientView: document.getElementById('clientView'),
  adminView: document.getElementById('adminView'),
  adminUsersCount: document.getElementById('adminUsersCount'),
  adminActiveLoans: document.getElementById('adminActiveLoans'),
  adminLoansAmount: document.getElementById('adminLoansAmount'),
  adminActivity: document.getElementById('adminActivity'),
  adminUsersPerPage: document.getElementById('adminUsersPerPage'),
  adminUsersPrevPageBtn: document.getElementById('adminUsersPrevPageBtn'),
  adminUsersNextPageBtn: document.getElementById('adminUsersNextPageBtn'),
  adminUsersPageInfo: document.getElementById('adminUsersPageInfo'),
  adminUsersRows: document.getElementById('adminUsersRows'),
  adminLookupAccountId: document.getElementById('adminLookupAccountId'),
  adminAccountSummary: document.getElementById('adminAccountSummary'),
  adminInspectLoanId: document.getElementById('adminInspectLoanId'),
  adminPlanPerPage: document.getElementById('adminPlanPerPage'),
  adminPlanPrevBtn: document.getElementById('adminPlanPrevBtn'),
  adminPlanNextBtn: document.getElementById('adminPlanNextBtn'),
  adminPlanPageInfo: document.getElementById('adminPlanPageInfo'),
  adminInstallmentsRows: document.getElementById('adminInstallmentsRows'),
  adminUserFilesRows: document.getElementById('adminUserFilesRows'),
  userFilesRows: document.getElementById('userFilesRows'),
  userFileInput: document.getElementById('userFileInput'),
  adminAuditLog: document.getElementById('adminAuditLog'),
  permClient: document.getElementById('permClient'),
  permAdmin: document.getElementById('permAdmin'),
  permManagerUsers: document.getElementById('permManagerUsers'),
  profileFirstName: document.getElementById('profileFirstName'),
  profileLastName: document.getElementById('profileLastName'),
  profileEmail: document.getElementById('profileEmail'),
  profilePhone: document.getElementById('profilePhone'),
  logoutBtn: document.getElementById('logoutBtn'),
  accountMaintenanceSection: document.getElementById('accountMaintenanceSection'),
  showProfileSectionBtn: document.getElementById('showProfileSectionBtn'),
  showSecuritySectionBtn: document.getElementById('showSecuritySectionBtn'),
  hideAccountSectionBtn: document.getElementById('hideAccountSectionBtn'),
  adminLoanRateHint: document.getElementById('adminLoanRateHint'),
  adminLoanPreviewRows: document.getElementById('adminLoanPreviewRows')
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

function toggleAccountMaintenance(mode) {
  const show = mode === 'profile' || mode === 'security';
  el.accountMaintenanceSection.classList.toggle('hidden', !show);

  if (mode === 'profile') {
    el.profileFirstName.focus();
  }

  if (mode === 'security') {
    document.getElementById('currentPin').focus();
  }
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
  const adminDateInput = document.getElementById('adminLoanFirstDueDate');
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  if (dateInput) {
    dateInput.value = d.toISOString().slice(0, 10);
  }
  if (adminDateInput) {
    adminDateInput.value = d.toISOString().slice(0, 10);
  }
}

function renderResponse(status, payload) {
  el.responseStatus.textContent = `Status: ${status}`;
  el.responseBox.textContent = JSON.stringify(payload, null, 2);
}

function clearFormFields(formNode) {
  if (!formNode) {
    return;
  }

  const controls = formNode.querySelectorAll('input, select, textarea');
  controls.forEach((control) => {
    if (control.tagName === 'SELECT') {
      control.selectedIndex = 0;
      return;
    }

    const inputType = (control.type || '').toLowerCase();
    if (inputType === 'checkbox' || inputType === 'radio') {
      control.checked = false;
      return;
    }

    control.value = '';
  });
}

function confirmMutationAction(message, formId) {
  const confirmed = window.confirm(message);
  if (!confirmed) {
    clearFormFields(document.getElementById(formId));
    renderResponse(200, { message: 'Operacion cancelada por el usuario.' });
  }
  return confirmed;
}

function formatTransactionType(type) {
  const labels = {
    deposit: 'Deposito',
    withdraw: 'Retiro',
    transfer: 'Transferencia',
    service_payment: 'Pago servicio',
    loan_payment: 'Pago prestamo',
    atm_deposit: 'Deposito ATM',
    atm_withdrawal: 'Retiro ATM'
  };
  return labels[type] || type || '-';
}

function updatePendingPaginationUi() {
  const page = pendingPaginationMeta.page || 1;
  const totalPages = pendingPaginationMeta.total_pages || 1;
  el.pendingInstallmentsPageInfo.textContent = `${page} / ${totalPages}`;
  el.pendingPrevPageBtn.disabled = !pendingPaginationMeta.has_prev;
  el.pendingNextPageBtn.disabled = !pendingPaginationMeta.has_next;
}

function updateTransactionsPaginationUi() {
  const page = txPaginationMeta.page || 1;
  const totalPages = txPaginationMeta.total_pages || 1;
  el.txPageInfo.textContent = `${page} / ${totalPages}`;
  el.txPrevPageBtn.disabled = !txPaginationMeta.has_prev;
  el.txNextPageBtn.disabled = !txPaginationMeta.has_next;
}

function updateAdminUsersPaginationUi() {
  const page = adminUsersPaginationMeta.page || 1;
  const totalPages = adminUsersPaginationMeta.total_pages || 1;
  el.adminUsersPageInfo.textContent = `${page} / ${totalPages}`;
  el.adminUsersPrevPageBtn.disabled = !adminUsersPaginationMeta.has_prev;
  el.adminUsersNextPageBtn.disabled = !adminUsersPaginationMeta.has_next;
}

function updateAdminPlanPaginationUi() {
  const page = adminPlanPaginationMeta.page || 1;
  const totalPages = adminPlanPaginationMeta.total_pages || 1;
  el.adminPlanPageInfo.textContent = `${page} / ${totalPages}`;
  el.adminPlanPrevBtn.disabled = !adminPlanPaginationMeta.has_prev;
  el.adminPlanNextBtn.disabled = !adminPlanPaginationMeta.has_next;
}

function signedAmountByMovement(tx) {
  const value = Number(tx.amount || 0).toFixed(2);
  if (tx.movement_kind === 'debit') {
    return `- ${value}`;
  }

  return `+ ${value}`;
}

function amountClassByMovement(tx) {
  return tx.movement_kind === 'debit' ? 'tx-amount-debit' : 'tx-amount-credit';
}

function estimatedAnnualRate(amount) {
  const value = Number(amount || 0);
  if (!value || value <= 0) {
    return null;
  }
  if (value <= 100000) {
    return 5.0;
  }
  if (value <= 200000) {
    return 5.5;
  }
  return 6.0;
}

function updateAdminLoanRateHintFromAmount() {
  const amount = Number(document.getElementById('adminLoanAmount').value || 0);
  const rate = estimatedAnnualRate(amount);
  if (!rate) {
    el.adminLoanRateHint.textContent = 'Interes anual: -';
    return;
  }
  el.adminLoanRateHint.textContent = `Interes anual estimado: ${rate.toFixed(2)}%`;
}

function getAdminLoanFormValues() {
  return {
    accountId: document.getElementById('adminLoanAccountId').value.trim(),
    amount: Number(document.getElementById('adminLoanAmount').value),
    termMonths: Number(document.getElementById('adminLoanTermMonths').value),
    firstDueDate: document.getElementById('adminLoanFirstDueDate').value
  };
}

function validateAdminLoanFormValues(values) {
  if (!values.accountId) {
    return 'Debes indicar account ID objetivo.';
  }
  if (!values.amount || values.amount <= 0) {
    return 'Debes indicar un monto valido mayor a cero.';
  }
  if (!values.termMonths || values.termMonths <= 0) {
    return 'Debes indicar un plazo en meses valido.';
  }
  if (!values.firstDueDate) {
    return 'Debes indicar la fecha de primera cuota.';
  }
  return null;
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function renderAdminInstallments(rows) {
  if (!rows || rows.length === 0) {
    el.adminInstallmentsRows.innerHTML = '<tr><td colspan="6">Sin plan cargado</td></tr>';
    return;
  }

  el.adminInstallmentsRows.innerHTML = rows
    .map(
      (item) =>
        `<tr><td>${item.installment_number}</td><td>${item.due_date || '-'}</td><td>${Number(item.amount || 0).toFixed(2)}</td><td>${Number(item.principal_amount || 0).toFixed(2)}</td><td>${Number(item.interest_amount || 0).toFixed(2)}</td><td>${item.status || '-'}</td></tr>`
    )
    .join('');
}

function updateLoanPaymentSummary() {
  if (!pendingInstallmentsCache || pendingInstallmentsCache.length === 0) {
    el.nextPendingInstallmentAmount.textContent = 'Proxima cuota pendiente: -';
    if (el.payLoanAmount.value === '' || Number(el.payLoanAmount.value) <= 0) {
      el.payLoanAmount.value = '0';
    }
    return;
  }

  const nextInstallment = pendingInstallmentsCache[0];
  el.nextPendingInstallmentAmount.textContent = `Proxima cuota pendiente: S/ ${Number(nextInstallment.amount || 0).toFixed(2)} (cuota #${nextInstallment.installment_number})`;
}

function calculatePendingInstallmentsAmount() {
  const installmentsCount = Math.max(Number(el.loanInstallmentsToPay.value || 1), 1);
  if (!pendingInstallmentsCache || pendingInstallmentsCache.length === 0) {
    return 0;
  }

  return pendingInstallmentsCache
    .slice(0, installmentsCount)
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);
}

async function calculateInstallmentsAmountFromApi(installmentsCount) {
  const wanted = Math.max(Number(installmentsCount || 1), 1);
  let collected = [];
  let page = 1;

  while (collected.length < wanted) {
    const payload = await apiCall(
      `/api/v1/accounts/${state.accountId}/loans/${state.loanId}/installments?page=${page}&per_page=50`,
      'GET'
    );

    const currentPageItems = payload.pending_installments || [];
    if (currentPageItems.length === 0) {
      break;
    }

    collected = collected.concat(currentPageItems);
    const meta = payload.pending_pagination || {};
    if (!meta.has_next) {
      break;
    }

    page += 1;
  }

  return collected
    .slice(0, wanted)
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);
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
    }
    el.loanMonthlySummary.textContent = `Cuota mensual: S/ ${Number(accountPayload.loan.monthly_payment || 0).toFixed(2)} | Interes anual: ${Number(accountPayload.loan.annual_interest_rate || 0).toFixed(2)}% | Plazo: ${accountPayload.loan.term_months || '-'} meses`;
  } else {
    el.loanStateValue.textContent = 'Sin prestamo activo';
    state.loanId = '';
    el.loanMonthlySummary.textContent = 'No hay prestamo activo.';
    el.pendingInstallmentsRows.innerHTML = '<tr><td colspan="5">Sin datos</td></tr>';
    el.paidInstallmentsRows.innerHTML = '<tr><td colspan="5">Sin datos</td></tr>';
    pendingInstallmentsCache = [];
    pendingPaginationMeta = { page: 1, per_page: Number(state.pendingInstallmentsPerPage || 10), total: 0, total_pages: 1, has_prev: false, has_next: false };
    updatePendingPaginationUi();
    updateLoanPaymentSummary();
  }

  const txPage = Number(state.txPage || 1);
  const txPerPage = Number(state.txPerPage || 10);
  const txFilter = state.txFilter || 'all';
  const txPayload = await apiCall(
    `/api/v1/accounts/${state.accountId}/transactions?page=${txPage}&per_page=${txPerPage}&transaction_filter=${encodeURIComponent(txFilter)}`,
    'GET'
  );
  const rows = Array.isArray(txPayload) ? txPayload : (txPayload.transactions || []);
  txPaginationMeta = {
    page: Number(txPayload.page || txPage),
    per_page: Number(txPayload.per_page || txPerPage),
    total: Number(txPayload.total || rows.length),
    total_pages: Number(txPayload.total_pages || 1),
    has_prev: Boolean(txPayload.has_prev),
    has_next: Boolean(txPayload.has_next)
  };
  state.txPage = txPaginationMeta.page;
  state.txPerPage = txPaginationMeta.per_page;
  persistState();
  if (rows.length === 0) {
    el.txRows.innerHTML = '<tr><td colspan="5">Sin movimientos</td></tr>';
  } else {
    el.txRows.innerHTML = rows
      .map(
        (tx) =>
          `<tr><td>${tx.id || '-'}</td><td>${formatTransactionType(tx.transaction_type)}</td><td class="${amountClassByMovement(tx)}">${signedAmountByMovement(tx)}</td><td>${tx.status || '-'}</td><td>${tx.created_at || '-'}</td></tr>`
      )
      .join('');
  }
  updateTransactionsPaginationUi();

  persistState();
  updateHeader();
}

function renderInstallmentsRows(rows, targetNode, dateField) {
  if (!rows || rows.length === 0) {
    targetNode.innerHTML = '<tr><td colspan="5">Sin datos</td></tr>';
    return;
  }

  targetNode.innerHTML = rows
    .map(
      (item) =>
        `<tr><td>${item.installment_number || '-'}</td><td>${item[dateField] || '-'}</td><td>${Number(item.amount || 0).toFixed(2)}</td><td>${Number(item.principal_amount || 0).toFixed(2)}</td><td>${Number(item.interest_amount || 0).toFixed(2)}</td></tr>`
    )
    .join('');
}

async function refreshInstallmentsForClient() {
  if (!state.accountId || !state.loanId) {
    el.pendingInstallmentsRows.innerHTML = '<tr><td colspan="5">Sin datos</td></tr>';
    el.paidInstallmentsRows.innerHTML = '<tr><td colspan="5">Sin datos</td></tr>';
    pendingInstallmentsCache = [];
    pendingPaginationMeta = { page: 1, per_page: Number(state.pendingInstallmentsPerPage || 10), total: 0, total_pages: 1, has_prev: false, has_next: false };
    updatePendingPaginationUi();
    updateLoanPaymentSummary();
    return;
  }

  const page = Number(state.pendingInstallmentsPage || 1);
  const perPage = Number(state.pendingInstallmentsPerPage || 10);
  const payload = await apiCall(`/api/v1/accounts/${state.accountId}/loans/${state.loanId}/installments?page=${page}&per_page=${perPage}`, 'GET');
  pendingInstallmentsCache = payload.pending_installments || [];
  pendingPaginationMeta = payload.pending_pagination || { page: 1, per_page: perPage, total: pendingInstallmentsCache.length, total_pages: 1, has_prev: false, has_next: false };
  state.pendingInstallmentsPage = Number(pendingPaginationMeta.page || 1);
  state.pendingInstallmentsPerPage = Number(pendingPaginationMeta.per_page || perPage);
  persistState();
  renderInstallmentsRows(payload.pending_installments || [], el.pendingInstallmentsRows, 'due_date');
  renderInstallmentsRows(payload.paid_installments || [], el.paidInstallmentsRows, 'paid_at');
  updatePendingPaginationUi();
  updateLoanPaymentSummary();
}

function renderAdminLoanPreview(schedule) {
  if (!schedule || schedule.length === 0) {
    el.adminLoanPreviewRows.innerHTML = '<tr><td colspan="5">Sin plan previsualizado</td></tr>';
    return;
  }

  el.adminLoanPreviewRows.innerHTML = schedule
    .map(
      (item) =>
        `<tr><td>${item.installment_number}</td><td>${item.due_date}</td><td>${Number(item.amount || 0).toFixed(2)}</td><td>${Number(item.principal_amount || 0).toFixed(2)}</td><td>${Number(item.interest_amount || 0).toFixed(2)}</td></tr>`
    )
    .join('');
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

async function refreshUserFiles() {
  if (!state.token || !state.userId) {
    return;
  }

  const payload = await apiCall(`/api/v1/users/${state.userId}/files`, 'GET');
  const files = payload.files || [];

  if (files.length === 0) {
    el.userFilesRows.innerHTML = '<tr><td colspan="5">Sin archivos</td></tr>';
    return;
  }

  el.userFilesRows.innerHTML = files
    .map(
      (file) =>
        `<tr><td>${file.id}</td><td>${file.original_filename}</td><td>${file.content_type}</td><td>${formatFileSize(file.file_size)}</td><td>${file.created_at || '-'}</td></tr>`
    )
    .join('');
}

async function refreshAdminFilesForSelectedUser() {
  const userId = state.adminInspectUserId;
  if (!userId) {
    el.adminUserFilesRows.innerHTML = '<tr><td colspan="5">Selecciona una cuenta para ver archivos</td></tr>';
    return;
  }

  const payload = await apiCall(`/api/v1/users/${userId}/files`, 'GET', null, 'manager');
  const files = payload.files || [];

  if (files.length === 0) {
    el.adminUserFilesRows.innerHTML = '<tr><td colspan="5">Sin archivos</td></tr>';
    return;
  }

  el.adminUserFilesRows.innerHTML = files
    .map(
      (file) =>
        `<tr><td>${file.id}</td><td>${file.original_filename}</td><td>${file.content_type}</td><td>${formatFileSize(file.file_size)}</td><td>${file.created_at || '-'}</td></tr>`
    )
    .join('');
}

async function refreshAdminLoanInstallments() {
  if (!state.adminInspectAccountLookup || !state.adminInspectLoanId) {
    renderAdminInstallments([]);
    adminPlanPaginationMeta = { page: 1, per_page: Number(state.adminPlanPerPage || 10), total: 0, total_pages: 1, has_prev: false, has_next: false };
    updateAdminPlanPaginationUi();
    return;
  }

  const page = Number(state.adminPlanPage || 1);
  const perPage = Number(state.adminPlanPerPage || 10);
  const payload = await apiCall(
    `/api/v1/manager/accounts/${state.adminInspectAccountLookup}/loans/${state.adminInspectLoanId}/installments?page=${page}&per_page=${perPage}`,
    'GET',
    null,
    'manager'
  );

  adminPlanPaginationMeta = {
    page: Number(payload.page || page),
    per_page: Number(payload.per_page || perPage),
    total: Number(payload.total || 0),
    total_pages: Number(payload.total_pages || 1),
    has_prev: Boolean(payload.has_prev),
    has_next: Boolean(payload.has_next)
  };
  state.adminPlanPage = adminPlanPaginationMeta.page;
  state.adminPlanPerPage = adminPlanPaginationMeta.per_page;
  persistState();

  renderAdminInstallments(payload.installments || []);
  updateAdminPlanPaginationUi();
}

async function refreshAdminAccountSummary(accountLookup) {
  const payload = await apiCall(`/api/v1/manager/accounts/${accountLookup}/summary`, 'GET', null, 'manager');
  state.adminInspectAccountLookup = String(accountLookup);
  state.adminInspectUserId = payload.user_id ? String(payload.user_id) : '';

  const loans = payload.loans || [];
  el.adminAccountSummary.textContent = `Cuenta #${payload.account_number} | Saldo: S/ ${Number(payload.balance || 0).toFixed(2)} | Usuario: ${payload.user_name || '-'} | Prestamos: ${loans.length}`;

  el.adminInspectLoanId.innerHTML = '';
  if (loans.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Sin prestamos';
    el.adminInspectLoanId.append(option);
    state.adminInspectLoanId = '';
  } else {
    loans.forEach((loan) => {
      const option = document.createElement('option');
      option.value = String(loan.id);
      option.textContent = `#${loan.id} | ${loan.status} | Monto ${Number(loan.amount || 0).toFixed(2)} | Pendiente ${Number(loan.outstanding_principal || 0).toFixed(2)}`;
      el.adminInspectLoanId.append(option);
    });
    state.adminInspectLoanId = payload.active_loan_id ? String(payload.active_loan_id) : String(loans[0].id);
    el.adminInspectLoanId.value = state.adminInspectLoanId;
  }

  state.adminPlanPage = 1;
  persistState();
  await refreshAdminLoanInstallments();
  await refreshAdminFilesForSelectedUser();
}

async function downloadAdminLoanPlan() {
  if (!state.adminInspectAccountLookup || !state.adminInspectLoanId) {
    throw new Error('Debes consultar cuenta y seleccionar un prestamo.');
  }

  const response = await fetch(
    `${state.baseUrl}/api/v1/manager/accounts/${state.adminInspectAccountLookup}/loans/${state.adminInspectLoanId}/installments/download`,
    {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
        Authorization: `Bearer ${state.managerToken || state.token}`
      }
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (_error) {
      payload = { raw: text };
    }
    throw new Error(payload.errors || 'No se pudo descargar el plan de pagos.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `loan_${state.adminInspectLoanId}_installments.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function uploadUserFile() {
  if (!state.token || !state.userId) {
    throw new Error('Debes iniciar sesion para subir archivos.');
  }

  const file = el.userFileInput.files && el.userFileInput.files[0];
  if (!file) {
    throw new Error('Debes seleccionar un archivo.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${state.baseUrl}/api/v1/users/${state.userId}/files`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${state.token}`
    },
    body: formData
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_error) {
    payload = { raw: text };
  }

  renderResponse(response.status, payload);
  if (!response.ok) {
    throw new Error(payload.errors || payload.error || 'No se pudo subir el archivo');
  }

  el.userFileInput.value = '';
  await refreshUserFiles();
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

  const usersPage = Number(state.adminUsersPage || 1);
  const usersPerPage = Number(state.adminUsersPerPage || 10);
  const usersPayload = await apiCall(
    `/api/v1/manager/users?page=${usersPage}&per_page=${usersPerPage}`,
    'GET',
    null,
    'manager'
  );
  const users = usersPayload.users || [];
  adminUsersPaginationMeta = {
    page: Number(usersPayload.page || usersPage),
    per_page: Number(usersPayload.per_page || usersPerPage),
    total: Number(usersPayload.total || users.length),
    total_pages: Number(usersPayload.total_pages || 1),
    has_prev: Boolean(usersPayload.has_prev),
    has_next: Boolean(usersPayload.has_next)
  };
  state.adminUsersPage = adminUsersPaginationMeta.page;
  state.adminUsersPerPage = adminUsersPaginationMeta.per_page;
  el.adminUsersCount.textContent = String(adminUsersPaginationMeta.total);
  pushAudit(`Consulta de usuarios manager total=${usersPayload.total || users.length}`);

  if (users.length === 0) {
    el.adminUsersRows.innerHTML = '<tr><td colspan="5">Sin usuarios</td></tr>';
  } else {
    el.adminUsersRows.innerHTML = users
      .map(
        (user) =>
          `<tr><td>${user.id}</td><td>${user.first_name} ${user.last_name}</td><td>${user.email}</td><td>${user.account_number || '-'}</td><td>${user.role}</td></tr>`
      )
      .join('');
  }
  updateAdminUsersPaginationUi();
  persistState();

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

function bindEvents() {
  document.getElementById('baseConfigForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.baseUrl = el.baseUrl.value.trim();
    persistState();
    renderResponse(200, { message: 'Base URL actualizada' });
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
    if (!confirmMutationAction('Confirmar deposito en la cuenta seleccionada?', 'depositForm')) {
      return;
    }

    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/deposit`, 'POST', {
        amount: Number(document.getElementById('depositAmount').value),
        description: document.getElementById('depositDescription').value.trim()
      });
      await refreshClientDashboard();
      await refreshInstallmentsForClient();
      clearFormFields(document.getElementById('depositForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('withdrawForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!confirmMutationAction('Confirmar retiro en la cuenta seleccionada?', 'withdrawForm')) {
      return;
    }

    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/withdraw`, 'POST', {
        amount: Number(document.getElementById('withdrawAmount').value),
        description: document.getElementById('withdrawDescription').value.trim()
      });
      await refreshClientDashboard();
      await refreshInstallmentsForClient();
      clearFormFields(document.getElementById('withdrawForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('payServiceForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!confirmMutationAction('Confirmar pago de servicio?', 'payServiceForm')) {
      return;
    }

    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/pay_service`, 'POST', {
        service_id: Number(document.getElementById('serviceId').value),
        amount: Number(document.getElementById('serviceAmount').value),
        description: document.getElementById('serviceDescription').value.trim()
      });
      await refreshClientDashboard();
      await refreshInstallmentsForClient();
      clearFormFields(document.getElementById('payServiceForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('refreshDashboard').addEventListener('click', async () => {
    try {
      await refreshClientDashboard();
      await refreshProfileData();
      await refreshInstallmentsForClient();
      await refreshUserFiles();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('uploadFileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!confirmMutationAction('Confirmar carga de archivo?', 'uploadFileForm')) {
      return;
    }

    try {
      await uploadUserFile();
      clearFormFields(document.getElementById('uploadFileForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('refreshFilesBtn').addEventListener('click', async () => {
    try {
      await refreshUserFiles();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('refreshInstallmentsBtn').addEventListener('click', async () => {
    try {
      await refreshInstallmentsForClient();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('loanCalculateAmountBtn').addEventListener('click', async () => {
    if (!state.accountId || !state.loanId) {
      renderResponse(422, { errors: 'No hay prestamo activo para calcular cuotas.' });
      return;
    }

    try {
      const installmentsCount = Math.max(Number(el.loanInstallmentsToPay.value || 1), 1);
      let amount = calculatePendingInstallmentsAmount();
      if (installmentsCount > pendingInstallmentsCache.length) {
        amount = await calculateInstallmentsAmountFromApi(installmentsCount);
      }
      el.payLoanAmount.value = amount > 0 ? String(amount.toFixed(2)) : '1';
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('payLoanForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.accountId || !state.loanId) {
      renderResponse(422, { errors: 'No hay prestamo activo para pagar.' });
      return;
    }
    if (!confirmMutationAction('Confirmar pago de cuotas del prestamo?', 'payLoanForm')) {
      return;
    }

    try {
      await apiCall(`/api/v1/accounts/${state.accountId}/loans/${state.loanId}/pay`, 'POST', {
        amount: Number(el.payLoanAmount.value)
      });
      await refreshClientDashboard();
      await refreshInstallmentsForClient();
      clearFormFields(document.getElementById('payLoanForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.pendingInstallmentsPerPage.addEventListener('change', async () => {
    state.pendingInstallmentsPerPage = Number(el.pendingInstallmentsPerPage.value || 10);
    state.pendingInstallmentsPage = 1;
    persistState();
    try {
      await refreshInstallmentsForClient();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.pendingPrevPageBtn.addEventListener('click', async () => {
    if (state.pendingInstallmentsPage <= 1) {
      return;
    }
    state.pendingInstallmentsPage -= 1;
    persistState();
    try {
      await refreshInstallmentsForClient();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.pendingNextPageBtn.addEventListener('click', async () => {
    const totalPages = pendingPaginationMeta.total_pages || 1;
    if (state.pendingInstallmentsPage >= totalPages) {
      return;
    }
    state.pendingInstallmentsPage += 1;
    persistState();
    try {
      await refreshInstallmentsForClient();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.txFilter.addEventListener('change', async () => {
    state.txFilter = el.txFilter.value;
    state.txPage = 1;
    persistState();
    try {
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.txPerPage.addEventListener('change', async () => {
    state.txPerPage = Number(el.txPerPage.value || 10);
    state.txPage = 1;
    persistState();
    try {
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.txPrevPageBtn.addEventListener('click', async () => {
    if (state.txPage <= 1) {
      return;
    }
    state.txPage -= 1;
    persistState();
    try {
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.txNextPageBtn.addEventListener('click', async () => {
    const totalPages = txPaginationMeta.total_pages || 1;
    if (state.txPage >= totalPages) {
      return;
    }
    state.txPage += 1;
    persistState();
    try {
      await refreshClientDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.showProfileSectionBtn.addEventListener('click', () => toggleAccountMaintenance('profile'));
  el.showSecuritySectionBtn.addEventListener('click', () => toggleAccountMaintenance('security'));
  el.hideAccountSectionBtn.addEventListener('click', () => toggleAccountMaintenance('hide'));

  document.getElementById('updateProfileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.userId) {
      renderResponse(401, { errors: 'Debes iniciar sesion para actualizar tus datos.' });
      return;
    }
    if (!confirmMutationAction('Confirmar actualizacion de datos del perfil?', 'updateProfileForm')) {
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
      clearFormFields(document.getElementById('updateProfileForm'));
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
    if (!confirmMutationAction('Confirmar cambio de PIN?', 'changePinForm')) {
      return;
    }

    try {
      await apiCall(`/api/v1/users/${state.userId}/pin`, 'PUT', {
        current_pin: document.getElementById('currentPin').value.trim(),
        new_pin: document.getElementById('newPin').value.trim()
      });
      clearFormFields(document.getElementById('changePinForm'));
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
    if (!confirmMutationAction('Confirmar creacion de usuario?', 'adminCreateUserForm')) {
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
      clearFormFields(document.getElementById('adminCreateUserForm'));
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
    if (!confirmMutationAction('Confirmar eliminacion de usuario?', 'adminDeleteUserForm')) {
      return;
    }

    const userId = document.getElementById('adminDeleteUserId').value.trim();
    try {
      await apiCall(`/api/v1/manager/users/${userId}`, 'DELETE', null, 'manager');
      pushAudit(`Eliminacion de usuario por manager user_id=${userId}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminDeleteUserForm'));
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

  document.getElementById('adminAccountLookupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }

    const lookup = el.adminLookupAccountId.value.trim();
    if (!lookup) {
      renderResponse(422, { errors: 'Debes indicar account ID o numero de cuenta.' });
      return;
    }

    try {
      await refreshAdminAccountSummary(lookup);
      pushAudit(`Consulta de cuenta admin lookup=${lookup}`);
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminInspectLoanId.addEventListener('change', async () => {
    state.adminInspectLoanId = el.adminInspectLoanId.value;
    state.adminPlanPage = 1;
    persistState();
    try {
      await refreshAdminLoanInstallments();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminPlanPerPage.addEventListener('change', async () => {
    state.adminPlanPerPage = Number(el.adminPlanPerPage.value || 10);
    state.adminPlanPage = 1;
    persistState();
    try {
      await refreshAdminLoanInstallments();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminPlanPrevBtn.addEventListener('click', async () => {
    if (state.adminPlanPage <= 1) {
      return;
    }
    state.adminPlanPage -= 1;
    persistState();
    try {
      await refreshAdminLoanInstallments();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminPlanNextBtn.addEventListener('click', async () => {
    const totalPages = adminPlanPaginationMeta.total_pages || 1;
    if (state.adminPlanPage >= totalPages) {
      return;
    }
    state.adminPlanPage += 1;
    persistState();
    try {
      await refreshAdminLoanInstallments();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminPlanDownloadBtn').addEventListener('click', async () => {
    try {
      await downloadAdminLoanPlan();
      renderResponse(200, { message: 'Plan de pagos descargado correctamente.' });
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('refreshAdminFilesBtn').addEventListener('click', async () => {
    try {
      await refreshAdminFilesForSelectedUser();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminUsersPerPage.addEventListener('change', async () => {
    state.adminUsersPerPage = Number(el.adminUsersPerPage.value || 10);
    state.adminUsersPage = 1;
    persistState();
    try {
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminUsersPrevPageBtn.addEventListener('click', async () => {
    if (state.adminUsersPage <= 1) {
      return;
    }
    state.adminUsersPage -= 1;
    persistState();
    try {
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  el.adminUsersNextPageBtn.addEventListener('click', async () => {
    const totalPages = adminUsersPaginationMeta.total_pages || 1;
    if (state.adminUsersPage >= totalPages) {
      return;
    }
    state.adminUsersPage += 1;
    persistState();
    try {
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminPreviewLoanBtn').addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }

    const values = getAdminLoanFormValues();
    const validationError = validateAdminLoanFormValues(values);
    if (validationError) {
      renderResponse(422, { errors: validationError });
      return;
    }

    try {
      const payload = await apiCall(`/api/v1/manager/accounts/${values.accountId}/loans/preview`, 'POST', {
        amount: values.amount,
        term_months: values.termMonths,
        first_due_date: values.firstDueDate
      }, 'manager');
      el.adminLoanRateHint.textContent = `Interes anual: ${Number(payload.annual_interest_rate || 0).toFixed(2)}% | Cuota mensual: S/ ${Number(payload.monthly_payment || 0).toFixed(2)}`;
      renderAdminLoanPreview(payload.projected_schedule || []);
      pushAudit(`Previsualizacion de prestamo manager account_id=${values.accountId}`);
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminLoanAmount').addEventListener('input', () => {
    updateAdminLoanRateHintFromAmount();
  });

  document.getElementById('adminCreateLoanBtn').addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }
    if (!confirmMutationAction('Confirmar creacion de prestamo?', 'adminCreateLoanForm')) {
      return;
    }

    const values = getAdminLoanFormValues();
    const validationError = validateAdminLoanFormValues(values);
    if (validationError) {
      renderResponse(422, { errors: validationError });
      return;
    }

    try {
      const payload = await apiCall(`/api/v1/manager/accounts/${values.accountId}/loans`, 'POST', {
        amount: values.amount,
        term_months: values.termMonths,
        first_due_date: values.firstDueDate
      }, 'manager');
      el.adminLoanRateHint.textContent = `Interes anual: ${Number(payload.loan.annual_interest_rate || 0).toFixed(2)}% | Cuota mensual: S/ ${Number(payload.loan.monthly_payment || 0).toFixed(2)}`;
      renderAdminLoanPreview(payload.loan.installments || []);
      pushAudit(`Creacion de prestamo por gerente account_id=${values.accountId} loan_id=${payload.loan.id}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminCreateLoanForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminDepositTargetBtn').addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }
    if (!confirmMutationAction('Confirmar deposito a cuenta de usuario?', 'adminAccountOpsForm')) {
      return;
    }

    const accountId = document.getElementById('adminTargetAccountId').value.trim();
    const amount = Number(document.getElementById('adminTargetAmount').value);
    if (!accountId) {
      renderResponse(422, { errors: 'Debes indicar account_id objetivo.' });
      return;
    }
    if (!amount || amount <= 0) {
      renderResponse(422, { errors: 'Debes indicar un monto valido mayor a cero.' });
      return;
    }
    try {
      await apiCall(`/api/v1/manager/accounts/${accountId}/deposit`, 'POST', {
        amount: amount,
        description: document.getElementById('adminTargetDescription').value.trim()
      }, 'manager');
      pushAudit(`Deposito por gerente sobre account_id=${accountId}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminAccountOpsForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminWithdrawTargetBtn').addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }
    if (!confirmMutationAction('Confirmar retiro de cuenta de usuario?', 'adminAccountOpsForm')) {
      return;
    }

    const accountId = document.getElementById('adminTargetAccountId').value.trim();
    const amount = Number(document.getElementById('adminTargetAmount').value);
    if (!accountId) {
      renderResponse(422, { errors: 'Debes indicar account_id objetivo.' });
      return;
    }
    if (!amount || amount <= 0) {
      renderResponse(422, { errors: 'Debes indicar un monto valido mayor a cero.' });
      return;
    }
    try {
      await apiCall(`/api/v1/manager/accounts/${accountId}/withdraw`, 'POST', {
        amount: amount,
        description: document.getElementById('adminTargetDescription').value.trim()
      }, 'manager');
      pushAudit(`Retiro por gerente sobre account_id=${accountId}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminAccountOpsForm'));
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminPayLoanTargetBtn').addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }
    if (!confirmMutationAction('Confirmar pago de prestamo del usuario?', 'adminAccountOpsForm')) {
      return;
    }

    const accountId = document.getElementById('adminTargetAccountId').value.trim();
    const loanId = document.getElementById('adminTargetLoanId').value.trim();
    const amount = Number(document.getElementById('adminTargetAmount').value);
    if (!accountId) {
      renderResponse(422, { errors: 'Debes indicar account_id objetivo.' });
      return;
    }
    if (!loanId) {
      renderResponse(422, { errors: 'Debes indicar loan_id para pago de prestamo.' });
      return;
    }
    if (!amount || amount <= 0) {
      renderResponse(422, { errors: 'Debes indicar un monto valido mayor a cero.' });
      return;
    }

    try {
      await apiCall(`/api/v1/manager/accounts/${accountId}/loans/${loanId}/pay`, 'POST', {
        amount: amount
      }, 'manager');
      pushAudit(`Pago de prestamo por gerente account_id=${accountId} loan_id=${loanId}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminAccountOpsForm'));
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
  const perPage = Number(state.pendingInstallmentsPerPage || 10);
  el.pendingInstallmentsPerPage.value = String([10, 20, 50].includes(perPage) ? perPage : 10);
  state.pendingInstallmentsPerPage = Number(el.pendingInstallmentsPerPage.value);
  state.pendingInstallmentsPage = Number(state.pendingInstallmentsPage || 1);
  const txPerPage = Number(state.txPerPage || 10);
  el.txPerPage.value = String([10, 20, 50].includes(txPerPage) ? txPerPage : 10);
  state.txPerPage = Number(el.txPerPage.value);
  el.txFilter.value = state.txFilter || 'all';
  state.txFilter = el.txFilter.value;
  state.txPage = Number(state.txPage || 1);
  const adminUsersPerPage = Number(state.adminUsersPerPage || 10);
  el.adminUsersPerPage.value = String([10, 20, 50].includes(adminUsersPerPage) ? adminUsersPerPage : 10);
  state.adminUsersPerPage = Number(el.adminUsersPerPage.value);
  state.adminUsersPage = Number(state.adminUsersPage || 1);
  const adminPlanPerPage = Number(state.adminPlanPerPage || 10);
  el.adminPlanPerPage.value = String([10, 20, 50].includes(adminPlanPerPage) ? adminPlanPerPage : 10);
  state.adminPlanPerPage = Number(el.adminPlanPerPage.value);
  state.adminPlanPage = Number(state.adminPlanPage || 1);
  if (state.adminInspectAccountLookup) {
    el.adminLookupAccountId.value = state.adminInspectAccountLookup;
  }
  updateAdminLoanRateHintFromAmount();
  updatePendingPaginationUi();
  updateTransactionsPaginationUi();
  updateAdminUsersPaginationUi();
  updateAdminPlanPaginationUi();
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
    await refreshInstallmentsForClient();
    await refreshUserFiles();
    if (hasManagerAccess()) {
      await refreshAdminDashboard();
      if (state.adminInspectAccountLookup) {
        await refreshAdminAccountSummary(state.adminInspectAccountLookup);
      }
    }
    setView(state.activeView || 'client');
  } catch (_error) {
    setView('client');
    renderResponse(200, { message: 'Listo para iniciar sesion y operar.' });
  }
}

init();
