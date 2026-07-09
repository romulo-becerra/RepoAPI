param(
  [string]$BaseUrl = "http://localhost:3001",
  [string]$Pin = "1234",
  [int]$LoanAmount = 120000,
  [int]$TermMonths = 24,
  [int]$LoanPaymentAmount = 5000,
  [int]$AccountDepositAmount = 1000,
  [int]$AccountWithdrawAmount = 200,
  [int]$AtmDepositAmount = 700,
  [int]$AtmWithdrawAmount = 300,
  [string]$ReportPath = "tmp/full_financial_flow_report.json"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers = @{},
    [hashtable]$Body = $null
  )

  $jsonHeaders = @{
    Accept = "application/json"
  }

  foreach ($key in $Headers.Keys) {
    $jsonHeaders[$key] = $Headers[$key]
  }

  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $jsonHeaders -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 8)
  }

  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $jsonHeaders
}

function Resolve-DockerPath {
  $candidates = @(
    "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
    "C:\Program Files\Docker\Docker\Resources\bin\docker.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  $command = Get-Command docker -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  throw "No se encontró docker en el sistema"
}

$report = [ordered]@{
  started_at = (Get-Date).ToString("o")
  base_url = $BaseUrl
  success = $false
  customer = [ordered]@{}
  manager = [ordered]@{}
  operations = [ordered]@{}
  reports = [ordered]@{}
}

try {
  $suffix = Get-Date -Format "yyyyMMddHHmmss"

  Write-Host "1) Registro de cliente"
  $customerRegister = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/register" -Body @{
    first_name = "Flow"
    last_name = "Customer"
    email = "flow.customer.$suffix@example.com"
    phone = "+51991$((Get-Random -Minimum 10000 -Maximum 99999))"
    pin = $Pin
  }

  $customerLogin = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/login" -Body @{
    account_number = $customerRegister.account.account_number
    pin = $Pin
  }

  $customerToken = $customerLogin.token
  $customerAccountId = $customerLogin.account.id

  $report.customer = [ordered]@{
    user_id = $customerLogin.user.id
    role = $customerLogin.user.role
    account_id = $customerAccountId
    account_number = $customerLogin.account.account_number
  }

  Write-Host "2) Operaciones de cuenta (deposito y retiro)"
  $accountDeposit = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/accounts/$customerAccountId/deposit" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    amount = $AccountDepositAmount
    description = "Deposito prueba integral"
  }

  $accountWithdraw = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/accounts/$customerAccountId/withdraw" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    amount = $AccountWithdrawAmount
    description = "Retiro prueba integral"
  }

  Write-Host "3) Prestamo y pago con debito de cuenta"
  $loanCreate = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/accounts/$customerAccountId/loans" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    amount = $LoanAmount
    term_months = $TermMonths
    first_due_date = (Get-Date).AddMonths(1).ToString("yyyy-MM-15")
  }

  $loanId = $loanCreate.loan.id

  $loanPay = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/accounts/$customerAccountId/loans/$loanId/pay" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    amount = $LoanPaymentAmount
  }

  $loanInstallments = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/accounts/$customerAccountId/loans/$loanId/installments" -Headers @{ Authorization = "Bearer $customerToken" }

  Write-Host "4) ATM (deposito/retiro/saldo/estado)"
  $atmDeposit = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/atm/accounts/$customerAccountId/deposit" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    pin = $Pin
    amount = $AtmDepositAmount
    description = "ATM deposito integral"
  }

  $atmWithdraw = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/atm/accounts/$customerAccountId/withdraw" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    pin = $Pin
    amount = $AtmWithdrawAmount
    description = "ATM retiro integral"
  }

  $atmBalance = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/atm/accounts/$customerAccountId/balance?pin=$Pin" -Headers @{ Authorization = "Bearer $customerToken" }
  $atmStatement = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/atm/accounts/$customerAccountId/statement?pin=$Pin" -Headers @{ Authorization = "Bearer $customerToken" }

  $accountView = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/accounts/$customerAccountId" -Headers @{ Authorization = "Bearer $customerToken" }

  Write-Host "5) Usuario gerente y reportes"
  $managerRegister = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/register" -Body @{
    first_name = "Flow"
    last_name = "Manager"
    email = "flow.manager.$suffix@example.com"
    phone = "+51992$((Get-Random -Minimum 10000 -Maximum 99999))"
    pin = $Pin
  }

  $dockerPath = Resolve-DockerPath
  & $dockerPath compose exec -T api bundle exec rails runner "u = User.find($($managerRegister.user.id)); u.update!(role: :manager)"
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo promover el usuario a manager"
  }

  $managerLogin = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/login" -Body @{
    account_number = $managerRegister.account.account_number
    pin = $Pin
  }

  $managerToken = $managerLogin.token

  $managerOverview = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/manager/reports/overview" -Headers @{ Authorization = "Bearer $managerToken" }
  $managerLoans = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/manager/reports/loans?status=active" -Headers @{ Authorization = "Bearer $managerToken" }
  $managerAccountsActivity = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/manager/reports/accounts_activity?days=30" -Headers @{ Authorization = "Bearer $managerToken" }

  $managerCancelLoan = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/manager/loans/$loanId/cancel" -Headers @{ Authorization = "Bearer $managerToken" }

  $report.manager = [ordered]@{
    user_id = $managerLogin.user.id
    role = $managerLogin.user.role
    account_id = $managerLogin.account.id
  }

  $report.operations = [ordered]@{
    account_deposit = [ordered]@{
      amount = $AccountDepositAmount
      balance_after = $accountDeposit.balance
      transaction_id = $accountDeposit.transaction_id
    }
    account_withdraw = [ordered]@{
      amount = $AccountWithdrawAmount
      balance_after = $accountWithdraw.balance
      transaction_id = $accountWithdraw.transaction_id
    }
    loan_create = [ordered]@{
      loan_id = $loanId
      amount = $loanCreate.loan.amount
      annual_interest_rate = $loanCreate.loan.annual_interest_rate
      monthly_payment = $loanCreate.loan.monthly_payment
    }
    loan_pay = [ordered]@{
      amount = $LoanPaymentAmount
      transaction_id = $loanPay.payment.transaction_id
      principal_paid = $loanPay.payment.principal_paid
      interest_paid = $loanPay.payment.interest_paid
      account_balance_after = $loanPay.account_balance
      outstanding_principal = $loanPay.loan.outstanding_principal
    }
    installments = [ordered]@{
      paid = $loanInstallments.paid_installments.Count
      pending = $loanInstallments.pending_installments.Count
    }
    atm = [ordered]@{
      deposit_amount = $AtmDepositAmount
      withdraw_amount = $AtmWithdrawAmount
      balance = $atmBalance.balance
      statement_items = $atmStatement.transactions.Count
    }
    account_view = [ordered]@{
      balance = $accountView.balance
      has_active_loan = $accountView.loan.has_active_loan
      outstanding_principal = $accountView.loan.outstanding_principal
    }
  }

  $report.reports = [ordered]@{
    overview = [ordered]@{
      users_total = $managerOverview.users.total
      loans_total = $managerOverview.loans.total
      loans_active = $managerOverview.loans.active
      total_outstanding_principal = $managerOverview.loans.total_outstanding_principal
    }
    loans_report_total = $managerLoans.total
    accounts_activity_total = $managerAccountsActivity.accounts.Count
    cancel_loan = [ordered]@{
      loan_id = $loanId
      status = $managerCancelLoan.status
      message = $managerCancelLoan.message
    }
  }

  $report.success = $true
  $report.finished_at = (Get-Date).ToString("o")

  $reportDir = Split-Path -Parent $ReportPath
  if (-not [string]::IsNullOrWhiteSpace($reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
  }

  $report | ConvertTo-Json -Depth 10 | Set-Content -Path $ReportPath

  Write-Host "Flujo financiero integral ejecutado correctamente"
  Write-Host "Reporte generado en: $ReportPath"
  Write-Host "Resumen:"
  Write-Host "  Cliente account_id: $customerAccountId"
  Write-Host "  Prestamo ID: $loanId"
  Write-Host "  Balance final cliente: $($accountView.balance)"
  Write-Host "  Loans activos reportados por manager: $($managerOverview.loans.active)"
}
catch {
  $report.success = $false
  $report.finished_at = (Get-Date).ToString("o")
  $report.error = $_.Exception.Message

  $reportDir = Split-Path -Parent $ReportPath
  if (-not [string]::IsNullOrWhiteSpace($reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
  }

  $report | ConvertTo-Json -Depth 10 | Set-Content -Path $ReportPath

  Write-Error "Fallo el flujo financiero integral: $($_.Exception.Message)"
  Write-Host "Reporte de error generado en: $ReportPath"
  exit 1
}
