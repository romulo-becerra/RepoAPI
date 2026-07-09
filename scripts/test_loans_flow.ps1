param(
  [string]$BaseUrl = "http://localhost:3001",
  [string]$Pin = "1234",
  [int]$LoanAmount = 120000,
  [int]$TermMonths = 24,
  [int]$PaymentAmount = 5000
)

$ErrorActionPreference = "Stop"

$jsonHeaders = @{ Accept = "application/json" }

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "loan.tester+$timestamp@example.com"
$registerBody = @{
  first_name = "Loan"
  last_name = "Tester"
  email = $email
  phone = "+519900$((Get-Random -Minimum 1000 -Maximum 9999))"
  pin = $Pin
} | ConvertTo-Json

Write-Host "1) Register user: $email"
$registerResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/register" -Method Post -Headers $jsonHeaders -ContentType "application/json" -Body $registerBody

$accountNumber = $registerResponse.account.account_number
Write-Host "   Account number: $accountNumber"

$loginBody = @{
  account_number = $accountNumber
  pin = $Pin
} | ConvertTo-Json

Write-Host "2) Login"
$loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/login" -Method Post -Headers $jsonHeaders -ContentType "application/json" -Body $loginBody
$token = $loginResponse.token
$accountId = $loginResponse.account.id

$headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }

Write-Host "3) Create loan"
$loanBody = @{
  amount = $LoanAmount
  term_months = $TermMonths
  first_due_date = (Get-Date).AddMonths(1).ToString("yyyy-MM-15")
} | ConvertTo-Json

$loanResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/accounts/$accountId/loans" -Method Post -Headers $headers -ContentType "application/json" -Body $loanBody
$loanId = $loanResponse.loan.id
Write-Host "   Loan ID: $loanId"
Write-Host "   Annual rate: $($loanResponse.loan.annual_interest_rate)%"
Write-Host "   Monthly payment: $($loanResponse.loan.monthly_payment)"

Write-Host "4) Pay loan"
$payBody = @{ amount = $PaymentAmount } | ConvertTo-Json
$payResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/accounts/$accountId/loans/$loanId/pay" -Method Post -Headers $headers -ContentType "application/json" -Body $payBody
Write-Host "   Principal paid: $($payResponse.payment.principal_paid)"
Write-Host "   Interest paid: $($payResponse.payment.interest_paid)"
Write-Host "   Outstanding principal: $($payResponse.loan.outstanding_principal)"

Write-Host "5) Get installments"
$installmentsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/accounts/$accountId/loans/$loanId/installments" -Method Get -Headers $headers
Write-Host "   Paid installments: $($installmentsResponse.paid_installments.Count)"
Write-Host "   Pending installments: $($installmentsResponse.pending_installments.Count)"

Write-Host "6) Get account summary"
$accountResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/accounts/$accountId" -Method Get -Headers $headers
Write-Host "   has_active_loan: $($accountResponse.loan.has_active_loan)"
Write-Host "   total_loan_amount: $($accountResponse.loan.total_loan_amount)"
Write-Host "   outstanding_principal: $($accountResponse.loan.outstanding_principal)"

Write-Host "Done. Loan flow validated successfully."
