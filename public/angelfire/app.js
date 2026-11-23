const storageKey = 'angelfire-dashboard-state';
const BALANCE_AUTO_REFRESH_MS = 15000;

function defaultApiBaseUrl() {
  const currentUrl = new URL(window.location.origin);
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];

  if (localHosts.includes(currentUrl.hostname) && currentUrl.port === '8000') {
    return `${currentUrl.protocol}//${currentUrl.hostname}:3001`;
  }

  return currentUrl.origin;
}

const defaultState = {
  baseUrl: defaultApiBaseUrl(),
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
  txActorFilter: 'all',
  adminUsersPage: 1,
  adminUsersPerPage: 10,
  adminPlanPage: 1,
  adminPlanPerPage: 10,
  adminInspectAccountLookup: '',
  adminInspectLoanId: '',
  adminInspectUserId: '',
  balanceAutoRefresh: false,
  activeView: 'client',
  opsPeriod: 'day',
  opsDate: '',
  opsType: 'all',
  opsActor: 'all',
  opsPage: 1,
  opsPerPage: 10,
  loginsPeriod: 'day',
  loginsDate: '',
  loginsStatus: 'all',
  loginsPage: 1,
  loginsPerPage: 10,
  auditLog: [],
  selectedAdminUserId: ''
};

const state = loadState();
let pendingInstallmentsCache = [];
let pendingPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let txPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let adminUsersPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let adminPlanPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let adminPreviewScheduleCache = [];
let adminPreviewPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let opsPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let opsRequestId = 0;
let loginsPaginationMeta = { page: 1, per_page: 10, total: 0, total_pages: 1, has_prev: false, has_next: false };
let loginsRequestId = 0;
let selectedCustomerServiceUserId = '';
let adminInstallmentsStatusTotalsCache = {};
let currentAdminOperation = '';
let modalDecisionResolver = null;
let modalCloseTimer = null;
let balanceAutoRefreshTimer = null;

const el = {
  baseUrl: document.getElementById('baseUrl'),
  statusSummary: document.getElementById('statusSummary'),
  statusRole: document.getElementById('statusRole'),
  headerUserName: document.getElementById('headerUserName'),
  headerUserId: document.getElementById('headerUserId'),
  headerAccountNumber: document.getElementById('headerAccountNumber'),
  responseStatus: document.getElementById('responseStatus'),
  responseBox: document.getElementById('responseBox'),
  balanceValue: document.getElementById('balanceValue'),
  balanceAutoIndicator: document.getElementById('balanceAutoIndicator'),
  refreshBalanceBtn: document.getElementById('refreshBalanceBtn'),
  autoRefreshBalanceToggle: document.getElementById('autoRefreshBalanceToggle'),
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
  txActorFilter: document.getElementById('txActorFilter'),
  txPerPage: document.getElementById('txPerPage'),
  txPrevPageBtn: document.getElementById('txPrevPageBtn'),
  txNextPageBtn: document.getElementById('txNextPageBtn'),
  txPageInfo: document.getElementById('txPageInfo'),
  txRows: document.getElementById('txRows'),
  serviceId: document.getElementById('serviceId'),
  viewClientBtn: document.getElementById('viewClientBtn'),
  viewCashierBtn: document.getElementById('viewCashierBtn'),
  viewCustomerServiceBtn: document.getElementById('viewCustomerServiceBtn'),
  viewAdminBtn: document.getElementById('viewAdminBtn'),
  clientView: document.getElementById('clientView'),
  adminView: document.getElementById('adminView'),
  cashierView: document.getElementById('cashierView'),
  customerServiceView: document.getElementById('customerServiceView'),
  adminUsersCount: document.getElementById('adminUsersCount'),
  adminActiveLoans: document.getElementById('adminActiveLoans'),
  adminLoansAmount: document.getElementById('adminLoansAmount'),
  adminActivity: document.getElementById('adminActivity'),
  adminDashboardCustomers: document.getElementById('adminDashboardCustomers'),
  adminDashboardAccounts: document.getElementById('adminDashboardAccounts'),
  adminDashboardTransactions: document.getElementById('adminDashboardTransactions'),
  adminDashboardIncome: document.getElementById('adminDashboardIncome'),
  adminDashboardExpenses: document.getElementById('adminDashboardExpenses'),
  adminDashboardOverdue: document.getElementById('adminDashboardOverdue'),
  adminDashboardSecurity: document.getElementById('adminDashboardSecurity'),
  adminRolesRows: document.getElementById('adminRolesRows'),
  refreshRolesBtn: document.getElementById('refreshRolesBtn'),
  accountingBalanceGeneral: document.getElementById('accountingBalanceGeneral'),
  accountingIncome: document.getElementById('accountingIncome'),
  accountingExpenses: document.getElementById('accountingExpenses'),
  accountingCashIn: document.getElementById('accountingCashIn'),
  accountingDailyRows: document.getElementById('accountingDailyRows'),
  refreshAccountingBtn: document.getElementById('refreshAccountingBtn'),
  adminUsersPerPage: document.getElementById('adminUsersPerPage'),
  adminUsersPrevPageBtn: document.getElementById('adminUsersPrevPageBtn'),
  adminUsersNextPageBtn: document.getElementById('adminUsersNextPageBtn'),
  adminUsersPageInfo: document.getElementById('adminUsersPageInfo'),
  adminUsersRows: document.getElementById('adminUsersRows'),
  adminClientLookupForm: document.getElementById('adminClientLookupForm'),
  adminClientLookupQuery: document.getElementById('adminClientLookupQuery'),
  adminClientLookupValidation: document.getElementById('adminClientLookupValidation'),
  adminClientLookupResults: document.getElementById('adminClientLookupResults'),
  adminClientProfile: document.getElementById('adminClientProfile'),
  adminClientName: document.getElementById('adminClientName'),
  adminClientMeta: document.getElementById('adminClientMeta'),
  adminClientStatus: document.getElementById('adminClientStatus'),
  adminClientAccounts: document.getElementById('adminClientAccounts'),
  adminClientEditForm: document.getElementById('adminClientEditForm'),
  adminClientFirstName: document.getElementById('adminClientFirstName'),
  adminClientLastName: document.getElementById('adminClientLastName'),
  adminClientEmail: document.getElementById('adminClientEmail'),
  adminClientPhone: document.getElementById('adminClientPhone'),
  adminClientBlockBtn: document.getElementById('adminClientBlockBtn'),
  adminClientUnblockBtn: document.getElementById('adminClientUnblockBtn'),
  adminClientDeactivateBtn: document.getElementById('adminClientDeactivateBtn'),
  adminClientForcePasswordBtn: document.getElementById('adminClientForcePasswordBtn'),
  adminClientDeleteBtn: document.getElementById('adminClientDeleteBtn'),
  adminLookupAccountId: document.getElementById('adminLookupAccountId'),
  adminAccountLookupValidation: document.getElementById('adminAccountLookupValidation'),
  adminAccountSummary: document.getElementById('adminAccountSummary'),
  adminAccountLoanPlanSection: document.getElementById('adminAccountLoanPlanSection'),
  adminInspectLoanId: document.getElementById('adminInspectLoanId'),
  adminPlanPerPage: document.getElementById('adminPlanPerPage'),
  adminPlanPrevBtn: document.getElementById('adminPlanPrevBtn'),
  adminPlanNextBtn: document.getElementById('adminPlanNextBtn'),
  adminPlanPageInfo: document.getElementById('adminPlanPageInfo'),
  adminInstallmentsRows: document.getElementById('adminInstallmentsRows'),
  adminInstallmentsPaidCount: document.getElementById('adminInstallmentsPaidCount'),
  adminInstallmentsPendingCount: document.getElementById('adminInstallmentsPendingCount'),
  adminUserFilesRows: document.getElementById('adminUserFilesRows'),
  contactForm: document.getElementById('contactForm'),
  contactName: document.getElementById('contactName'),
  contactPhone: document.getElementById('contactPhone'),
  contactsStatus: document.getElementById('contactsStatus'),
  contactsList: document.getElementById('contactsList'),
  contactsCount: document.getElementById('contactsCount'),
  userFilesRows: document.getElementById('userFilesRows'),
  userFileInput: document.getElementById('userFileInput'),
  adminAuditLog: document.getElementById('adminAuditLog'),
  opsPeriod: document.getElementById('opsPeriod'),
  opsDate: document.getElementById('opsDate'),
  opsType: document.getElementById('opsType'),
  opsActor: document.getElementById('opsActor'),
  opsPerPage: document.getElementById('opsPerPage'),
  opsRows: document.getElementById('opsRows'),
  opsSummary: document.getElementById('opsSummary'),
  opsPageInfo: document.getElementById('opsPageInfo'),
  opsPrevPageBtn: document.getElementById('opsPrevPageBtn'),
  opsNextPageBtn: document.getElementById('opsNextPageBtn'),
  opsRefreshBtn: document.getElementById('refreshOpsBtn'),
  opsDownloadBtn: document.getElementById('opsDownloadBtn'),
  loginsPeriod: document.getElementById('loginsPeriod'),
  loginsDate: document.getElementById('loginsDate'),
  loginsStatus: document.getElementById('loginsStatus'),
  loginsPerPage: document.getElementById('loginsPerPage'),
  loginsRows: document.getElementById('loginsRows'),
  loginsSummary: document.getElementById('loginsSummary'),
  loginsPageInfo: document.getElementById('loginsPageInfo'),
  loginsPrevPageBtn: document.getElementById('loginsPrevPageBtn'),
  loginsNextPageBtn: document.getElementById('loginsNextPageBtn'),
  loginsRefreshBtn: document.getElementById('refreshLoginsBtn'),
  loginsDownloadBtn: document.getElementById('loginsDownloadBtn'),
  permClient: document.getElementById('permClient'),
  permAdmin: document.getElementById('permAdmin'),
  permCashier: document.getElementById('permCashier'),
  permCustomerService: document.getElementById('permCustomerService'),
  permManagerUsers: document.getElementById('permManagerUsers'),
  profileFirstName: document.getElementById('profileFirstName'),
  profileLastName: document.getElementById('profileLastName'),
  profileEmail: document.getElementById('profileEmail'),
  profilePhone: document.getElementById('profilePhone'),
  profileDateOfBirth: document.getElementById('profileDateOfBirth'),
  basicAuthEmail: document.getElementById('basicAuthEmail'),
  basicAuthPassword: document.getElementById('basicAuthPassword'),
  basicAuthPasswordConfirmation: document.getElementById('basicAuthPasswordConfirmation'),
  apiKeysPanel: document.getElementById('apiKeysPanel'),
  apiKeyName: document.getElementById('apiKeyName'),
  apiKeySecretResult: document.getElementById('apiKeySecretResult'),
  apiKeySecretValue: document.getElementById('apiKeySecretValue'),
  apiKeysRows: document.getElementById('apiKeysRows'),
  logoutBtn: document.getElementById('logoutBtn'),
  accountMaintenanceSection: document.getElementById('accountMaintenanceSection'),
  showProfileSectionBtn: document.getElementById('showProfileSectionBtn'),
  showSecuritySectionBtn: document.getElementById('showSecuritySectionBtn'),
  showBasicAuthSectionBtn: document.getElementById('showBasicAuthSectionBtn'),
  showApiKeysSectionBtn: document.getElementById('showApiKeysSectionBtn'),
  hideAccountSectionBtn: document.getElementById('hideAccountSectionBtn'),
  adminLoanRateHint: document.getElementById('adminLoanRateHint'),
  adminLoanPreviewModal: document.getElementById('adminLoanPreviewModal'),
  adminLoanPreviewModalCard: document.querySelector('#adminLoanPreviewModal .action-modal-card'),
  adminLoanPreviewMeta: document.getElementById('adminLoanPreviewMeta'),
  adminLoanPreviewModalRows: document.getElementById('adminLoanPreviewModalRows'),
  adminLoanPreviewPerPage: document.getElementById('adminLoanPreviewPerPage'),
  adminLoanPreviewPrevBtn: document.getElementById('adminLoanPreviewPrevBtn'),
  adminLoanPreviewNextBtn: document.getElementById('adminLoanPreviewNextBtn'),
  adminLoanPreviewPageInfo: document.getElementById('adminLoanPreviewPageInfo'),
  adminLoanPreviewCloseBtn: document.getElementById('adminLoanPreviewCloseBtn'),
  adminLoanPreviewDownloadBtn: document.getElementById('adminLoanPreviewDownloadBtn'),
  actionModal: document.getElementById('actionModal'),
  actionModalCard: document.querySelector('#actionModal .action-modal-card'),
  actionModalTitle: document.getElementById('actionModalTitle'),
  actionModalMessage: document.getElementById('actionModalMessage'),
  actionModalConfirmBtn: document.getElementById('actionModalConfirmBtn'),
  actionModalCancelBtn: document.getElementById('actionModalCancelBtn')
};

function ensureBalanceControls() {
  const balanceCard = el.balanceValue && el.balanceValue.closest('.kpi');
  if (!balanceCard) {
    return;
  }

  if (!el.refreshBalanceBtn) {
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refreshBalanceBtn';
    refreshBtn.type = 'button';
    refreshBtn.className = 'btn mini';
    refreshBtn.textContent = 'Actualizar saldo';
    refreshBtn.setAttribute('data-testid', 'refresh-balance-btn');
    balanceCard.append(refreshBtn);
    el.refreshBalanceBtn = refreshBtn;
  }

  if (!el.autoRefreshBalanceToggle) {
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'kpi-toggle';
    toggleLabel.setAttribute('for', 'autoRefreshBalanceToggle');
    toggleLabel.innerHTML = '<input id="autoRefreshBalanceToggle" type="checkbox" data-testid="auto-refresh-balance-toggle" /> Auto-actualizar cada 15s';
    balanceCard.append(toggleLabel);
    el.autoRefreshBalanceToggle = document.getElementById('autoRefreshBalanceToggle');
  }

  if (!el.balanceAutoIndicator) {
    const indicator = document.createElement('span');
    indicator.id = 'balanceAutoIndicator';
    indicator.className = 'auto-indicator hidden';
    indicator.textContent = 'Auto ON';
    indicator.setAttribute('data-testid', 'balance-auto-indicator');
    if (el.refreshBalanceBtn && el.refreshBalanceBtn.parentElement) {
      el.refreshBalanceBtn.parentElement.insertBefore(indicator, el.refreshBalanceBtn);
    }
    el.balanceAutoIndicator = indicator;
  }
}

function ensureActionModalElements() {
  if (!el.actionModal) {
    const modal = document.createElement('div');
    modal.id = 'actionModal';
    modal.className = 'action-modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'actionModalTitle');
    modal.innerHTML = `
      <div class="action-modal-card">
        <h3 id="actionModalTitle">Confirmar operacion</h3>
        <p id="actionModalMessage">Estas seguro de continuar?</p>
        <div class="action-modal-actions">
          <button id="actionModalCancelBtn" class="btn ghost" type="button">Cancelar</button>
          <button id="actionModalConfirmBtn" class="btn" type="button">Confirmar</button>
        </div>
      </div>
    `;
    document.body.append(modal);

    el.actionModal = modal;
    el.actionModalCard = modal.querySelector('.action-modal-card');
    el.actionModalTitle = modal.querySelector('#actionModalTitle');
    el.actionModalMessage = modal.querySelector('#actionModalMessage');
    el.actionModalConfirmBtn = modal.querySelector('#actionModalConfirmBtn');
    el.actionModalCancelBtn = modal.querySelector('#actionModalCancelBtn');
  }
}

function ensureDashboardUiElements() {
  ensureBalanceControls();
  ensureActionModalElements();
}

function isLoanPreviewModalOpen() {
  return Boolean(el.adminLoanPreviewModal && !el.adminLoanPreviewModal.classList.contains('hidden'));
}

function hideAdminLoanPreviewModal() {
  if (!el.adminLoanPreviewModal) {
    return;
  }

  el.adminLoanPreviewModal.classList.remove('is-open');
  el.adminLoanPreviewModal.classList.add('hidden');
  unlockBodyScroll();
}

function updateAdminLoanPreviewPaginationUi() {
  if (!el.adminLoanPreviewPageInfo || !el.adminLoanPreviewPrevBtn || !el.adminLoanPreviewNextBtn) {
    return;
  }

  el.adminLoanPreviewPageInfo.textContent = `${adminPreviewPaginationMeta.page} / ${adminPreviewPaginationMeta.total_pages}`;
  el.adminLoanPreviewPrevBtn.disabled = !adminPreviewPaginationMeta.has_prev;
  el.adminLoanPreviewNextBtn.disabled = !adminPreviewPaginationMeta.has_next;
}

function renderAdminLoanPreviewModalRows() {
  if (!el.adminLoanPreviewModalRows) {
    return;
  }

  const schedule = adminPreviewScheduleCache || [];
  if (schedule.length === 0) {
    el.adminLoanPreviewModalRows.innerHTML = '<tr><td colspan="5">Sin plan previsualizado</td></tr>';
    adminPreviewPaginationMeta = { page: 1, per_page: Number(el.adminLoanPreviewPerPage?.value || 10), total: 0, total_pages: 1, has_prev: false, has_next: false };
    updateAdminLoanPreviewPaginationUi();
    return;
  }

  const perPage = Math.max(Number(el.adminLoanPreviewPerPage?.value || adminPreviewPaginationMeta.per_page || 10), 1);
  const total = schedule.length;
  const totalPages = Math.max(Math.ceil(total / perPage), 1);
  const page = Math.min(Math.max(Number(adminPreviewPaginationMeta.page || 1), 1), totalPages);
  const start = (page - 1) * perPage;
  const visibleRows = schedule.slice(start, start + perPage);

  adminPreviewPaginationMeta = {
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    has_prev: page > 1,
    has_next: page < totalPages
  };

  el.adminLoanPreviewModalRows.innerHTML = visibleRows
    .map(
      (item) =>
        `<tr><td>${item.installment_number}</td><td>${item.due_date}</td><td>${Number(item.amount || 0).toFixed(2)}</td><td>${Number(item.principal_amount || 0).toFixed(2)}</td><td>${Number(item.interest_amount || 0).toFixed(2)}</td></tr>`
    )
    .join('');

  updateAdminLoanPreviewPaginationUi();
}

function showAdminLoanPreviewModal(payload, values) {
  const schedule = payload.projected_schedule || [];
  if (!el.adminLoanPreviewModal || !el.adminLoanPreviewModalRows || !el.adminLoanPreviewMeta) {
    return;
  }

  adminPreviewScheduleCache = schedule;
  const annualRate = Number(payload.annual_interest_rate || 0).toFixed(2);
  const monthlyPayment = Number(payload.monthly_payment || 0).toFixed(2);
  el.adminLoanPreviewMeta.textContent = `Cuenta: ${values.accountId} | Monto: S/ ${Number(values.amount || 0).toFixed(2)} | Meses: ${values.termMonths} | Interes anual: ${annualRate}% | Cuota mensual: S/ ${monthlyPayment}`;

  adminPreviewPaginationMeta = {
    page: 1,
    per_page: Math.max(Number(el.adminLoanPreviewPerPage?.value || 10), 1),
    total: schedule.length,
    total_pages: Math.max(Math.ceil(schedule.length / Math.max(Number(el.adminLoanPreviewPerPage?.value || 10), 1)), 1),
    has_prev: false,
    has_next: schedule.length > Math.max(Number(el.adminLoanPreviewPerPage?.value || 10), 1)
  };
  renderAdminLoanPreviewModalRows();

  el.adminLoanPreviewModal.classList.remove('hidden');
  lockBodyScroll();
  requestAnimationFrame(() => {
    el.adminLoanPreviewModal.classList.add('is-open');
  });
}

function downloadAdminLoanPreviewCsv(values) {
  if (!adminPreviewScheduleCache || adminPreviewScheduleCache.length === 0) {
    throw new Error('No hay previsualizacion disponible para exportar en CSV.');
  }

  const header = ['installment_number', 'due_date', 'amount', 'principal_amount', 'interest_amount'];
  const rows = adminPreviewScheduleCache.map((item) => [
    item.installment_number,
    item.due_date,
    Number(item.amount || 0).toFixed(2),
    Number(item.principal_amount || 0).toFixed(2),
    Number(item.interest_amount || 0).toFixed(2)
  ]);

  const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const safeAccount = String(values.accountId || 'cuenta').replace(/[^\w-]/g, '_');
  const link = document.createElement('a');
  link.href = url;
  link.download = `loan_preview_${safeAccount}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resetAdminAccountLookupState() {
  state.adminInspectAccountLookup = '';
  state.adminInspectLoanId = '';
  state.adminInspectUserId = '';
  state.adminPlanPage = 1;
  persistState();
  clearAdminInstallmentsStatusTotalsCache();
  setAdminInstallmentsStatusTotals(0, 0);
  setAdminAccountLookupValidation('');

  el.adminInspectLoanId.innerHTML = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'Sin prestamos';
  el.adminInspectLoanId.append(option);

  renderAdminInstallments([]);
  adminPlanPaginationMeta = { page: 1, per_page: Number(state.adminPlanPerPage || 10), total: 0, total_pages: 1, has_prev: false, has_next: false };
  updateAdminPlanPaginationUi();
  el.adminAccountLoanPlanSection.classList.add('hidden');
}

function setAdminAccountLookupValidation(message) {
  if (!el.adminAccountLookupValidation) {
    return;
  }

  const text = String(message || '').trim();
  if (!text) {
    el.adminAccountLookupValidation.textContent = '';
    el.adminAccountLookupValidation.classList.add('hidden');
    return;
  }

  el.adminAccountLookupValidation.textContent = text;
  el.adminAccountLookupValidation.classList.remove('hidden');
}

function setTargetAccountValidation(message) {
  const targetValidation = document.getElementById('adminTargetAccountValidation');
  if (!targetValidation) {
    return;
  }

  const text = String(message || '').trim();
  if (!text) {
    targetValidation.textContent = '';
    targetValidation.classList.add('hidden');
    return;
  }

  targetValidation.textContent = text;
  targetValidation.classList.remove('hidden');
}

function setTargetOperationButtonsDisabled(disabled) {
  const buttonIds = [
    'adminDepositTargetBtn',
    'adminWithdrawTargetBtn',
    'adminPayLoanTargetBtn',
    'adminPayServiceTargetBtn'
  ];

  buttonIds.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = disabled;
    }
  });
}

function setTargetOperationFieldsDisabled(disabled) {
  const fieldIds = [
    'adminTargetLoanId',
    'adminTargetAmount',
    'adminTargetDescription',
    'adminTargetServiceId'
  ];

  fieldIds.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (!element) {
      return;
    }

    element.disabled = disabled;
  });
}

function setTargetAccountInfo(summary) {
  const info = document.getElementById('adminTargetAccountInfo');
  if (!info) {
    return;
  }

  if (!summary) {
    info.textContent = 'Sin cuenta validada.';
    return;
  }

  const accountNumber = summary.account_number || summary.accountId || 'N/A';
  const userName = summary.user_name || 'Cliente sin nombre';
  const balance = Number(summary.balance || 0);
  info.textContent = `Cuenta validada: ${accountNumber} - ${userName} | Saldo: S/ ${balance.toFixed(2)}`;
}

function setLoanAccountInfo(summary) {
  const info = document.getElementById('adminLoanAccountInfo');
  if (!info) {
    return;
  }

  if (!summary) {
    info.textContent = 'Sin cuenta validada.';
    return;
  }

  const accountNumber = summary.account_number || summary.accountId || 'N/A';
  const userName = summary.user_name || 'Cliente sin nombre';
  const balance = Number(summary.balance || 0);
  info.textContent = `Cuenta validada: ${accountNumber} - ${userName} | Saldo: S/ ${balance.toFixed(2)}`;
}

async function validateTargetAccountBalanceForAction(actionName, amount) {
  const lookup = document.getElementById('adminTargetAccountId').value.trim();
  if (!lookup || !amount || Number(amount) <= 0) {
    return true;
  }

  try {
    const summary = await apiCall(`/api/v1/manager/accounts/${lookup}/summary`, 'GET', null, 'manager');
    const balance = Number(summary.balance || 0);
    const requested = Number(amount);
    if (requested > balance) {
      const actionLabel = actionName === 'withdraw' ? 'retiro' : actionName === 'pay_loan' ? 'pago de préstamo' : 'pago de servicio';
      const message = `Saldo insuficiente. La cuenta tiene S/ ${balance.toFixed(2)} y el ${actionLabel} requiere S/ ${requested.toFixed(2)}.`;
      setTargetAccountValidation(message);
      renderResponse(422, { errors: message });
      return false;
    }
    setTargetAccountValidation('');
    return true;
  } catch (error) {
    setTargetAccountValidation(normalizeAdminLookupErrorMessage(error.message));
    renderResponse(422, { errors: error.message });
    return false;
  }
}

function normalizeAdminLookupErrorMessage(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('not found') || text.includes('no existe') || text.includes('no encontrado')) {
    return 'La cuenta no existe.';
  }
  return 'La cuenta no existe o no tiene prestamo asignado.';
}

function setAdminInstallmentsStatusTotals(paidCount, pendingCount) {
  if (el.adminInstallmentsPaidCount) {
    el.adminInstallmentsPaidCount.textContent = String(paidCount || 0);
  }
  if (el.adminInstallmentsPendingCount) {
    el.adminInstallmentsPendingCount.textContent = String(pendingCount || 0);
  }
}

function getAdminInstallmentsStatusCacheKey() {
  if (!state.adminInspectAccountLookup || !state.adminInspectLoanId) {
    return '';
  }

  return `${state.adminInspectAccountLookup}:${state.adminInspectLoanId}`;
}

function clearAdminInstallmentsStatusTotalsCache() {
  adminInstallmentsStatusTotalsCache = {};
}

async function ensureAdminInstallmentsStatusTotals() {
  const cacheKey = getAdminInstallmentsStatusCacheKey();
  if (!cacheKey) {
    setAdminInstallmentsStatusTotals(0, 0);
    return;
  }

  const cached = adminInstallmentsStatusTotalsCache[cacheKey];
  if (cached) {
    setAdminInstallmentsStatusTotals(cached.paid, cached.pending);
    return;
  }

  const payload = await apiCall(
    `/api/v1/manager/accounts/${state.adminInspectAccountLookup}/loans/${state.adminInspectLoanId}/installments/summary`,
    'GET',
    null,
    'manager'
  );

  const paid = Number(payload.paid_count || 0);
  const pending = Number(payload.pending_count || 0);

  adminInstallmentsStatusTotalsCache[cacheKey] = { paid, pending };
  setAdminInstallmentsStatusTotals(paid, pending);
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    const loadedState = { ...defaultState, ...(raw ? JSON.parse(raw) : {}) };
    loadedState.baseUrl = resolveApiBaseUrl(loadedState.baseUrl);
    return loadedState;
  } catch (_error) {
    return { ...defaultState };
  }
}

function resolveApiBaseUrl(baseUrl) {
  const currentUrl = new URL(window.location.origin);
  const defaultUrl = new URL(defaultState.baseUrl, currentUrl.origin);
  const targetUrl = new URL(baseUrl || defaultUrl.origin, defaultUrl.origin);
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];

  if (!localHosts.includes(currentUrl.hostname) && localHosts.includes(targetUrl.hostname)) {
    return currentUrl.origin;
  }

  if (!baseUrl || baseUrl.startsWith('/')) {
    return defaultUrl.origin;
  }

  return targetUrl.origin;
}

function persistState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function hasSessionToken() {
  return Boolean(state.managerToken || state.token);
}

// Role matrix:
//   admin   -> full control (user lifecycle, roles, reports, counter operations)
//   manager -> management (inquiries, loan origination, reports, counter operations)
//   cashier -> counter operations only (deposit/withdraw/loan payment/service payment)
//   customer -> self service (withdraw, service payment, loan payment, transfer)
const MANAGEMENT_ROLES = ['admin', 'manager'];
const STAFF_ROLES = ['admin', 'manager', 'cashier', 'customer_service'];
const ADMIN_OPERATIONS = {
  'create-user': 'admin',
  'create-loan': 'manager',
  'account-ops': 'cashier'
};

function hasManagerAccess() {
  return MANAGEMENT_ROLES.includes(state.role) && hasSessionToken();
}

function hasAdminAccess() {
  return state.role === 'admin' && hasSessionToken();
}

function hasStaffAccess() {
  return STAFF_ROLES.includes(state.role) && hasSessionToken();
}

function hasClientAccess() {
  return Boolean(state.token);
}

function isClientRole() {
  return state.role === 'customer';
}

function adminOperationAllowed(operationKey) {
  const requiredRole = ADMIN_OPERATIONS[operationKey];
  if (!requiredRole) {
    return false;
  }
  if (!hasSessionToken()) {
    return false;
  }
  if (requiredRole === 'admin') {
    return hasAdminAccess();
  }
  if (requiredRole === 'manager') {
    return hasManagerAccess();
  }
  return hasStaffAccess();
}

function applyRolePermissions() {
  const role = state.role || '';
  document.querySelectorAll('[data-roles]').forEach((node) => {
    const allowed = (node.getAttribute('data-roles') || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    node.classList.toggle('hidden', allowed.length > 0 && !allowed.includes(role));
  });

  if (el.viewAdminBtn && !hasStaffAccess() && state.activeView === 'admin') {
    state.activeView = 'client';
  }

  renderAdminOperationVisibility(currentAdminOperation);
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
  setPermissionBadge(el.permCashier, state.role === 'cashier');
  setPermissionBadge(el.permCustomerService, state.role === 'customer_service');
  setPermissionBadge(el.permManagerUsers, hasAdminAccess());
}

function clearSession(keepBaseUrl = true) {
  stopBalanceAutoRefresh();
  const baseUrl = keepBaseUrl ? state.baseUrl : defaultState.baseUrl;
  Object.assign(state, { ...defaultState, baseUrl });
  persistState();
  renderAuditLog();
  updateHeader();
}

function updateHeader() {
  el.statusSummary.textContent = state.token ? 'Autenticado' : 'Sin autenticar';
  el.statusRole.textContent = `Rol: ${state.role || '-'}`;
  el.headerUserName.textContent = state.token ? state.fullName || '-' : '-';
  el.headerUserId.textContent = state.token ? state.userId || '-' : '-';
  el.headerAccountNumber.textContent = state.token ? state.accountNumber || '-' : '-';
  el.accountNumberValue.textContent = state.accountNumber || '-';
  el.userNameValue.textContent = state.fullName || '-';
  renderPermissions();
  applyRolePermissions();
}

function toggleAccountMaintenance(mode) {
  const show = mode === 'profile' || mode === 'security' || mode === 'basic-auth' || mode === 'api-keys';
  el.accountMaintenanceSection.classList.toggle('hidden', !show);

  if (mode === 'profile') {
    el.profileFirstName.focus();
  }

  if (mode === 'security') {
    document.getElementById('currentPin').focus();
  }

  if (mode === 'basic-auth') {
    el.basicAuthPassword.focus();
  }

  if (mode === 'api-keys') {
    refreshApiKeys().catch((error) => renderResponse(422, { errors: error.message }));
    el.apiKeyName.focus();
  }
}

function resolvePreferredView() {
  const stored = state.activeView;
  const fallback =
    state.role === 'cashier' ? 'cashier'
      : state.role === 'customer_service' ? 'customer_service'
        : hasStaffAccess() ? 'admin'
          : 'client';
  if (stored === 'admin' && !['admin', 'manager'].includes(state.role)) {
    return 'client';
  }
  if (stored === 'cashier' && state.role !== 'cashier') {
    return 'client';
  }
  if (stored === 'customer_service' && state.role !== 'customer_service') {
    return 'client';
  }
  return stored || fallback;
}

function setView(view) {
  if (view === 'cashier' && state.role !== 'cashier') {
    renderResponse(403, { errors: 'La vista cajero requiere rol Cashier.' });
    return;
  }
  if (view === 'customer_service' && state.role !== 'customer_service') {
    renderResponse(403, { errors: 'La vista Atención al Cliente requiere el rol correspondiente.' });
    return;
  }
  if (view === 'admin' && !['admin', 'manager'].includes(state.role)) {
    renderResponse(403, { errors: 'La vista administrativa requiere rol Admin o Manager.' });
    return;
  }

  if (view === 'admin') {
    applyRolePermissions();
  }

  state.activeView = view;
  el.clientView.classList.toggle('hidden', view !== 'client');
  el.adminView.classList.toggle('hidden', view !== 'admin');
  el.cashierView.classList.toggle('hidden', view !== 'cashier');
  el.customerServiceView.classList.toggle('hidden', view !== 'customer_service');
  el.viewClientBtn.classList.toggle('active-view', view === 'client');
  el.viewAdminBtn.classList.toggle('active-view', view === 'admin');
  el.viewCashierBtn.classList.toggle('active-view', view === 'cashier');
  el.viewCustomerServiceBtn.classList.toggle('active-view', view === 'customer_service');
  syncBalanceAutoRefreshState();
  persistState();
}

async function refreshClientBalanceValue() {
  if (!state.token || !state.accountId) {
    return;
  }

  const payload = await apiCall(`/api/v1/accounts/${state.accountId}`, 'GET');
  el.balanceValue.textContent = `S/ ${Number(payload.balance || 0).toFixed(2)}`;
}

function stopBalanceAutoRefresh() {
  if (balanceAutoRefreshTimer) {
    clearInterval(balanceAutoRefreshTimer);
    balanceAutoRefreshTimer = null;
  }
}

function syncBalanceAutoRefreshState() {
  if (el.balanceAutoIndicator) {
    el.balanceAutoIndicator.classList.toggle('hidden', !state.balanceAutoRefresh);
  }

  const shouldRun = Boolean(state.balanceAutoRefresh && state.activeView === 'client' && state.token && state.accountId);
  if (!shouldRun) {
    stopBalanceAutoRefresh();
    return;
  }

  if (balanceAutoRefreshTimer) {
    return;
  }

  balanceAutoRefreshTimer = setInterval(async () => {
    try {
      await refreshClientBalanceValue();
    } catch (_error) {
      // Keep auto-refresh resilient without interrupting user actions.
    }
  }, BALANCE_AUTO_REFRESH_MS);
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

function hasCustomModal() {
  return Boolean(
    el.actionModal
      && el.actionModalCard
      && el.actionModalTitle
      && el.actionModalMessage
      && el.actionModalConfirmBtn
      && el.actionModalCancelBtn
  );
}

function lockBodyScroll() {
  if (!hasCustomModal() && !el.adminLoanPreviewModal) {
    return;
  }
  document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
  if (!hasCustomModal() && !el.adminLoanPreviewModal) {
    return;
  }
  document.body.classList.remove('modal-open');
}

function resolveActionModal(confirmed) {
  if (!hasCustomModal()) {
    if (modalDecisionResolver) {
      modalDecisionResolver(confirmed);
      modalDecisionResolver = null;
    }
    return;
  }

  if (modalDecisionResolver) {
    modalDecisionResolver(confirmed);
    modalDecisionResolver = null;
  }
  el.actionModal.classList.remove('is-open');
  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
  }
  modalCloseTimer = setTimeout(() => {
    el.actionModal.classList.add('hidden');
    unlockBodyScroll();
    modalCloseTimer = null;
  }, 180);
}

function openActionModal({ title, message, confirmText, cancelText, tone = '', showCancel = true }) {
  if (!hasCustomModal()) {
    if (showCancel) {
      const confirmed = window.confirm(message || title || 'Confirmar operacion');
      return Promise.resolve(confirmed);
    }

    window.alert(message || title || 'Operacion no completada');
    return Promise.resolve(true);
  }

  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
  }

  el.actionModalTitle.textContent = title;
  el.actionModalMessage.textContent = message;
  el.actionModalConfirmBtn.textContent = confirmText;
  el.actionModalCancelBtn.textContent = cancelText;
  el.actionModalCancelBtn.classList.toggle('hidden', !showCancel);
  el.actionModalConfirmBtn.classList.remove('warn', 'danger');
  if (tone) {
    el.actionModalConfirmBtn.classList.add(tone);
  }
  el.actionModal.classList.remove('hidden');
  lockBodyScroll();
  requestAnimationFrame(() => {
    el.actionModal.classList.add('is-open');
  });

  return new Promise((resolve) => {
    modalDecisionResolver = resolve;
  });
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

async function showWarningDialog(message) {
  const shouldShake = String(message || '').toLowerCase().includes('saldo insuficiente');
  const modalResult = openActionModal({
    title: 'Operacion no completada',
    message,
    confirmText: 'Entendido',
    cancelText: 'Cerrar',
    tone: 'danger',
    showCancel: false
  });

  if (shouldShake && el.actionModalCard) {
    el.actionModalCard.classList.remove('shake');
    void el.actionModalCard.offsetWidth;
    el.actionModalCard.classList.add('shake');
  }

  await modalResult;
}

async function confirmMutationAction(message, formId, tone = 'warn') {
  const confirmed = await openActionModal({
    title: 'Confirmar operacion',
    message,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    tone,
    showCancel: true
  });

  if (!confirmed) {
    clearFormFields(document.getElementById(formId));
    renderResponse(200, { message: 'Operacion cancelada por el usuario.' });
  }

  return confirmed;
}

function normalizeErrorMessage(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('insufficient funds') || text.includes('saldo insuficiente')) {
    return 'Saldo insuficiente para completar la operacion.';
  }
  return message;
}

async function handleMutationError(error, status = 422) {
  const normalizedMessage = normalizeErrorMessage(error.message || 'Operacion fallida.');
  renderResponse(status, { errors: normalizedMessage });
  await showWarningDialog(normalizedMessage);
}

function formatTransactionType(type) {
  const labels = {
    deposit: 'Deposito',
    withdraw: 'Retiro',
    transfer: 'Transferencia',
    service_payment: 'Pago servicio',
    loan_payment: 'Pago prestamo',
    loan_disbursement: 'Prestamo desembolsado',
    atm_deposit: 'Deposito ATM',
    atm_withdrawal: 'Retiro ATM'
  };
  return labels[type] || type || '-';
}

function formatPerformedBy(tx) {
  if (tx.performed_by_label) {
    return tx.performed_by_label;
  }
  if (tx.performed_by_name) {
    return tx.performed_by_name;
  }
  if (tx.performed_by_role) {
    const byId = tx.performed_by_user_id ? ` #${tx.performed_by_user_id}` : '';
    return `${tx.performed_by_role}${byId}`;
  }
  return 'No disponible';
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString(window.AngelFireI18n?.localeTag() || 'es-BO');
}

function formatOpsRange(range) {
  if (!range || !range.from || !range.to) {
    return '-';
  }

  return `${formatDateTime(range.from)} - ${formatDateTime(range.to)}`;
}

function updateOpsPaginationUi() {
  if (!el.opsPageInfo || !el.opsPrevPageBtn || !el.opsNextPageBtn) {
    return;
  }

  el.opsPageInfo.textContent = `${opsPaginationMeta.page} / ${opsPaginationMeta.total_pages}`;
  el.opsPrevPageBtn.disabled = !opsPaginationMeta.has_prev;
  el.opsNextPageBtn.disabled = !opsPaginationMeta.has_next;
}

function currentOpsDate() {
  return state.opsDate || new Date().toISOString().slice(0, 10);
}

// Query shared by the listing and the CSV download so both always describe
// exactly the same set of operations.
function buildOpsQuery() {
  return new URLSearchParams({
    period: state.opsPeriod || 'day',
    date: currentOpsDate(),
    operation_type: state.opsType || 'all',
    performed_by: state.opsActor || 'all',
    page: String(state.opsPage || 1),
    per_page: String(state.opsPerPage || 10)
  }).toString();
}

function opsRowHtml(operation) {
  const actor = operation.performed_by_label || operation.performed_by_name || '-';
  const user = operation.user_name
    ? `${operation.user_name}${operation.user_id ? ` (ID ${operation.user_id})` : ''}`
    : '-';

  return `<tr><td>${formatDateTime(operation.created_at)}</td><td>${formatTransactionType(operation.transaction_type)}</td><td>${Number(operation.amount || 0).toFixed(2)}</td><td>${operation.description || '-'}</td><td>${user}</td><td>${operation.account_number || '-'}</td><td>${actor}</td><td>${operation.status || '-'}</td></tr>`;
}

async function loadOperations() {
  if (!hasManagerAccess() || !el.opsRows) {
    return;
  }

  // Changing the filters can start several requests in a row; only the newest
  // one is allowed to paint, otherwise a slow earlier response would overwrite
  // the current selection with stale data.
  const requestId = opsRequestId + 1;
  opsRequestId = requestId;

  const payload = await apiCall(`/api/v1/manager/operations?${buildOpsQuery()}`, 'GET', null, 'manager');
  if (requestId !== opsRequestId) {
    return;
  }

  const rows = payload.operations || [];

  opsPaginationMeta = {
    page: Number(payload.page || 1),
    per_page: Number(payload.per_page || state.opsPerPage || 10),
    total: Number(payload.total || rows.length),
    total_pages: Number(payload.total_pages || 1),
    has_prev: Boolean(payload.has_prev),
    has_next: Boolean(payload.has_next)
  };
  state.opsPage = opsPaginationMeta.page;
  state.opsPerPage = opsPaginationMeta.per_page;
  persistState();

  el.opsRows.innerHTML = rows.length === 0
    ? '<tr><td colspan="8">Sin operaciones</td></tr>'
    : rows.map(opsRowHtml).join('');

  if (el.opsSummary) {
    el.opsSummary.textContent = `Operaciones: ${opsPaginationMeta.total} | Monto total: S/ ${Number(payload.total_amount || 0).toFixed(2)} | Rango: ${formatOpsRange(payload.range)}`;
  }

  updateOpsPaginationUi();
  pushAudit(`Consulta bitacora de operaciones periodo=${state.opsPeriod} fecha=${currentOpsDate()} total=${opsPaginationMeta.total}`);
}

async function downloadOperations() {
  const response = await fetch(`${state.baseUrl}/api/v1/manager/operations/download?${buildOpsQuery()}`, {
    method: 'GET',
    headers: {
      Accept: 'text/csv',
      Authorization: `Bearer ${state.managerToken || state.token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (_error) {
      payload = { raw: text };
    }
    throw new Error(payload.errors || 'No se pudo descargar la bitacora de operaciones.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `operations_${state.opsPeriod || 'day'}_${currentOpsDate()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  pushAudit(`Bitacora de operaciones descargada periodo=${state.opsPeriod} fecha=${currentOpsDate()}`);
}

function currentLoginsDate() {
  return state.loginsDate || new Date().toISOString().slice(0, 10);
}

function buildLoginsQuery() {
  return new URLSearchParams({
    period: state.loginsPeriod || 'day',
    date: currentLoginsDate(),
    status: state.loginsStatus || 'all',
    page: String(state.loginsPage || 1),
    per_page: String(state.loginsPerPage || 10)
  }).toString();
}

function updateLoginsPaginationUi() {
  if (!el.loginsPageInfo || !el.loginsPrevPageBtn || !el.loginsNextPageBtn) {
    return;
  }

  el.loginsPageInfo.textContent = `${loginsPaginationMeta.page} / ${loginsPaginationMeta.total_pages}`;
  el.loginsPrevPageBtn.disabled = !loginsPaginationMeta.has_prev;
  el.loginsNextPageBtn.disabled = !loginsPaginationMeta.has_next;
}

function loginReportRow(event) {
  const cells = [
    formatDateTime(event.created_at),
    event.status,
    event.user_id || '-',
    event.user_name || 'Usuario no identificado',
    event.account_number || '-'
  ];
  const row = document.createElement('tr');
  cells.forEach((value) => {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.append(cell);
  });
  return row;
}

async function loadLoginReport() {
  if (!hasManagerAccess() || !el.loginsRows) {
    return;
  }

  const requestId = loginsRequestId + 1;
  loginsRequestId = requestId;
  const payload = await apiCall(`/api/v1/manager/logins?${buildLoginsQuery()}`, 'GET', null, 'manager');
  if (requestId !== loginsRequestId) {
    return;
  }

  const rows = payload.logins || [];
  loginsPaginationMeta = {
    page: Number(payload.page || 1),
    per_page: Number(payload.per_page || state.loginsPerPage || 10),
    total: Number(payload.total || 0),
    total_pages: Number(payload.total_pages || 1),
    has_prev: Boolean(payload.has_prev),
    has_next: Boolean(payload.has_next)
  };
  state.loginsPage = loginsPaginationMeta.page;
  state.loginsPerPage = loginsPaginationMeta.per_page;
  persistState();

  el.loginsRows.replaceChildren();
  if (rows.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'Sin inicios de sesion registrados.';
    row.append(cell);
    el.loginsRows.append(row);
  } else {
    rows.forEach((event) => el.loginsRows.append(loginReportRow(event)));
  }

  const totals = payload.totals_by_status || {};
  el.loginsSummary.textContent = `Inicios: ${payload.total || 0} | Exitosos: ${totals.success || 0} | Fallidos: ${totals.failure || 0} | Bloqueados: ${totals.blocked || 0} | Rango: ${formatOpsRange(payload.range)}`;
  updateLoginsPaginationUi();
  pushAudit(`Consulta de accesos periodo=${state.loginsPeriod} fecha=${currentLoginsDate()} total=${loginsPaginationMeta.total}`);
}

async function downloadLoginReport() {
  const response = await fetch(`${state.baseUrl}/api/v1/manager/logins/download?${buildLoginsQuery()}`, {
    method: 'GET',
    headers: {
      Accept: 'text/csv',
      Authorization: `Bearer ${state.managerToken || state.token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (_error) {
      payload = { raw: text };
    }
    throw new Error(payload.errors || 'No se pudo descargar el reporte de accesos.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `user_logins_${state.loginsPeriod || 'day'}_${currentLoginsDate()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

async function validateLoanAccountForOperation() {
  const lookup = document.getElementById('adminLoanAccountId').value.trim();
  if (!lookup) {
    setLoanAccountInfo(null);
    setLoanAccountValidation('Debes indicar un account ID o numero de cuenta valido.');
    document.getElementById('adminLoanAmount').disabled = true;
    document.getElementById('adminLoanTermMonths').disabled = true;
    document.getElementById('adminLoanFirstDueDate').disabled = true;
    document.getElementById('adminPreviewLoanBtn').disabled = true;
    document.getElementById('adminCreateLoanBtn').disabled = true;
    renderResponse(422, { errors: 'Debes indicar account ID o numero de cuenta.' });
    return false;
  }

  try {
    const summary = await apiCall(`/api/v1/manager/accounts/${lookup}/summary`, 'GET', null, 'manager');
    setLoanAccountInfo(summary);
    setLoanAccountValidation('');
    document.getElementById('adminLoanAmount').disabled = false;
    document.getElementById('adminLoanTermMonths').disabled = false;
    document.getElementById('adminLoanFirstDueDate').disabled = false;
    document.getElementById('adminPreviewLoanBtn').disabled = false;
    document.getElementById('adminCreateLoanBtn').disabled = false;
    return true;
  } catch (error) {
    setLoanAccountInfo(null);
    setLoanAccountValidation(normalizeAdminLookupErrorMessage(error.message));
    document.getElementById('adminLoanAmount').disabled = true;
    document.getElementById('adminLoanTermMonths').disabled = true;
    document.getElementById('adminLoanFirstDueDate').disabled = true;
    document.getElementById('adminPreviewLoanBtn').disabled = true;
    document.getElementById('adminCreateLoanBtn').disabled = true;
    renderResponse(422, { errors: error.message });
    return false;
  }
}

function setLoanAccountValidation(message) {
  const validation = document.getElementById('adminLoanAccountValidation');
  if (!validation) {
    return;
  }

  const text = String(message || '').trim();
  if (!text) {
    validation.textContent = '';
    validation.classList.add('hidden');
    return;
  }

  validation.textContent = text;
  validation.classList.remove('hidden');
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

function formatUserStatus(user) {
  if (!user || user.active === false) {
    return 'desactivado';
  }
  if (user.blocked === true) {
    return 'bloqueado';
  }

  return 'activo';
}

function setAdminClientLookupValidation(message) {
  if (!el.adminClientLookupValidation) return;
  el.adminClientLookupValidation.textContent = message || '';
  el.adminClientLookupValidation.classList.toggle('hidden', !message);
}

function escapeAdminText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

async function refreshSelectedAdminClient() {
  if (!state.selectedAdminUserId) return;
  try {
    const payload = await apiCall(
      `/api/v1/manager/users/${state.selectedAdminUserId}`,
      'GET',
      null,
      'manager'
    );
    renderAdminClientProfile(payload.user);
  } catch (error) {
    setAdminClientLookupValidation(normalizeAdminLookupErrorMessage(error.message));
  }
}

function renderAdminClientProfile(user) {
  if (!user) {
    el.adminClientProfile.classList.add('hidden');
    state.selectedAdminUserId = '';
    persistState();
    return;
  }

  state.selectedAdminUserId = String(user.id);
  persistState();
  el.adminClientProfile.classList.remove('hidden');
  el.adminClientName.textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim() || `Usuario #${user.id}`;
  el.adminClientMeta.textContent = `ID ${user.id} | ${user.email || '-'} | ${user.phone || '-'} | Rol: ${user.role || '-'}`;

  const status = formatUserStatus(user);
  el.adminClientStatus.textContent = status;
  el.adminClientStatus.className = `perm-badge ${status === 'activo' ? 'ok' : ''}`;

  el.adminClientFirstName.value = user.first_name || '';
  el.adminClientLastName.value = user.last_name || '';
  el.adminClientEmail.value = user.email || '';
  el.adminClientPhone.value = user.phone || '';

  const accounts = user.accounts || [];
  el.adminClientAccounts.innerHTML = accounts.length
    ? accounts.map((account) => `
      <article class="admin-client-account">
        <strong>${escapeAdminText(account.account_number || '-')}</strong>
        <span>${escapeAdminText(account.account_type || '-')}</span>
        <span>Saldo: ${Number(account.balance || 0).toFixed(2)}</span>
      </article>
    `).join('')
    : '<p class="field-help">Sin cuentas asociadas.</p>';

  const isActive = user.active !== false;
  const isBlocked = user.blocked === true;
  el.adminClientBlockBtn.disabled = !isActive || isBlocked;
  el.adminClientUnblockBtn.disabled = !isActive || !isBlocked;
  el.adminClientDeactivateBtn.disabled = !isActive;
  el.adminClientDeleteBtn.disabled = String(user.id) === String(state.userId);
}

async function searchAdminClients() {
  const query = el.adminClientLookupQuery.value.trim();
  if (!query) {
    setAdminClientLookupValidation('Debes indicar ID, cuenta, nombre, correo o teléfono.');
    return;
  }

  setAdminClientLookupValidation('');
  try {
    const payload = await apiCall(
      `/api/v1/manager/users/search?q=${encodeURIComponent(query)}`,
      'GET',
      null,
      'manager'
    );
    const users = payload.users || [];
    el.adminClientLookupResults.classList.toggle('hidden', users.length === 0);

    if (users.length === 0) {
      el.adminClientLookupResults.innerHTML = '';
      el.adminClientProfile.classList.add('hidden');
      setAdminClientLookupValidation('No se encontró ningún usuario.');
      return;
    }

    el.adminClientLookupResults.innerHTML = users.map((user) => `
      <button class="admin-client-result" type="button" data-admin-client-id="${user.id}">
        <strong>${escapeAdminText(`${user.first_name || ''} ${user.last_name || ''}`.trim() || `Usuario #${user.id}`)}</strong>
        <span>ID ${user.id} | ${escapeAdminText(user.account_number || '-')} | ${escapeAdminText(user.email || '-')}</span>
        <span>${escapeAdminText(formatUserStatus(user))} | ${escapeAdminText(user.role || '-')}</span>
      </button>
    `).join('');
  } catch (error) {
    setAdminClientLookupValidation(normalizeAdminLookupErrorMessage(error.message));
  }
}

function renderAdminUserActions(user) {
  if (!hasAdminAccess()) {
    return '';
  }

  const isActive = user && user.active !== false;
  const isBlocked = user && user.blocked === true;
  const actions = [];

  if (isActive && !isBlocked) {
    actions.push(`<button class="btn ghost mini" data-user-action="block" data-user-id="${user.id}" type="button">Bloquear</button>`);
  }

  if (isActive && isBlocked) {
    actions.push(`<button class="btn ghost mini" data-user-action="unblock" data-user-id="${user.id}" type="button">Desbloquear</button>`);
  }

  actions.push(`<button class="btn alt mini" data-user-action="delete" data-user-id="${user.id}" type="button">Eliminar</button>`);
  return actions.join('');
}

function renderAdminOperationVisibility(selected) {
  const opCards = document.querySelectorAll('[data-admin-op-card]');
  const opButtons = document.querySelectorAll('[data-admin-op]');

  opCards.forEach((card) => {
    const cardOp = card.getAttribute('data-admin-op-card') || '';
    card.classList.toggle('hidden', cardOp !== selected || !adminOperationAllowed(cardOp));
  });

  opButtons.forEach((button) => {
    const buttonOp = button.getAttribute('data-admin-op') || '';
    button.classList.toggle('active-view', buttonOp === selected);
  });
}

function toggleAdminOperation(operationKey) {
  let selected = String(operationKey || '').trim();
  if (selected && !adminOperationAllowed(selected)) {
    selected = '';
    renderResponse(403, { errors: 'Tu rol no tiene permitida esa operacion.' });
  }
  currentAdminOperation = selected;
  renderAdminOperationVisibility(selected);

  if (selected) {
    const selectedCard = document.querySelector(`[data-admin-op-card="${selected}"]`);
    if (selectedCard) {
      const firstInput = selectedCard.querySelector('input, select, button');
      if (firstInput instanceof HTMLElement) {
        firstInput.focus();
      }
    }
  }
}

async function executeAdminUserAction(action, userId, formId = null) {
  if (!hasAdminAccess()) {
    renderResponse(403, { errors: 'La gestion de usuarios esta restringida al rol Admin.' });
    return;
  }

  const cleanedUserId = String(userId || '').trim();
  if (!cleanedUserId) {
    renderResponse(422, { errors: 'Debes indicar user_id objetivo.' });
    return;
  }

  const actionConfig = {
    block: {
      path: `/api/v1/manager/users/${cleanedUserId}/block`,
      method: 'PATCH',
      confirmMessage: 'Se bloqueara el usuario indicado. Deseas continuar?',
      auditMessage: `Bloqueo de usuario por manager user_id=${cleanedUserId}`,
      tone: 'danger'
    },
    unblock: {
      path: `/api/v1/manager/users/${cleanedUserId}/unblock`,
      method: 'PATCH',
      confirmMessage: 'Se desbloqueara el usuario indicado. Deseas continuar?',
      auditMessage: `Desbloqueo de usuario por manager user_id=${cleanedUserId}`,
      tone: 'warn'
    },
    deactivate: {
      path: `/api/v1/manager/users/${cleanedUserId}/deactivate`,
      method: 'PATCH',
      confirmMessage: 'Se desactivara el usuario indicado. Deseas continuar?',
      auditMessage: `Desactivacion de usuario por manager user_id=${cleanedUserId}`,
      tone: 'danger'
    },
    delete: {
      path: `/api/v1/manager/users/${cleanedUserId}`,
      method: 'DELETE',
      confirmMessage: 'Se eliminara el usuario indicado. Deseas continuar?',
      auditMessage: `Eliminacion de usuario por manager user_id=${cleanedUserId}`,
      tone: 'danger'
    }
  };

  const config = actionConfig[action];
  if (!config) {
    renderResponse(422, { errors: 'Accion de usuario no soportada.' });
    return;
  }

  if (!await confirmMutationAction(config.confirmMessage, formId || 'adminUserStateForm', config.tone)) {
    return;
  }

  try {
    await apiCall(config.path, config.method, null, 'manager');
    pushAudit(config.auditMessage);
    await refreshAdminDashboard();
    if (state.adminInspectUserId && state.adminInspectUserId === cleanedUserId) {
      await refreshAdminFilesForSelectedUser();
    }
    if (formId) {
      clearFormFields(document.getElementById(formId));
    }
  } catch (error) {
    await handleMutationError(error);
  }
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

async function apiCall(path, method, body, authType = 'user', hideApiKeySecret = false) {
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

  const responsePayload = hideApiKeySecret && payload.api_key
    ? { ...payload, api_key: { ...payload.api_key, secret: '[secreto mostrado una sola vez]' } }
    : payload;
  renderResponse(response.status, responsePayload);
  if (!response.ok) {
    throw new Error(payload.errors || payload.error || 'Operacion fallida');
  }

  return payload;
}

async function refreshServices() {
  const payload = await apiCall('/api/v1/services', 'GET', null, 'public');
  const services = payload.services || payload || [];
  const target = document.getElementById('adminTargetServiceId');
  el.serviceId.innerHTML = '';
  if (target) {
    target.innerHTML = '';
  }
  services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = `${service.id} - ${service.name}`;
    el.serviceId.append(option);

    if (target) {
      target.append(option.cloneNode(true));
    }
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
  const txActorFilter = state.txActorFilter || 'all';
  const txPayload = await apiCall(
    `/api/v1/accounts/${state.accountId}/transactions?page=${txPage}&per_page=${txPerPage}&transaction_filter=${encodeURIComponent(txFilter)}&performed_by_filter=${encodeURIComponent(txActorFilter)}`,
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
    el.txRows.innerHTML = '<tr><td colspan="9">Sin movimientos</td></tr>';
  } else {
    el.txRows.innerHTML = rows
      .map(
        (tx) =>
          `<tr><td>${tx.id || '-'}</td><td>${formatTransactionType(tx.display_type || tx.transaction_type)}</td><td>${tx.description || '-'}</td><td class="${amountClassByMovement(tx)}">${signedAmountByMovement(tx)}</td><td>${tx.status || '-'}</td><td>${formatPerformedBy(tx)}</td><td>${tx.performed_by_user_id || '-'}</td><td>${tx.created_at || '-'}</td><td>${tx.receipt_id ? `<button class="btn ghost mini" type="button" data-receipt-download="${tx.receipt_id}">Descargar</button>` : `<button class="btn ghost mini" type="button" data-receipt-create="${tx.id}">Generar</button>`}</td></tr>`
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
  el.profileDateOfBirth.value = user.date_of_birth || '';
  el.basicAuthEmail.value = user.email || '';
}

async function refreshApiKeys() {
  if (!state.token || !state.userId) {
    return;
  }

  const payload = await apiCall(`/api/v1/users/${state.userId}/api_keys`, 'GET');
  const apiKeys = payload.api_keys || [];
  el.apiKeysRows.replaceChildren();

  if (apiKeys.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'Sin API keys';
    row.appendChild(cell);
    el.apiKeysRows.appendChild(row);
    return;
  }

  apiKeys.forEach((apiKey) => {
    const row = document.createElement('tr');
    [apiKey.name, apiKey.prefix, formatDateTime(apiKey.created_at), apiKey.last_used_at ? formatDateTime(apiKey.last_used_at) : 'Nunca'].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionCell = document.createElement('td');
    if (apiKey.revoked_at) {
      actionCell.textContent = 'Revocada';
    } else {
      const revokeButton = document.createElement('button');
      revokeButton.type = 'button';
      revokeButton.className = 'btn ghost mini';
      revokeButton.dataset.apiKeyId = apiKey.id;
      revokeButton.textContent = 'Revocar';
      row.dataset.apiKeyActive = 'true';
      actionCell.appendChild(revokeButton);
    }
    row.appendChild(actionCell);
    el.apiKeysRows.appendChild(row);
  });
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

function renderContacts(contacts) {
  el.contactsCount.textContent = String(contacts.length);
  el.contactsList.replaceChildren();
  if (contacts.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'contacts-empty';
    emptyState.textContent = 'Todavia no tienes contactos.';
    el.contactsList.append(emptyState);
    return;
  }

  contacts.forEach((contact) => {
    const row = document.createElement('article');
    row.className = 'contact-row';

    const details = document.createElement('div');
    const name = document.createElement('h3');
    name.textContent = contact.name;
    const phone = document.createElement('p');
    phone.textContent = contact.phone;
    details.append(name, phone);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn alt';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Eliminar';
    deleteButton.setAttribute('aria-label', `Eliminar contacto ${contact.name}`);
    deleteButton.addEventListener('click', async () => {
      const confirmed = await openActionModal({
        title: 'Eliminar contacto',
        message: `Se eliminara ${contact.name} de tus contactos. Deseas continuar?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        tone: 'danger',
        showCancel: true
      });
      if (!confirmed) return;

      try {
        await apiCall(`/api/v1/contacts/${contact.id}`, 'DELETE');
        el.contactsStatus.textContent = 'Contacto eliminado.';
        await refreshContacts();
      } catch (error) {
        el.contactsStatus.textContent = error.message || 'No se pudo eliminar el contacto.';
      }
    });

    row.append(details, deleteButton);
    el.contactsList.append(row);
  });
}

async function refreshContacts() {
  if (!hasManagerAccess()) return;

  const payload = await apiCall('/api/v1/contacts', 'GET');
  renderContacts(payload.contacts || []);
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
    el.adminAccountLoanPlanSection.classList.add('hidden');
    renderAdminInstallments([]);
    setAdminInstallmentsStatusTotals(0, 0);
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

  el.adminAccountLoanPlanSection.classList.remove('hidden');
  renderAdminInstallments(payload.installments || []);
  await ensureAdminInstallmentsStatusTotals();
  updateAdminPlanPaginationUi();
}

async function refreshAdminAccountSummary(accountLookup) {
  clearAdminInstallmentsStatusTotalsCache();
  const payload = await apiCall(`/api/v1/manager/accounts/${accountLookup}/summary`, 'GET', null, 'manager');
  setAdminAccountLookupValidation('');
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
    setAdminAccountLookupValidation('La cuenta no tiene prestamo asignado.');
    el.adminAccountLoanPlanSection.classList.add('hidden');
    setAdminInstallmentsStatusTotals(0, 0);
  } else {
    loans.forEach((loan) => {
      const option = document.createElement('option');
      option.value = String(loan.id);
      option.textContent = `#${loan.id} | ${loan.status} | Monto ${Number(loan.amount || 0).toFixed(2)} | Pendiente ${Number(loan.outstanding_principal || 0).toFixed(2)}`;
      el.adminInspectLoanId.append(option);
    });
    state.adminInspectLoanId = payload.active_loan_id ? String(payload.active_loan_id) : String(loans[0].id);
    el.adminInspectLoanId.value = state.adminInspectLoanId;
    el.adminAccountLoanPlanSection.classList.remove('hidden');
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
    el.adminUsersRows.innerHTML = '<tr><td colspan="7">Sin usuarios</td></tr>';
  } else {
    el.adminUsersRows.innerHTML = users
      .map(
        (user) =>
          `<tr><td>${user.id}</td><td>${user.first_name} ${user.last_name}</td><td>${user.email}</td><td>${user.account_number || '-'}</td><td>${user.role}</td><td>${formatUserStatus(user)}</td><td><div class="row-actions">${renderAdminUserActions(user)}</div></td></tr>`
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

  await refreshAdminDashboardMetrics();
  await refreshAdminRoles();
  await refreshAccountingReports();
}

async function refreshAdminDashboardMetrics() {
  const payload = await apiCall('/api/v1/manager/reports/dashboard', 'GET', null, 'manager');
  el.adminDashboardCustomers.textContent = String(payload.total_customers || 0);
  el.adminDashboardAccounts.textContent = String(payload.total_accounts || 0);
  el.adminDashboardTransactions.textContent = String(payload.transactions_today || 0);
  el.adminDashboardIncome.textContent = `S/ ${Number(payload.income_today || 0).toFixed(2)}`;
  el.adminDashboardExpenses.textContent = `S/ ${Number(payload.expenses_today || 0).toFixed(2)}`;
  el.adminDashboardOverdue.textContent = String(payload.overdue_loans || 0);
  el.adminDashboardSecurity.textContent = String(payload.security_alerts || 0);
}

async function refreshAdminRoles() {
  const roles = await apiCall('/api/v1/manager/roles', 'GET', null, 'manager');
  el.adminRolesRows.innerHTML = roles.map((role) =>
    `<tr><td>${escapeAdminText(role.name)}</td><td>${role.permissions.map(escapeAdminText).join(', ')}</td></tr>`
  ).join('');
}

async function refreshAccountingReports() {
  const payload = await apiCall('/api/v1/manager/accounting/reports', 'GET', null, 'manager');
  el.accountingBalanceGeneral.textContent = `S/ ${Number(payload.balance_general || 0).toFixed(2)}`;
  el.accountingIncome.textContent = `S/ ${Number(payload.estado_resultados?.ingresos || 0).toFixed(2)}`;
  el.accountingExpenses.textContent = `S/ ${Number(payload.estado_resultados?.egresos || 0).toFixed(2)}`;
  el.accountingCashIn.textContent = `S/ ${Number(payload.flujo_caja?.entradas || 0).toFixed(2)}`;

  const rows = payload.libro_diario || [];
  el.accountingDailyRows.innerHTML = rows.length
    ? rows.slice(0, 20).map((row) =>
      `<tr><td>${row.id}</td><td>${escapeAdminText(row.fecha)}</td><td>${escapeAdminText(row.tipo)}</td><td>S/ ${Number(row.monto || 0).toFixed(2)}</td></tr>`
    ).join('')
    : '<tr><td colspan="4">Sin movimientos contables</td></tr>';
}

function applyDashboardTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-theme', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  localStorage.setItem('angelfire-dashboard-theme', isDark ? 'dark' : 'light');
}

async function refreshCustomerPortal() {
  if (state.role !== 'customer') return;

  const dashboard = await apiCall('/api/v1/customer/dashboard', 'GET', null, 'user');
  document.getElementById('customerPortalBalance').textContent = `S/ ${Number(dashboard.total_balance || 0).toFixed(2)}`;
  document.getElementById('customerPortalAvailable').textContent = `S/ ${Number(dashboard.available_balance || 0).toFixed(2)}`;
  document.getElementById('customerPortalIncome').textContent = `S/ ${Number(dashboard.income_month || 0).toFixed(2)}`;
  document.getElementById('customerPortalExpenses').textContent = `S/ ${Number(dashboard.expenses_month || 0).toFixed(2)}`;

  await refreshCustomerNotifications();

  const preferences = await apiCall('/api/v1/customer/preferences', 'GET', null, 'user');
  document.getElementById('customerTheme').value = preferences.theme || 'light';
  applyDashboardTheme(preferences.theme || 'light');
}

async function refreshCustomerNotifications() {
  const notifications = await apiCall('/api/v1/customer/notifications', 'GET', null, 'user');
  const rows = notifications || [];
  document.getElementById('customerNotificationsRows').innerHTML = rows.length
    ? rows.map((item) => `<li>${escapeAdminText(item.title)}: ${escapeAdminText(item.message)}${item.read_at ? '' : ' (nuevo)'}</li>`).join('')
    : '<li>Sin notificaciones</li>';
}

async function refreshCustomerServiceView() {
  if (state.role !== 'customer_service') return;
  await searchCustomerServiceUsers();
  await refreshCustomerServiceTickets();
}

async function searchCustomerServiceUsers() {
  const query = document.getElementById('customerServiceSearchQuery')?.value.trim() || '';
  const payload = await apiCall(`/api/v1/customer_service/users/search?q=${encodeURIComponent(query)}`, 'GET', null, 'token');
  const users = payload.users || [];
  document.getElementById('customerServiceFoundCount').textContent = String(users.length);
  document.getElementById('customerServiceResults').innerHTML = users.length
    ? users.map((user) => `
      <button class="admin-client-result" type="button" data-customer-service-user-id="${user.id}">
        <strong>${escapeAdminText(`${user.first_name || ''} ${user.last_name || ''}`.trim())}</strong>
        <span>ID ${user.id} | ${escapeAdminText(user.document_number || '-')} | ${escapeAdminText(user.email || '-')}</span>
        <span>${escapeAdminText(user.status || '-')} | ${escapeAdminText(user.role || '-')}</span>
      </button>
    `).join('')
    : '<p class="field-help">Sin usuarios encontrados.</p>';
}

async function selectCustomerServiceUser(userId) {
  const payload = await apiCall(`/api/v1/customer_service/users/search?q=${encodeURIComponent(userId)}`, 'GET', null, 'token');
  const user = (payload.users || []).find((item) => String(item.id) === String(userId));
  if (!user) return;

  selectedCustomerServiceUserId = String(user.id);
  document.getElementById('customerServiceProfile').classList.remove('hidden');
  document.getElementById('customerServiceName').textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  document.getElementById('customerServiceMeta').textContent = `ID ${user.id} | ${user.email || '-'} | ${user.phone || '-'} | Documento: ${user.document_number || '-'}`;
  document.getElementById('customerServiceStatus').textContent = formatUserStatus(user);
  document.getElementById('customerServiceFirstName').value = user.first_name || '';
  document.getElementById('customerServiceLastName').value = user.last_name || '';
  document.getElementById('customerServiceEmail').value = user.email || '';
  document.getElementById('customerServicePhone').value = user.phone || '';
  document.getElementById('customerServiceDocument').value = user.document_number || '';
  document.getElementById('customerServiceAddress').value = user.address || '';
  document.getElementById('customerServiceAccounts').innerHTML = (user.accounts || []).length
    ? user.accounts.map((account) => `<article class="admin-client-account"><strong>${escapeAdminText(account.account_number)}</strong><span>${escapeAdminText(account.account_category || '-')}</span><span>Saldo: ${Number(account.balance || 0).toFixed(2)}</span></article>`).join('')
    : '<p class="field-help">Sin cuentas.</p>';
}

async function refreshCustomerServiceTickets() {
  const payload = await apiCall('/api/v1/customer_service/tickets', 'GET', null, 'token');
  const tickets = Array.isArray(payload) ? payload : [];
  document.getElementById('customerServiceOpenTickets').textContent = String(tickets.filter((ticket) => !['resolved', 'closed'].includes(ticket.status)).length);
  document.getElementById('customerServiceTicketsRows').innerHTML = tickets.length
    ? tickets.map((ticket) => `<tr><td>${ticket.id}</td><td>${ticket.user_id}</td><td>${escapeAdminText(ticket.subject)}</td><td>${escapeAdminText(ticket.status)}</td><td>${escapeAdminText(ticket.priority)}${ticket.status !== 'closed' ? ` | <button class="btn ghost mini" type="button" data-close-ticket="${ticket.id}">Cerrar</button>` : ''}</td></tr>`).join('')
    : '<tr><td colspan="5">Sin casos</td></tr>';
}

async function refreshCashierDashboard() {
  if (state.role !== 'cashier') return;

  const status = await apiCall('/api/v1/cashier/cash/status', 'GET', null, 'token');
  const session = status.session;
  document.getElementById('cashierOpeningBalance').textContent = `S/ ${Number(session?.opening_balance || 0).toFixed(2)}`;
  document.getElementById('cashierSystemBalance').textContent = `S/ ${Number((session?.opening_balance || 0) + 0).toFixed(2)}`;
  document.getElementById('cashierOpenedAt').textContent = session?.opened_at ? new Date(session.opened_at).toLocaleString() : '-';

  const report = await apiCall('/api/v1/cashier/reports/daily', 'GET', null, 'token');
  document.getElementById('cashierOperationCount').textContent = String(report.transaction_count || 0);
  document.getElementById('cashDailyReport').textContent = JSON.stringify(report, null, 2);

  await refreshCashierMovements();
  await refreshCashierReceipts();
  await refreshCashierClients();
}

async function refreshCashierMovements() {
  const payload = await apiCall('/api/v1/cashier/cash/movements', 'GET', null, 'token');
  const rows = payload.movements || [];
  document.getElementById('cashMovementRows').innerHTML = rows.length
    ? rows.map((row) => `<tr><td>${escapeAdminText(row.created_at)}</td><td>${escapeAdminText(row.type)}</td><td>S/ ${Number(row.amount || 0).toFixed(2)}</td><td>${escapeAdminText(row.account_number || '-')}</td><td>${escapeAdminText(row.status)}</td></tr>`).join('')
    : '<tr><td colspan="5">Sin movimientos</td></tr>';
}

async function refreshCashierReceipts() {
  const payload = await apiCall('/api/v1/cashier/receipts', 'GET', null, 'token');
  const rows = payload.receipts || [];
  document.getElementById('cashReceiptRows').innerHTML = rows.length
    ? rows.map((row) => `<tr><td>${escapeAdminText(row.receipt_number)}</td><td>${escapeAdminText(row.operation)}</td><td>S/ ${Number(row.amount || 0).toFixed(2)}</td><td>${escapeAdminText(row.account_number || '-')}</td><td><button class="btn ghost mini" type="button" onclick="window.print()">Imprimir</button></td></tr>`).join('')
    : '<tr><td colspan="5">Sin comprobantes</td></tr>';
}

async function refreshCashierClients() {
  const query = document.getElementById('cashClientSearch').value.trim();
  const payload = await apiCall(`/api/v1/cashier/clients/search?q=${encodeURIComponent(query)}`, 'GET', null, 'token');
  const rows = payload.clients || [];
  document.getElementById('cashClientRows').innerHTML = rows.length
    ? rows.map((client) => `<tr><td>${client.id}</td><td>${escapeAdminText(`${client.first_name || ''} ${client.last_name || ''}`)}</td><td>${escapeAdminText(client.email || '-')}</td><td>${escapeAdminText(client.phone || '-')}</td><td>${(client.accounts || []).map((account) => account.account_number).join(', ') || '-'}</td></tr>`).join('')
    : '<tr><td colspan="5">Sin clientes</td></tr>';
}

function bindEvents() {
  el.viewCashierBtn?.addEventListener('click', () => setView('cashier'));
  el.viewCustomerServiceBtn?.addEventListener('click', () => setView('customer_service'));
  el.viewClientBtn?.addEventListener('click', () => setView('client'));
  el.viewAdminBtn?.addEventListener('click', () => setView('admin'));

  document.getElementById('customerServiceSearchForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await searchCustomerServiceUsers();
  });

  document.getElementById('customerServiceRegisterForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall('/api/v1/customer_service/users', 'POST', {
        first_name: document.getElementById('customerServiceRegisterFirstName').value,
        last_name: document.getElementById('customerServiceRegisterLastName').value,
        email: document.getElementById('customerServiceRegisterEmail').value,
        phone: document.getElementById('customerServiceRegisterPhone').value,
        document_number: document.getElementById('customerServiceRegisterDocument').value,
        address: document.getElementById('customerServiceRegisterAddress').value,
        pin: document.getElementById('customerServiceRegisterPin').value
      }, 'token');
      event.currentTarget.reset();
      await searchCustomerServiceUsers();
      renderResponse(201, { message: 'Cliente registrado correctamente.' });
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerServiceResults')?.addEventListener('click', async (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('[data-customer-service-user-id]') : null;
    if (button) await selectCustomerServiceUser(button.getAttribute('data-customer-service-user-id'));
  });

  document.getElementById('customerServiceUpdateForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedCustomerServiceUserId) return;
    try {
      await apiCall(`/api/v1/customer_service/users/${selectedCustomerServiceUserId}`, 'PATCH', {
        first_name: document.getElementById('customerServiceFirstName').value,
        last_name: document.getElementById('customerServiceLastName').value,
        email: document.getElementById('customerServiceEmail').value,
        phone: document.getElementById('customerServicePhone').value,
        document_number: document.getElementById('customerServiceDocument').value,
        address: document.getElementById('customerServiceAddress').value
      }, 'token');
      await searchCustomerServiceUsers();
      await selectCustomerServiceUser(selectedCustomerServiceUserId);
      renderResponse(200, { message: 'Datos del cliente actualizados.' });
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerServiceUnblockBtn')?.addEventListener('click', async () => {
    if (!selectedCustomerServiceUserId) return;
    await apiCall(`/api/v1/customer_service/users/${selectedCustomerServiceUserId}/unblock`, 'PATCH', null, 'token');
    await selectCustomerServiceUser(selectedCustomerServiceUserId);
  });

  document.getElementById('customerServiceDeactivateBtn')?.addEventListener('click', async () => {
    if (!selectedCustomerServiceUserId) return;
    await apiCall(`/api/v1/customer_service/users/${selectedCustomerServiceUserId}/deactivate`, 'PATCH', null, 'token');
    await selectCustomerServiceUser(selectedCustomerServiceUserId);
  });

  document.getElementById('customerServiceReactivateBtn')?.addEventListener('click', async () => {
    if (!selectedCustomerServiceUserId) return;
    await apiCall(`/api/v1/customer_service/users/${selectedCustomerServiceUserId}/reactivate`, 'PATCH', null, 'token');
    await selectCustomerServiceUser(selectedCustomerServiceUserId);
  });

  document.getElementById('customerServiceResetPinBtn')?.addEventListener('click', async () => {
    if (!selectedCustomerServiceUserId) return;
    const pin = document.getElementById('customerServiceResetPin').value;
    await apiCall(`/api/v1/customer_service/users/${selectedCustomerServiceUserId}/reset_password`, 'PATCH', { pin }, 'token');
    renderResponse(200, { message: 'PIN restablecido correctamente.' });
  });

  document.getElementById('customerServiceOpenAccountBtn')?.addEventListener('click', async () => {
    if (!selectedCustomerServiceUserId) return;
    await apiCall('/api/v1/customer_service/accounts', 'POST', {
      user_id: selectedCustomerServiceUserId,
      account_category: document.getElementById('customerServiceAccountCategory').value
    }, 'token');
    await selectCustomerServiceUser(selectedCustomerServiceUserId);
  });

  document.getElementById('customerServiceRefreshTicketsBtn')?.addEventListener('click', refreshCustomerServiceTickets);

  document.getElementById('customerServiceCreateTicketForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall('/api/v1/customer_service/tickets', 'POST', {
        user_id: document.getElementById('customerServiceTicketUserId').value,
        subject: document.getElementById('customerServiceTicketSubject').value,
        description: document.getElementById('customerServiceTicketDescription').value,
        priority: document.getElementById('customerServiceTicketPriority').value
      }, 'token');
      event.currentTarget.reset();
      await refreshCustomerServiceTickets();
      renderResponse(201, { message: 'Caso registrado correctamente.' });
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerServiceTicketsRows')?.addEventListener('click', async (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('[data-close-ticket]') : null;
    if (!button) return;
    await apiCall(`/api/v1/customer_service/tickets/${button.getAttribute('data-close-ticket')}/close`, 'PATCH', null, 'token');
    await refreshCustomerServiceTickets();
  });

  el.txRows?.addEventListener('click', async (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('button') : null;
    if (!button) return;

    const downloadId = button.getAttribute('data-receipt-download');
    const createId = button.getAttribute('data-receipt-create');
    try {
      if (createId) {
        const receipt = await apiCall(`/api/v1/transactions/${createId}/receipt`, 'GET', null, 'user');
        button.textContent = 'Descargar';
        button.removeAttribute('data-receipt-create');
        button.setAttribute('data-receipt-download', receipt.id);
        renderResponse(200, { message: `Comprobante generado: ${receipt.receipt_number}` });
        return;
      }

      if (downloadId) {
        window.open(`${state.baseUrl}/api/v1/receipts/${downloadId}/download`, '_blank');
      }
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerCreditRequestForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall('/api/v1/customer/credit_requests', 'POST', {
        account_id: document.getElementById('customerCreditAccountId').value,
        amount: document.getElementById('customerCreditAmount').value,
        term_months: document.getElementById('customerCreditMonths').value,
        reason: document.getElementById('customerCreditReason').value
      }, 'user');
      renderResponse(201, { message: 'Solicitud de crédito creada.' });
      event.currentTarget.reset();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerSupportForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall('/api/v1/customer/tickets', 'POST', {
        subject: document.getElementById('customerTicketSubject').value,
        description: document.getElementById('customerTicketDescription').value
      }, 'user');
      renderResponse(201, { message: 'Ticket de soporte creado.' });
      event.currentTarget.reset();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerPreferencesForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const theme = document.getElementById('customerTheme').value;
      await apiCall('/api/v1/customer/preferences', 'PATCH', {
        theme
      }, 'user');
      applyDashboardTheme(theme);
      renderResponse(200, { message: 'Preferencias actualizadas.' });
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('customerRefreshNotificationsBtn')?.addEventListener('click', refreshCustomerNotifications);

  document.getElementById('cashOpenForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall('/api/v1/cashier/cash/open', 'POST', { opening_balance: document.getElementById('cashOpeningBalance').value }, 'token');
      await refreshCashierDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('cashReconciliationForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = await apiCall('/api/v1/cashier/cash/reconciliation', 'POST', { physical_balance: document.getElementById('cashPhysicalBalance').value }, 'token');
      document.getElementById('cashReconciliationResult').textContent = `Sistema S/ ${payload.system_balance.toFixed(2)} | Físico S/ ${payload.physical_balance.toFixed(2)} | ${payload.result}`;
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('cashCloseForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiCall('/api/v1/cashier/cash/close', 'POST', {
        physical_balance: document.getElementById('cashClosePhysicalBalance').value,
        notes: document.getElementById('cashCloseNotes').value
      }, 'token');
      await refreshCashierDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('cashClientSearchForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await refreshCashierClients();
  });

  document.getElementById('cashRefreshClientsBtn')?.addEventListener('click', refreshCashierClients);
  document.getElementById('cashRefreshMovementsBtn')?.addEventListener('click', refreshCashierMovements);
  document.getElementById('cashRefreshReportBtn')?.addEventListener('click', refreshCashierDashboard);


  el.contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = el.contactName.value.trim();
    const phone = el.contactPhone.value.trim();

    try {
      await apiCall('/api/v1/contacts', 'POST', { contact: { name, phone } });
      el.contactForm.reset();
      el.contactsStatus.textContent = 'Contacto agregado.';
      await refreshContacts();
    } catch (error) {
      el.contactsStatus.textContent = error.message || 'No se pudo agregar el contacto.';
    }
  });

  if (hasCustomModal()) {
    el.actionModalConfirmBtn.addEventListener('click', () => resolveActionModal(true));
    el.actionModalCancelBtn.addEventListener('click', () => resolveActionModal(false));
    el.actionModal.addEventListener('click', (event) => {
      if (event.target === el.actionModal) {
        resolveActionModal(false);
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isLoanPreviewModalOpen()) {
        hideAdminLoanPreviewModal();
        return;
      }

      if (event.key === 'Escape' && !el.actionModal.classList.contains('hidden')) {
        resolveActionModal(false);
      }
    });
  }

  if (el.adminLoanPreviewModal && el.adminLoanPreviewCloseBtn) {
    el.adminLoanPreviewCloseBtn.addEventListener('click', () => {
      hideAdminLoanPreviewModal();
    });

    el.adminLoanPreviewModal.addEventListener('click', (event) => {
      if (event.target === el.adminLoanPreviewModal) {
        hideAdminLoanPreviewModal();
      }
    });
  }

  if (el.adminLoanPreviewDownloadBtn) {
    el.adminLoanPreviewDownloadBtn.addEventListener('click', () => {
      try {
        const values = getAdminLoanFormValues();
        downloadAdminLoanPreviewCsv(values);
        renderResponse(200, { message: 'Previsualizacion exportada en CSV.' });
      } catch (error) {
        renderResponse(422, { errors: error.message });
      }
    });
  }

  if (el.adminLoanPreviewPerPage) {
    el.adminLoanPreviewPerPage.addEventListener('change', () => {
      adminPreviewPaginationMeta.page = 1;
      renderAdminLoanPreviewModalRows();
    });
  }

  if (el.adminLoanPreviewPrevBtn) {
    el.adminLoanPreviewPrevBtn.addEventListener('click', () => {
      if (adminPreviewPaginationMeta.page <= 1) {
        return;
      }
      adminPreviewPaginationMeta.page -= 1;
      renderAdminLoanPreviewModalRows();
    });
  }

  if (el.adminLoanPreviewNextBtn) {
    el.adminLoanPreviewNextBtn.addEventListener('click', () => {
      const totalPages = adminPreviewPaginationMeta.total_pages || 1;
      if (adminPreviewPaginationMeta.page >= totalPages) {
        return;
      }
      adminPreviewPaginationMeta.page += 1;
      renderAdminLoanPreviewModalRows();
    });
  }

  if (el.refreshBalanceBtn) {
    el.refreshBalanceBtn.addEventListener('click', async () => {
      try {
        await refreshClientBalanceValue();
      } catch (error) {
        renderResponse(422, { errors: error.message });
      }
    });
  }

  if (el.autoRefreshBalanceToggle) {
    el.autoRefreshBalanceToggle.addEventListener('change', () => {
      state.balanceAutoRefresh = Boolean(el.autoRefreshBalanceToggle.checked);
      persistState();
      syncBalanceAutoRefreshState();
    });
  }

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
      await loadOperations();
      setView('admin');
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('depositForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!await confirmMutationAction('Se aplicara un deposito. Deseas continuar?', 'depositForm')) {
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
      await handleMutationError(error);
    }
  });

  document.getElementById('withdrawForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!await confirmMutationAction('Se aplicara un retiro. Deseas continuar?', 'withdrawForm', 'danger')) {
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
      await handleMutationError(error);
    }
  });

  document.getElementById('payServiceForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!await confirmMutationAction('Se aplicara el pago del servicio. Deseas continuar?', 'payServiceForm')) {
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
      await handleMutationError(error);
    }
  });

  document.getElementById('transferForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isClientRole()) {
      renderResponse(403, { errors: 'Las transferencias estan disponibles para el rol customer.' });
      return;
    }
    if (!state.accountId) {
      renderResponse(422, { errors: 'No hay cuenta de origen disponible.' });
      return;
    }

    const recipient = document.getElementById('transferRecipient').value.trim();
    const amount = Number(document.getElementById('transferAmount').value);
    const statusNode = document.getElementById('transferStatus');

    if (!recipient) {
      renderResponse(422, { errors: 'Debes indicar la cuenta destino.' });
      return;
    }
    if (/^\d+$/.test(recipient) && recipient === String(state.accountNumber || '')) {
      renderResponse(422, { errors: 'No puedes transferir a tu propia cuenta.' });
      return;
    }
    if (!amount || amount <= 0) {
      renderResponse(422, { errors: 'Debes indicar un monto valido mayor a cero.' });
      return;
    }

    if (!await confirmMutationAction(`Se transferira S/ ${amount.toFixed(2)} a la cuenta ${recipient}. Deseas continuar?`, 'transferForm')) {
      return;
    }

    try {
      const payload = await apiCall(`/api/v1/accounts/${state.accountId}/transfer`, 'POST', {
        recipient_account_number: recipient,
        amount: amount,
        description: document.getElementById('transferDescription').value.trim()
      });
      const destination = (payload.recipient_account && payload.recipient_account.account_number) || recipient;
      if (statusNode) {
        statusNode.textContent = `Transferencia aplicada a la cuenta ${destination}.`;
      }
      pushAudit(`Transferencia enviada cuenta_destino=${destination} monto=${amount.toFixed(2)}`);
      await refreshClientDashboard();
      await refreshInstallmentsForClient();
      clearFormFields(document.getElementById('transferForm'));
    } catch (error) {
      if (statusNode) {
        statusNode.textContent = error.message || 'No se pudo completar la transferencia.';
      }
      await handleMutationError(error);
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
    if (!await confirmMutationAction('Se subira el archivo seleccionado. Deseas continuar?', 'uploadFileForm')) {
      return;
    }

    try {
      await uploadUserFile();
      clearFormFields(document.getElementById('uploadFileForm'));
    } catch (error) {
      await handleMutationError(error);
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
    if (!await confirmMutationAction('Se aplicara el pago del prestamo. Deseas continuar?', 'payLoanForm')) {
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
      await handleMutationError(error);
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

  if (el.txActorFilter) {
    el.txActorFilter.addEventListener('change', async () => {
      state.txActorFilter = el.txActorFilter.value;
      state.txPage = 1;
      persistState();
      try {
        await refreshClientDashboard();
      } catch (error) {
        renderResponse(422, { errors: error.message });
      }
    });
  }

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
  el.showBasicAuthSectionBtn.addEventListener('click', () => toggleAccountMaintenance('basic-auth'));
  el.showApiKeysSectionBtn.addEventListener('click', () => toggleAccountMaintenance('api-keys'));
  el.hideAccountSectionBtn.addEventListener('click', () => toggleAccountMaintenance('hide'));

  document.getElementById('updateProfileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.userId) {
      renderResponse(401, { errors: 'Debes iniciar sesion para actualizar tus datos.' });
      return;
    }
    if (!await confirmMutationAction('Se actualizaran tus datos de perfil. Deseas continuar?', 'updateProfileForm')) {
      return;
    }

    const payload = {
      first_name: el.profileFirstName.value.trim(),
      last_name: el.profileLastName.value.trim(),
      email: el.profileEmail.value.trim(),
      date_of_birth: el.profileDateOfBirth.value
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
      await handleMutationError(error);
    }
  });

  document.getElementById('changePinForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.userId) {
      renderResponse(401, { errors: 'Debes iniciar sesion para cambiar PIN.' });
      return;
    }
    if (!await confirmMutationAction('Se actualizara tu PIN. Deseas continuar?', 'changePinForm', 'danger')) {
      return;
    }

    try {
      await apiCall(`/api/v1/users/${state.userId}/pin`, 'PUT', {
        current_pin: document.getElementById('currentPin').value.trim(),
        new_pin: document.getElementById('newPin').value.trim()
      });
      clearFormFields(document.getElementById('changePinForm'));
    } catch (error) {
      await handleMutationError(error);
    }
  });

  document.getElementById('basicAuthPasswordForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.token || !state.userId) {
      renderResponse(401, { errors: 'Debes iniciar sesion para configurar Basic Auth.' });
      return;
    }

    const password = el.basicAuthPassword.value;
    const confirmation = el.basicAuthPasswordConfirmation.value;
    const passwordLength = Array.from(password).length;
    const passwordBytes = new TextEncoder().encode(password).length;

    if (password !== confirmation) {
      renderResponse(422, { errors: 'Las contraseñas Basic no coinciden.' });
      el.basicAuthPasswordConfirmation.focus();
      return;
    }

    if (passwordLength < 12 || passwordBytes > 72) {
      renderResponse(422, { errors: 'La contraseña Basic debe tener al menos 12 caracteres y no más de 72 bytes.' });
      el.basicAuthPassword.focus();
      return;
    }

    if (!await confirmMutationAction('Se creara o reemplazara tu contraseña Basic Auth. Deseas continuar?', 'basicAuthPasswordForm')) {
      return;
    }

    try {
      await apiCall(`/api/v1/users/${state.userId}/basic_auth_password`, 'PUT', {
        basic_auth_password: password
      });
      clearFormFields(document.getElementById('basicAuthPasswordForm'));
    } catch (error) {
      await handleMutationError(error);
    }
  });

  document.getElementById('apiKeyCreateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = el.apiKeyName.value.trim();
    if (!name) {
      renderResponse(422, { errors: 'Indica un nombre para identificar la API key.' });
      return;
    }
    if (!await confirmMutationAction('Se creara una API key que solo se mostrara una vez. Deseas continuar?', 'apiKeyCreateForm')) {
      return;
    }

    try {
      const payload = await apiCall(`/api/v1/users/${state.userId}/api_keys`, 'POST', { name }, 'user', true);
      el.apiKeySecretValue.textContent = payload.api_key.secret;
      el.apiKeySecretResult.classList.remove('hidden');
      clearFormFields(document.getElementById('apiKeyCreateForm'));
      await refreshApiKeys();
    } catch (error) {
      await handleMutationError(error);
    }
  });

  el.apiKeysRows.addEventListener('click', async (event) => {
    const revokeButton = event.target.closest('button[data-api-key-id]');
    if (!revokeButton) {
      return;
    }

    const apiKeyId = revokeButton.dataset.apiKeyId;
    if (!await confirmMutationAction('Esta API key dejará de funcionar y no se puede reactivar. ¿Deseas revocarla?', 'apiKeyCreateForm', 'danger')) {
      return;
    }

    try {
      await apiCall(`/api/v1/users/${state.userId}/api_keys/${apiKeyId}`, 'DELETE');
      await refreshApiKeys();
    } catch (error) {
      await handleMutationError(error);
    }
  });

  document.getElementById('adminCreateUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasAdminAccess()) {
      renderResponse(403, { errors: 'La creacion de usuarios esta restringida al rol Admin.' });
      return;
    }
    if (!await confirmMutationAction('Se creara un nuevo usuario. Deseas continuar?', 'adminCreateUserForm')) {
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
    const dateOfBirth = document.getElementById('adminDateOfBirth').value;
    if (phone) {
      payload.phone = phone;
    }
    if (dateOfBirth) {
      payload.date_of_birth = dateOfBirth;
    }

    try {
      await apiCall('/api/v1/manager/users', 'POST', payload, 'manager');
      pushAudit(`Creacion de usuario por manager email=${payload.email} role=${payload.role}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminCreateUserForm'));
    } catch (error) {
      await handleMutationError(error);
    }
  });

  document.getElementById('adminCancelCreateUserBtn').addEventListener('click', () => {
    clearFormFields(document.getElementById('adminCreateUserForm'));
    toggleAdminOperation('');
    renderResponse(200, { message: 'Operacion cancelada. Formulario cerrado.' });
  });

  document.getElementById('adminCancelCreateLoanBtn').addEventListener('click', () => {
    clearFormFields(document.getElementById('adminCreateLoanForm'));
    toggleAdminOperation('');
    renderResponse(200, { message: 'Operacion cancelada. Formulario cerrado.' });
  });

  document.getElementById('adminCancelAccountOpsBtn').addEventListener('click', () => {
    clearFormFields(document.getElementById('adminAccountOpsForm'));
    toggleAdminOperation('');
    renderResponse(200, { message: 'Operacion cancelada. Formulario cerrado.' });
  });

  el.adminClientLookupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await searchAdminClients();
  });

  el.adminClientLookupResults.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('[data-admin-client-id]');
    if (!button) return;

    const userId = button.getAttribute('data-admin-client-id');
    try {
      const payload = await apiCall(`/api/v1/manager/users/${userId}`, 'GET', null, 'manager');
      el.adminClientLookupResults.classList.add('hidden');
      renderAdminClientProfile(payload.user);
    } catch (error) {
      setAdminClientLookupValidation(normalizeAdminLookupErrorMessage(error.message));
    }
  });

  el.adminClientEditForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = state.selectedAdminUserId;
    if (!userId) return;

    try {
      await apiCall(
        `/api/v1/manager/users/${userId}`,
        'PATCH',
        {
          first_name: el.adminClientFirstName.value.trim(),
          last_name: el.adminClientLastName.value.trim(),
          email: el.adminClientEmail.value.trim(),
          phone: el.adminClientPhone.value.trim()
        },
        'manager'
      );
      pushAudit(`Actualizacion de datos de cliente user_id=${userId}`);
      await refreshSelectedAdminClient();
    } catch (error) {
      setAdminClientLookupValidation(normalizeAdminLookupErrorMessage(error.message));
    }
  });

  el.adminClientBlockBtn.addEventListener('click', async () => {
    if (state.selectedAdminUserId) {
      await executeAdminUserAction('block', state.selectedAdminUserId, 'adminClientEditForm');
      await refreshSelectedAdminClient();
    }
  });

  el.adminClientUnblockBtn.addEventListener('click', async () => {
    if (state.selectedAdminUserId) {
      await executeAdminUserAction('unblock', state.selectedAdminUserId, 'adminClientEditForm');
      await refreshSelectedAdminClient();
    }
  });

  el.adminClientDeactivateBtn.addEventListener('click', async () => {
    if (state.selectedAdminUserId) {
      await executeAdminUserAction('deactivate', state.selectedAdminUserId, 'adminClientEditForm');
      await refreshSelectedAdminClient();
    }
  });

  el.adminClientForcePasswordBtn.addEventListener('click', async () => {
    if (!state.selectedAdminUserId) return;
    if (!await confirmMutationAction('Se exigirá cambiar el PIN en el próximo ingreso. ¿Deseas continuar?', 'adminClientEditForm', 'warn')) return;
    try {
      await apiCall(
        `/api/v1/users/${state.selectedAdminUserId}/force_password_change`,
        'PATCH',
        { enabled: true },
        'manager'
      );
      pushAudit(`Cambio obligatorio de PIN user_id=${state.selectedAdminUserId}`);
      renderResponse(200, { message: 'Cambio obligatorio de PIN activado.' });
    } catch (error) {
      setAdminClientLookupValidation(normalizeAdminLookupErrorMessage(error.message));
    }
  });

  el.adminClientDeleteBtn.addEventListener('click', async () => {
    if (state.selectedAdminUserId) {
      await executeAdminUserAction('delete', state.selectedAdminUserId, 'adminClientEditForm');
      renderAdminClientProfile(null);
      await refreshAdminDashboard();
    }
  });

  document.querySelectorAll('[data-admin-op]').forEach((button) => {
    button.addEventListener('click', () => {
      const operation = button.getAttribute('data-admin-op') || '';
      toggleAdminOperation(operation);
    });
  });

  el.adminUsersRows.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute('data-user-action');
    const userId = target.getAttribute('data-user-id');
    if (!action || !userId) {
      return;
    }

    await executeAdminUserAction(action, userId);
  });

  const reloadOperations = async () => {
    try {
      await loadOperations();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  };

  if (el.opsPeriod) {
    el.opsPeriod.addEventListener('change', async () => {
      state.opsPeriod = el.opsPeriod.value;
      state.opsPage = 1;
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsDate) {
    el.opsDate.addEventListener('change', async () => {
      state.opsDate = el.opsDate.value || new Date().toISOString().slice(0, 10);
      state.opsPage = 1;
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsType) {
    el.opsType.addEventListener('change', async () => {
      state.opsType = el.opsType.value;
      state.opsPage = 1;
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsActor) {
    el.opsActor.addEventListener('change', async () => {
      state.opsActor = el.opsActor.value;
      state.opsPage = 1;
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsPerPage) {
    el.opsPerPage.addEventListener('change', async () => {
      state.opsPerPage = Number(el.opsPerPage.value);
      state.opsPage = 1;
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsPrevPageBtn) {
    el.opsPrevPageBtn.addEventListener('click', async () => {
      if (!opsPaginationMeta.has_prev) {
        return;
      }
      state.opsPage = Math.max(opsPaginationMeta.page - 1, 1);
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsNextPageBtn) {
    el.opsNextPageBtn.addEventListener('click', async () => {
      if (!opsPaginationMeta.has_next) {
        return;
      }
      state.opsPage = opsPaginationMeta.page + 1;
      persistState();
      await reloadOperations();
    });
  }

  if (el.opsRefreshBtn) {
    el.opsRefreshBtn.addEventListener('click', reloadOperations);
  }

  if (el.opsDownloadBtn) {
    el.opsDownloadBtn.addEventListener('click', async () => {
      try {
        await downloadOperations();
      } catch (error) {
        await handleMutationError(error);
      }
    });
  }

  const reloadLoginReport = async () => {
    try {
      await loadLoginReport();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  };

  [el.loginsPeriod, el.loginsDate, el.loginsStatus, el.loginsPerPage].forEach((control) => {
    if (!control) {
      return;
    }

    control.addEventListener('change', async () => {
      state.loginsPeriod = el.loginsPeriod.value;
      state.loginsDate = el.loginsDate.value || new Date().toISOString().slice(0, 10);
      state.loginsStatus = el.loginsStatus.value;
      state.loginsPerPage = Number(el.loginsPerPage.value);
      state.loginsPage = 1;
      persistState();
      await reloadLoginReport();
    });
  });

  if (el.loginsPrevPageBtn) {
    el.loginsPrevPageBtn.addEventListener('click', async () => {
      if (!loginsPaginationMeta.has_prev) {
        return;
      }
      state.loginsPage = loginsPaginationMeta.page - 1;
      persistState();
      await reloadLoginReport();
    });
  }

  if (el.loginsNextPageBtn) {
    el.loginsNextPageBtn.addEventListener('click', async () => {
      if (!loginsPaginationMeta.has_next) {
        return;
      }
      state.loginsPage = loginsPaginationMeta.page + 1;
      persistState();
      await reloadLoginReport();
    });
  }

  if (el.loginsRefreshBtn) {
    el.loginsRefreshBtn.addEventListener('click', reloadLoginReport);
  }

  if (el.loginsDownloadBtn) {
    el.loginsDownloadBtn.addEventListener('click', async () => {
      try {
        await downloadLoginReport();
      } catch (error) {
        await handleMutationError(error);
      }
    });
  }

  document.getElementById('refreshAdminDashboard').addEventListener('click', async () => {
    try {
      await refreshAdminDashboard();
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });
  el.refreshRolesBtn.addEventListener('click', async () => {
    await refreshAdminRoles();
  });
  el.refreshAccountingBtn.addEventListener('click', async () => {
    await refreshAccountingReports();
  });

  document.getElementById('adminAccountLookupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }

    const lookup = el.adminLookupAccountId.value.trim();
    if (!lookup) {
      resetAdminAccountLookupState();
      setAdminAccountLookupValidation('Debes indicar un account ID o numero de cuenta valido.');
      renderResponse(422, { errors: 'Debes indicar account ID o numero de cuenta.' });
      return;
    }

    try {
      await refreshAdminAccountSummary(lookup);
      pushAudit(`Consulta de cuenta admin lookup=${lookup}`);
    } catch (error) {
      resetAdminAccountLookupState();
      el.adminAccountSummary.textContent = 'Sin cuenta seleccionada.';
      setAdminAccountLookupValidation(normalizeAdminLookupErrorMessage(error.message));
      renderResponse(422, { errors: error.message });
    }
  });

  const validateTargetAccountForOperation = async () => {
    const lookup = document.getElementById('adminTargetAccountId').value.trim();
    if (!lookup) {
      setTargetOperationButtonsDisabled(true);
      setTargetOperationFieldsDisabled(true);
      setTargetAccountInfo(null);
      setTargetAccountValidation('Debes indicar un account ID o numero de cuenta valido.');
      renderResponse(422, { errors: 'Debes indicar account ID o numero de cuenta.' });
      return false;
    }

    try {
      const summary = await apiCall(`/api/v1/manager/accounts/${lookup}/summary`, 'GET', null, 'manager');
      setTargetOperationButtonsDisabled(false);
      setTargetOperationFieldsDisabled(false);
      setTargetAccountInfo(summary);
      setTargetAccountValidation('');
      return true;
    } catch (error) {
      setTargetOperationButtonsDisabled(true);
      setTargetOperationFieldsDisabled(true);
      setTargetAccountInfo(null);
      setTargetAccountValidation(normalizeAdminLookupErrorMessage(error.message));
      renderResponse(422, { errors: error.message });
      return false;
    }
  };

  document.getElementById('adminValidateTargetAccountBtn').addEventListener('click', async () => {
    await validateTargetAccountForOperation();
  });

  document.getElementById('adminTargetAccountId').addEventListener('input', () => {
    const lookup = document.getElementById('adminTargetAccountId').value.trim();
    if (!lookup) {
      setTargetOperationButtonsDisabled(true);
      setTargetOperationFieldsDisabled(true);
      setTargetAccountInfo(null);
      setTargetAccountValidation('Debes indicar un account ID o numero de cuenta valido.');
      return;
    }
    setTargetOperationButtonsDisabled(true);
    setTargetOperationFieldsDisabled(true);
    setTargetAccountInfo(null);
    setTargetAccountValidation('');
  });

  el.adminInspectLoanId.addEventListener('change', async () => {
    clearAdminInstallmentsStatusTotalsCache();
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

    const isValidTarget = await validateLoanAccountForOperation();
    if (!isValidTarget) {
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
      showAdminLoanPreviewModal(payload, values);
      pushAudit(`Previsualizacion de prestamo manager account_id=${values.accountId}`);
    } catch (error) {
      renderResponse(422, { errors: error.message });
    }
  });

  document.getElementById('adminValidateLoanAccountBtn').addEventListener('click', async () => {
    await validateLoanAccountForOperation();
  });

  document.getElementById('adminLoanAccountId').addEventListener('input', () => {
    const lookup = document.getElementById('adminLoanAccountId').value.trim();
    if (!lookup) {
      setLoanAccountInfo(null);
      setLoanAccountValidation('Debes indicar un account ID o numero de cuenta valido.');
      document.getElementById('adminLoanAmount').disabled = true;
      document.getElementById('adminLoanTermMonths').disabled = true;
      document.getElementById('adminLoanFirstDueDate').disabled = true;
      document.getElementById('adminPreviewLoanBtn').disabled = true;
      document.getElementById('adminCreateLoanBtn').disabled = true;
      return;
    }

    setLoanAccountInfo(null);
    setLoanAccountValidation('');
    document.getElementById('adminLoanAmount').disabled = true;
    document.getElementById('adminLoanTermMonths').disabled = true;
    document.getElementById('adminLoanFirstDueDate').disabled = true;
    document.getElementById('adminPreviewLoanBtn').disabled = true;
    document.getElementById('adminCreateLoanBtn').disabled = true;
  });

  document.getElementById('adminLoanAmount').addEventListener('input', () => {
    updateAdminLoanRateHintFromAmount();
  });

  document.getElementById('adminCreateLoanBtn').addEventListener('click', async () => {
    if (!hasManagerAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a manager.' });
      return;
    }

    const isValidTarget = await validateLoanAccountForOperation();
    if (!isValidTarget) {
      return;
    }

    if (!await confirmMutationAction('Se creara el prestamo para la cuenta indicada. Deseas continuar?', 'adminCreateLoanForm')) {
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
      pushAudit(`Creacion de prestamo por gerente account_id=${values.accountId} loan_id=${payload.loan.id}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminCreateLoanForm'));
    } catch (error) {
      await handleMutationError(error);
    }
  });

  document.getElementById('adminDepositTargetBtn').addEventListener('click', async () => {
    if (!hasStaffAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a personal autorizado.' });
      return;
    }
    const isValidTarget = await validateTargetAccountForOperation();
    if (!isValidTarget) {
      return;
    }
    if (!await confirmMutationAction('Se depositara saldo en la cuenta objetivo. Deseas continuar?', 'adminAccountOpsForm')) {
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
      await handleMutationError(error);
    }
  });

  document.getElementById('adminWithdrawTargetBtn').addEventListener('click', async () => {
    if (!hasStaffAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a personal autorizado.' });
      return;
    }
    const isValidTarget = await validateTargetAccountForOperation();
    if (!isValidTarget) {
      return;
    }
    if (!await confirmMutationAction('Se retirara saldo de la cuenta objetivo. Deseas continuar?', 'adminAccountOpsForm', 'danger')) {
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
    const hasBalance = await validateTargetAccountBalanceForAction('withdraw', amount);
    if (!hasBalance) {
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
      await handleMutationError(error);
    }
  });

  document.getElementById('adminPayLoanTargetBtn').addEventListener('click', async () => {
    if (!hasStaffAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a personal autorizado.' });
      return;
    }
    const isValidTarget = await validateTargetAccountForOperation();
    if (!isValidTarget) {
      return;
    }
    if (!await confirmMutationAction('Se aplicara el pago del prestamo objetivo. Deseas continuar?', 'adminAccountOpsForm')) {
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
    const hasBalance = await validateTargetAccountBalanceForAction('pay_loan', amount);
    if (!hasBalance) {
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
      await handleMutationError(error);
    }
  });

  document.getElementById('adminPayServiceTargetBtn').addEventListener('click', async () => {
    if (!hasStaffAccess()) {
      renderResponse(403, { errors: 'Operacion restringida a personal autorizado.' });
      return;
    }
    const isValidTarget = await validateTargetAccountForOperation();
    if (!isValidTarget) {
      return;
    }
    if (!await confirmMutationAction('Se aplicara el pago del servicio en la cuenta objetivo. Deseas continuar?', 'adminAccountOpsForm')) {
      return;
    }

    const accountId = document.getElementById('adminTargetAccountId').value.trim();
    const serviceId = document.getElementById('adminTargetServiceId').value;
    const amount = Number(document.getElementById('adminTargetAmount').value);
    if (!accountId) {
      renderResponse(422, { errors: 'Debes indicar account_id objetivo.' });
      return;
    }
    if (!serviceId) {
      renderResponse(422, { errors: 'Debes seleccionar un servicio.' });
      return;
    }
    if (!amount || amount <= 0) {
      renderResponse(422, { errors: 'Debes indicar un monto valido mayor a cero.' });
      return;
    }
    const hasBalance = await validateTargetAccountBalanceForAction('pay_service', amount);
    if (!hasBalance) {
      return;
    }

    try {
      await apiCall(`/api/v1/manager/accounts/${accountId}/pay_service`, 'POST', {
        service_id: Number(serviceId),
        amount: amount,
        description: document.getElementById('adminTargetDescription').value.trim()
      }, 'manager');
      pushAudit(`Pago de servicio por ${state.role} account_id=${accountId} service_id=${serviceId}`);
      await refreshAdminDashboard();
      clearFormFields(document.getElementById('adminAccountOpsForm'));
    } catch (error) {
      await handleMutationError(error);
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
  if (el.txActorFilter) {
    el.txActorFilter.value = state.txActorFilter || 'all';
    state.txActorFilter = el.txActorFilter.value;
  }
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
  if (el.autoRefreshBalanceToggle) {
    el.autoRefreshBalanceToggle.checked = Boolean(state.balanceAutoRefresh);
  }
  if (el.balanceAutoIndicator) {
    el.balanceAutoIndicator.classList.toggle('hidden', !state.balanceAutoRefresh);
  }
  if (el.opsPeriod) {
    el.opsPeriod.value = state.opsPeriod || 'day';
    state.opsPeriod = el.opsPeriod.value;
  }
  if (el.opsDate) {
    state.opsDate = state.opsDate || new Date().toISOString().slice(0, 10);
    el.opsDate.value = state.opsDate;
  }
  if (el.opsType) {
    el.opsType.value = state.opsType || 'all';
    state.opsType = el.opsType.value;
  }
  if (el.opsActor) {
    el.opsActor.value = state.opsActor || 'all';
    state.opsActor = el.opsActor.value;
  }
  if (el.opsPerPage) {
    const opsPerPage = Number(state.opsPerPage || 10);
    el.opsPerPage.value = String([10, 20, 50].includes(opsPerPage) ? opsPerPage : 10);
    state.opsPerPage = Number(el.opsPerPage.value);
  }
  if (el.loginsPeriod) {
    el.loginsPeriod.value = state.loginsPeriod || 'day';
    state.loginsPeriod = el.loginsPeriod.value;
  }
  if (el.loginsDate) {
    state.loginsDate = state.loginsDate || new Date().toISOString().slice(0, 10);
    el.loginsDate.value = state.loginsDate;
  }
  if (el.loginsStatus) {
    el.loginsStatus.value = state.loginsStatus || 'all';
    state.loginsStatus = el.loginsStatus.value;
  }
  if (el.loginsPerPage) {
    const loginsPerPage = Number(state.loginsPerPage || 10);
    el.loginsPerPage.value = String([10, 20, 50].includes(loginsPerPage) ? loginsPerPage : 10);
    state.loginsPerPage = Number(el.loginsPerPage.value);
  }
  updateAdminLoanRateHintFromAmount();
  updatePendingPaginationUi();
  updateTransactionsPaginationUi();
  updateAdminUsersPaginationUi();
  updateAdminPlanPaginationUi();
  updateOpsPaginationUi();
  updateLoginsPaginationUi();
  toggleAdminOperation('');
  renderAuditLog();
  updateHeader();
}

async function init() {
  if (!state.token) {
    window.location.href = '/angelfire/';
    return;
  }

  applyDashboardTheme(localStorage.getItem('angelfire-dashboard-theme') || 'light');

  ensureDashboardUiElements();
  hydrateInputs();
  const preferredView = resolvePreferredView();
  setView(preferredView);
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
      await refreshContacts();
      await loadOperations();
      await loadLoginReport();
      if (state.adminInspectAccountLookup) {
        await refreshAdminAccountSummary(state.adminInspectAccountLookup);
      }
    }
    if (state.role === 'cashier') {
      await refreshCashierDashboard();
    }
    if (state.role === 'customer_service') {
      await refreshCustomerServiceView();
    }
    if (state.role === 'customer') {
      await refreshCustomerPortal();
    }
    setView(preferredView);
    syncBalanceAutoRefreshState();
  } catch (_error) {
    setView(preferredView);
    renderResponse(200, { message: 'Listo para iniciar sesion y operar.' });
  }
}

init();
