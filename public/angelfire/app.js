const storageKey = "angelfire-ui-state";

const initialState = {
  baseUrl: "http://localhost:3001",
  token: "",
  managerToken: "",
  userId: "",
  accountId: "",
  accountNumber: "",
  loanId: "",
  managedUserId: "",
  recipientId: "",
  fileId: ""
};

const operations = [
  { id: "health", label: "System | Health", method: "GET", path: "/up", auth: "none" },
  { id: "root", label: "System | Root", method: "GET", path: "/", auth: "none" },
  { id: "logout", label: "Auth | Logout", method: "POST", path: "/api/v1/logout", auth: "user" },
  { id: "accounts_index", label: "Accounts | List", method: "GET", path: "/api/v1/accounts", auth: "user" },
  { id: "accounts_show", label: "Accounts | Show", method: "GET", path: "/api/v1/accounts/:accountId", auth: "user" },
  { id: "accounts_create", label: "Accounts | Create", method: "POST", path: "/api/v1/accounts", auth: "user", body: {} },
  { id: "accounts_deposit", label: "Accounts | Deposit", method: "POST", path: "/api/v1/accounts/:accountId/deposit", auth: "user", body: { amount: 100, description: "Deposito UI AngelFire" } },
  { id: "accounts_withdraw", label: "Accounts | Withdraw", method: "POST", path: "/api/v1/accounts/:accountId/withdraw", auth: "user", body: { amount: 50, description: "Retiro UI AngelFire" } },
  { id: "accounts_balance", label: "Accounts | Balance", method: "GET", path: "/api/v1/accounts/:accountId/balance", auth: "user" },
  { id: "accounts_summary", label: "Accounts | Summary", method: "GET", path: "/api/v1/accounts/:accountId/summary", auth: "user" },
  { id: "accounts_transfer", label: "Accounts | Transfer", method: "POST", path: "/api/v1/accounts/:accountId/transfer", auth: "user", body: { recipient_account_number: "00000000", amount: 10, description: "Transferencia UI" } },
  { id: "accounts_pay_service", label: "Accounts | Pay Service", method: "POST", path: "/api/v1/accounts/:accountId/pay_service", auth: "user", body: { service_id: 1, amount: 20 } },
  { id: "transactions_index", label: "Transactions | List", method: "GET", path: "/api/v1/accounts/:accountId/transactions", auth: "user" },
  { id: "transactions_create", label: "Transactions | Create", method: "POST", path: "/api/v1/accounts/:accountId/transactions", auth: "user", body: { recipient_account_number: "00000000", amount: 25, description: "Transaccion UI" } },
  { id: "loans_index", label: "Loans | List", method: "GET", path: "/api/v1/accounts/:accountId/loans", auth: "user" },
  { id: "loans_show", label: "Loans | Show", method: "GET", path: "/api/v1/accounts/:accountId/loans/:loanId", auth: "user" },
  { id: "loans_create", label: "Loans | Create", method: "POST", path: "/api/v1/accounts/:accountId/loans", auth: "user", body: { amount: 120000, term_months: 24, first_due_date: "2026-08-15" } },
  { id: "loans_pay", label: "Loans | Pay", method: "POST", path: "/api/v1/accounts/:accountId/loans/:loanId/pay", auth: "user", body: { amount: 1000 } },
  { id: "loans_installments", label: "Loans | Installments", method: "GET", path: "/api/v1/accounts/:accountId/loans/:loanId/installments", auth: "user" },
  { id: "recipients_index", label: "Recipients | List", method: "GET", path: "/api/v1/recipients", auth: "user" },
  { id: "recipients_create", label: "Recipients | Create", method: "POST", path: "/api/v1/recipients", auth: "user", body: { account_number: "00000000", name: "Destinatario UI" } },
  { id: "recipients_destroy", label: "Recipients | Delete", method: "DELETE", path: "/api/v1/recipients/:recipientId", auth: "user" },
  { id: "recipients_search", label: "Recipients | Search", method: "GET", path: "/api/v1/recipients/search?q=dest", auth: "user" },
  { id: "services_index", label: "Services | List", method: "GET", path: "/api/v1/services", auth: "user" },
  { id: "services_show", label: "Services | Show", method: "GET", path: "/api/v1/services/:serviceId", auth: "user" },
  { id: "atm_deposit", label: "ATM | Deposit", method: "POST", path: "/api/v1/atm/accounts/:accountId/deposit", auth: "user", body: { pin: "1234", amount: 100, description: "Deposito ATM UI" } },
  { id: "atm_withdraw", label: "ATM | Withdraw", method: "POST", path: "/api/v1/atm/accounts/:accountId/withdraw", auth: "user", body: { pin: "1234", amount: 50, description: "Retiro ATM UI" } },
  { id: "atm_balance", label: "ATM | Balance", method: "GET", path: "/api/v1/atm/accounts/:accountId/balance?pin=1234", auth: "user" },
  { id: "atm_statement", label: "ATM | Statement", method: "GET", path: "/api/v1/atm/accounts/:accountId/statement?pin=1234", auth: "user" },
  { id: "manager_reports_overview", label: "Manager | Reports Overview", method: "GET", path: "/api/v1/manager/reports/overview", auth: "manager" },
  { id: "manager_reports_loans", label: "Manager | Reports Loans", method: "GET", path: "/api/v1/manager/reports/loans?status=active", auth: "manager" },
  { id: "manager_reports_activity", label: "Manager | Reports Accounts Activity", method: "GET", path: "/api/v1/manager/reports/accounts_activity?days=30", auth: "manager" },
  { id: "manager_users_index", label: "Manager | Users List", method: "GET", path: "/api/v1/manager/users", auth: "manager" },
  { id: "manager_users_create", label: "Manager | Users Create", method: "POST", path: "/api/v1/manager/users", auth: "manager", body: { first_name: "Managed", last_name: "User", email: "managed.user@example.com", phone: "+51997123456", pin: "1234", role: "customer" } },
  { id: "manager_users_destroy", label: "Manager | Users Delete", method: "DELETE", path: "/api/v1/manager/users/:managedUserId", auth: "manager" },
  { id: "manager_loans_cancel", label: "Manager | Cancel Loan", method: "POST", path: "/api/v1/manager/loans/:loanId/cancel", auth: "manager" },
  { id: "users_update", label: "Users | Update", method: "PATCH", path: "/api/v1/users/:userId", auth: "user", body: { first_name: "Updated", last_name: "User", phone: "+51999111222" } },
  { id: "users_pin", label: "Users | Update PIN", method: "PUT", path: "/api/v1/users/:userId/pin", auth: "user", body: { pin: "1234" } },
  { id: "users_profile", label: "Users | Profile", method: "GET", path: "/api/v1/users/:userId/profile", auth: "user" },
  { id: "users_address_show", label: "Users | Address Show", method: "GET", path: "/api/v1/users/:userId/address", auth: "user" },
  { id: "users_address_upsert", label: "Users | Address Upsert", method: "PUT", path: "/api/v1/users/:userId/address", auth: "user", body: { country: "Peru", city: "Lima", province: "Lima", street: "Av Central", street_number: "123", district: "Miraflores", postal_code: "15074", reference: "Frente al parque" } },
  { id: "users_files_index", label: "Users | Files List", method: "GET", path: "/api/v1/users/:userId/files", auth: "user" },
  { id: "users_files_create", label: "Users | Files Upload", method: "POST", path: "/api/v1/users/:userId/files", auth: "user", requiresFile: true },
  { id: "users_files_destroy", label: "Users | Files Delete", method: "DELETE", path: "/api/v1/users/:userId/files/:fileId", auth: "user" }
];

const elements = {
  baseUrl: document.getElementById("baseUrl"),
  token: document.getElementById("token"),
  managerToken: document.getElementById("managerToken"),
  userId: document.getElementById("userId"),
  accountId: document.getElementById("accountId"),
  loanId: document.getElementById("loanId"),
  managedUserId: document.getElementById("managedUserId"),
  recipientId: document.getElementById("recipientId"),
  fileId: document.getElementById("fileId"),
  configForm: document.getElementById("configForm"),
  statusSummary: document.getElementById("statusSummary"),
  responseBox: document.getElementById("responseBox"),
  responseStatus: document.getElementById("responseStatus"),
  responseTime: document.getElementById("responseTime"),
  operationSelect: document.getElementById("operationSelect"),
  operationInfo: document.getElementById("operationInfo"),
  resolvedPath: document.getElementById("resolvedPath"),
  requestBody: document.getElementById("requestBody"),
  requestFile: document.getElementById("requestFile"),
  fileInputWrap: document.getElementById("fileInputWrap"),
  explorerForm: document.getElementById("explorerForm")
};

let state = loadState();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey));
    return { ...initialState, ...(parsed || {}) };
  } catch (_error) {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function replacePathParams(path) {
  return path
    .replace(":userId", state.userId || "")
    .replace(":accountId", state.accountId || "")
    .replace(":loanId", state.loanId || "")
    .replace(":managedUserId", state.managedUserId || "")
    .replace(":recipientId", state.recipientId || "")
    .replace(":fileId", state.fileId || "")
    .replace(":serviceId", "1");
}

function authHeader(type) {
  if (type === "manager") {
    return state.managerToken ? { Authorization: `Bearer ${state.managerToken}` } : {};
  }
  if (type === "user") {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
  }
  return {};
}

function setStatusSummary() {
  const auth = state.token ? "Usuario autenticado" : "Sin token usuario";
  const manager = state.managerToken ? "Gerente autenticado" : "Sin token gerente";
  elements.statusSummary.textContent = `${auth} | ${manager}`;
}

function syncFormState() {
  elements.baseUrl.value = state.baseUrl;
  elements.token.value = state.token;
  elements.managerToken.value = state.managerToken;
  elements.userId.value = state.userId;
  elements.accountId.value = state.accountId;
  elements.loanId.value = state.loanId;
  elements.managedUserId.value = state.managedUserId;
  elements.recipientId.value = state.recipientId;
  elements.fileId.value = state.fileId;
  setStatusSummary();
}

function renderOperationList() {
  operations.forEach((op) => {
    const option = document.createElement("option");
    option.value = op.id;
    option.textContent = `${op.method} ${op.label}`;
    elements.operationSelect.append(option);
  });
  updateOperationView();
}

function selectedOperation() {
  return operations.find((op) => op.id === elements.operationSelect.value) || operations[0];
}

function updateOperationView() {
  const op = selectedOperation();
  elements.operationInfo.textContent = `Metodo: ${op.method} | Auth: ${op.auth || "none"}`;
  elements.resolvedPath.value = replacePathParams(op.path);
  elements.requestBody.value = op.body ? JSON.stringify(op.body, null, 2) : "";
  elements.fileInputWrap.classList.toggle("hidden", !op.requiresFile);
}

async function requestApi(op, bodyValue, file) {
  const started = performance.now();
  const url = `${state.baseUrl}${replacePathParams(op.path)}`;
  const headers = {
    Accept: "application/json",
    ...authHeader(op.auth)
  };

  let payload;
  if (op.requiresFile) {
    payload = new FormData();
    if (file) payload.append("file", file);
  } else if (op.method !== "GET" && op.method !== "DELETE") {
    headers["Content-Type"] = "application/json";
    payload = bodyValue ? JSON.stringify(bodyValue) : undefined;
  }

  const response = await fetch(url, {
    method: op.method,
    headers,
    body: payload
  });

  const elapsed = Math.round(performance.now() - started);
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (_error) {
    parsed = { raw: text };
  }

  autoCaptureFromResponse(op, parsed);
  renderResponse(response.status, elapsed, parsed || text);
}

function autoCaptureFromResponse(op, payload) {
  if (!payload || typeof payload !== "object") return;

  if (payload.token && op.auth !== "manager") {
    state.token = payload.token;
    elements.token.value = state.token;
  }

  if (payload.user && payload.user.id) {
    state.userId = String(payload.user.id);
    elements.userId.value = state.userId;
  }

  if (payload.account && payload.account.id) {
    state.accountId = String(payload.account.id);
    elements.accountId.value = state.accountId;
  }

  if (payload.account && payload.account.account_number) {
    state.accountNumber = String(payload.account.account_number);
    const accountNumberInput = document.getElementById("loginAccountNumber");
    if (accountNumberInput) accountNumberInput.value = state.accountNumber;
  }

  if (payload.loan && payload.loan.id) {
    state.loanId = String(payload.loan.id);
    elements.loanId.value = state.loanId;
  }

  if (payload.recipient && payload.recipient.id) {
    state.recipientId = String(payload.recipient.id);
    elements.recipientId.value = state.recipientId;
  }

  if (payload.file && payload.file.id) {
    state.fileId = String(payload.file.id);
    elements.fileId.value = state.fileId;
  }

  if (payload.user && payload.user.id && op.id === "manager_users_create") {
    state.managedUserId = String(payload.user.id);
    elements.managedUserId.value = state.managedUserId;
  }

  saveState();
  setStatusSummary();
}

function renderResponse(status, elapsed, payload) {
  elements.responseStatus.textContent = `Status: ${status}`;
  elements.responseTime.textContent = `Tiempo: ${elapsed} ms`;
  elements.responseBox.textContent = JSON.stringify(payload, null, 2);
}

function parseJsonOrNull(raw) {
  if (!raw || !raw.trim()) return null;
  return JSON.parse(raw);
}

function bindQuickForms() {
  document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      first_name: document.getElementById("regFirstName").value,
      last_name: document.getElementById("regLastName").value,
      email: document.getElementById("regEmail").value,
      pin: document.getElementById("regPin").value
    };
    const op = { id: "register", method: "POST", path: "/api/v1/register", auth: "none" };
    await requestApi(op, payload, null);
  });

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      account_number: document.getElementById("loginAccountNumber").value,
      pin: document.getElementById("loginPin").value
    };
    const op = { id: "login", method: "POST", path: "/api/v1/login", auth: "none" };
    await requestApi(op, payload, null);
  });

  document.getElementById("depositForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      amount: Number(document.getElementById("depositAmount").value),
      description: document.getElementById("depositDescription").value
    };
    const op = operations.find((entry) => entry.id === "accounts_deposit");
    await requestApi(op, payload, null);
  });

  document.getElementById("withdrawForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      amount: Number(document.getElementById("withdrawAmount").value),
      description: document.getElementById("withdrawDescription").value
    };
    const op = operations.find((entry) => entry.id === "accounts_withdraw");
    await requestApi(op, payload, null);
  });

  document.getElementById("createLoanForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      amount: Number(document.getElementById("loanAmount").value),
      term_months: Number(document.getElementById("loanTermMonths").value),
      first_due_date: document.getElementById("loanFirstDueDate").value
    };
    const op = operations.find((entry) => entry.id === "loans_create");
    await requestApi(op, payload, null);
  });

  document.getElementById("payLoanForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      amount: Number(document.getElementById("payLoanAmount").value)
    };
    const op = operations.find((entry) => entry.id === "loans_pay");
    await requestApi(op, payload, null);
  });
}

function bindGlobalEvents() {
  elements.configForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.baseUrl = elements.baseUrl.value.trim();
    state.token = elements.token.value.trim();
    state.managerToken = elements.managerToken.value.trim();
    state.userId = elements.userId.value.trim();
    state.accountId = elements.accountId.value.trim();
    state.loanId = elements.loanId.value.trim();
    state.managedUserId = elements.managedUserId.value.trim();
    state.recipientId = elements.recipientId.value.trim();
    state.fileId = elements.fileId.value.trim();
    saveState();
    setStatusSummary();
    updateOperationView();
    renderResponse(200, 0, { message: "Configuracion guardada" });
  });

  elements.operationSelect.addEventListener("change", updateOperationView);

  elements.explorerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const op = selectedOperation();
    const file = elements.requestFile.files[0];
    let bodyValue = null;

    if (!op.requiresFile && op.method !== "GET" && op.method !== "DELETE") {
      try {
        bodyValue = parseJsonOrNull(elements.requestBody.value);
      } catch (error) {
        renderResponse(400, 0, { error: "JSON invalido", detail: error.message });
        return;
      }
    }

    await requestApi(op, bodyValue, file || null);
  });
}

function setDefaultLoanDate() {
  const input = document.getElementById("loanFirstDueDate");
  if (!input.value) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    input.value = nextMonth.toISOString().slice(0, 10);
  }
}

function init() {
  syncFormState();
  renderOperationList();
  bindQuickForms();
  bindGlobalEvents();
  setDefaultLoanDate();
}

init();
