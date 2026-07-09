param(
  [string]$BaseUrl = "http://localhost:3001",
  [string]$Pin = "1234",
  [string]$ReportPath = "tmp/user_admin_upload_flow_report.json"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers = @{},
    [hashtable]$Body = $null,
    [string]$ContentType = "application/json"
  )

  $effectiveHeaders = @{ Accept = "application/json" }
  foreach ($key in $Headers.Keys) {
    $effectiveHeaders[$key] = $Headers[$key]
  }

  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $effectiveHeaders -ContentType $ContentType -Body ($Body | ConvertTo-Json -Depth 8)
  }

  Invoke-RestMethod -Method $Method -Uri $Uri -Headers $effectiveHeaders
}

function Resolve-DockerPath {
  $path = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
  if (Test-Path $path) {
    return $path
  }

  $cmd = Get-Command docker -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  throw "No se encontró docker"
}

$report = [ordered]@{
  started_at = (Get-Date).ToString("o")
  success = $false
  customer = [ordered]@{}
  manager = [ordered]@{}
  validations = [ordered]@{}
}

try {
  $suffix = Get-Date -Format "yyyyMMddHHmmss"

  $customerRegister = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/register" -Body @{
    first_name = "Address"
    last_name = "Customer"
    email = "address.customer.$suffix@example.com"
    phone = "+51994$((Get-Random -Minimum 10000 -Maximum 99999))"
    pin = $Pin
  }

  $customerLogin = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/login" -Body @{
    account_number = $customerRegister.account.account_number
    pin = $Pin
  }

  $customerToken = $customerLogin.token
  $customerId = $customerLogin.user.id

  $addressUpsert = Invoke-Api -Method "PUT" -Uri "$BaseUrl/api/v1/users/$customerId/address" -Headers @{ Authorization = "Bearer $customerToken" } -Body @{
    country = "Peru"
    city = "Lima"
    province = "Lima"
    street = "Av. Central"
    street_number = "987"
    district = "Surco"
    postal_code = "15038"
    reference = "A media cuadra del banco"
  }

  $addressShow = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/users/$customerId/address" -Headers @{ Authorization = "Bearer $customerToken" }

  $tmpDir = Join-Path (Get-Location) "tmp"
  New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
  $uploadPath = Join-Path $tmpDir "sample_user_note.txt"
  "Comprobante de prueba para upload" | Set-Content -Path $uploadPath -Encoding UTF8

  $uploadPathForCurl = $uploadPath -replace "\\", "/"
  $uploadResponseJson = curl.exe -s -X POST "$BaseUrl/api/v1/users/$customerId/files" -H "Authorization: Bearer $customerToken" -H "Accept: application/json" -F "file=@$uploadPathForCurl"
  $uploaded = $uploadResponseJson | ConvertFrom-Json

  $filesList = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/users/$customerId/files" -Headers @{ Authorization = "Bearer $customerToken" }

  $managerRegister = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/register" -Body @{
    first_name = "Admin"
    last_name = "Manager"
    email = "admin.manager.$suffix@example.com"
    phone = "+51995$((Get-Random -Minimum 10000 -Maximum 99999))"
    pin = $Pin
  }

  $docker = Resolve-DockerPath
  & $docker compose exec -T api bundle exec rails runner "u = User.find($($managerRegister.user.id)); u.update!(role: :manager)"

  $managerLogin = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/login" -Body @{
    account_number = $managerRegister.account.account_number
    pin = $Pin
  }

  $managerToken = $managerLogin.token

  $managerUsersBefore = Invoke-Api -Method "GET" -Uri "$BaseUrl/api/v1/manager/users" -Headers @{ Authorization = "Bearer $managerToken" }

  $managerCreateUser = Invoke-Api -Method "POST" -Uri "$BaseUrl/api/v1/manager/users" -Headers @{ Authorization = "Bearer $managerToken" } -Body @{
    first_name = "Created"
    last_name = "ByManager"
    email = "created.by.manager.$suffix@example.com"
    phone = "+51996$((Get-Random -Minimum 10000 -Maximum 99999))"
    pin = $Pin
    role = "customer"
  }

  $newUserId = $managerCreateUser.user.id
  $managerDeleteUser = Invoke-Api -Method "DELETE" -Uri "$BaseUrl/api/v1/manager/users/$newUserId" -Headers @{ Authorization = "Bearer $managerToken" }

  $report.customer = [ordered]@{
    user_id = $customerId
    account_id = $customerLogin.account.id
    address_country = $addressShow.country
    uploaded_file_id = $uploaded.file.id
    uploaded_files_count = $filesList.files.Count
  }

  $report.manager = [ordered]@{
    user_id = $managerLogin.user.id
    role = $managerLogin.user.role
  }

  $report.validations = [ordered]@{
    address_upsert_message = $addressUpsert.message
    manager_users_total_before = $managerUsersBefore.total
    manager_created_user_id = $newUserId
    manager_delete_message = $managerDeleteUser.message
  }

  $report.success = $true
  $report.finished_at = (Get-Date).ToString("o")

  $reportDir = Split-Path -Parent $ReportPath
  if ($reportDir) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
  }

  $report | ConvertTo-Json -Depth 8 | Set-Content -Path $ReportPath
  Write-Host "Flujo user/address/files/manager validado. Reporte: $ReportPath"
}
catch {
  $report.success = $false
  $report.finished_at = (Get-Date).ToString("o")
  $report.error = $_.Exception.Message

  $reportDir = Split-Path -Parent $ReportPath
  if ($reportDir) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
  }

  $report | ConvertTo-Json -Depth 8 | Set-Content -Path $ReportPath
  Write-Error "Error en flujo user/admin/upload: $($_.Exception.Message)"
  exit 1
}
