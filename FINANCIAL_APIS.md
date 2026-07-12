# Documentacion de APIs Financieras

Base URL local: http://localhost:3001
Prefijo API: /api/v1
Autorizacion: Authorization: Bearer TOKEN (excepto register/login/health)

## Interfaz web AngelFire

Se agrego una interfaz UI para operar la plataforma consumiendo las mismas APIs.

- Ruta inicial (login/registro): /angelfire/ (redirige a /angelfire/login.html)
- Ruta panel operativo (post-login): /angelfire/dashboard.html
- Archivos UI:
  - public/angelfire/login.html
  - public/angelfire/login.css
  - public/angelfire/login.js
  - public/angelfire/dashboard.html
  - public/angelfire/index.html
  - public/angelfire/styles.css
  - public/angelfire/app.js

Caracteristicas:
- Flujo en 2 pantallas: login/registro -> panel operativo.
- Login de usuario y login admin.
- Operaciones financieras con refresco de balance en vivo: depositos, retiros, pago de servicios, prestamos.
- Gestion de perfil del usuario y cambio de PIN desde el panel.
- Dashboard con estado de cuenta, prestamo y movimientos recientes.
- Manejo de sesion y rol desde la misma UI.
- Selectores data-testid para futura automatizacion con Playwright.

Admin semilla (db:seed):
- Email: admin@angelfire.local
- Cuenta sugerida: 9000000001
- PIN: vacio (UI usa fallback 1234) o 1234

## 1. Salud y autenticacion

### GET /
Verifica API operativa.

### POST /api/v1/register
Registra cliente.

Body:
{
  "first_name": "Ana",
  "last_name": "Lopez",
  "email": "ana@example.com",
  "pin": "1234"
}

### POST /api/v1/login
Autentica usuario y retorna token.

Body:
{
  "account_number": "1234567890",
  "pin": "1234"
}

## 2. Usuarios

### PUT /api/v1/users/:id
Actualiza perfil de usuario autenticado.

### PUT /api/v1/users/:id/pin
Actualiza PIN.

Body:
{
  "current_pin": "1234",
  "new_pin": "5678"
}

### GET /api/v1/users/:id/profile
Retorna perfil con role.

### GET /api/v1/users/:id/address
Consulta direccion del usuario.

### PUT /api/v1/users/:id/address
Crea o actualiza direccion del usuario.

Body:
{
  "country": "Peru",
  "city": "Lima",
  "province": "Lima",
  "street": "Av. Principal",
  "street_number": "123",
  "district": "Miraflores",
  "postal_code": "15074",
  "reference": "Frente al parque"
}

### GET /api/v1/users/:id/files
Lista archivos del usuario.

### POST /api/v1/users/:id/files
Sube archivo de texto o imagen para usuario.

Notas:
- Enviar multipart/form-data.
- Campo esperado: file.
- Tipos permitidos: text/plain, text/csv, application/json, image/png, image/jpeg, image/jpg, image/gif, image/webp.
- Tamaño maximo: 5MB.

### DELETE /api/v1/users/:id/files/:file_id
Elimina archivo del usuario.

## 3. Cuentas y operaciones bancarias

### GET /api/v1/accounts
Lista cuentas del usuario.

### POST /api/v1/accounts
Crea cuenta para usuario autenticado.

### GET /api/v1/accounts/:id
Detalle de cuenta + resumen de prestamo activo.

### GET /api/v1/accounts/:id/balance
Saldo de cuenta.

### GET /api/v1/accounts/:id/summary
Resumen mensual (income, expense, balance).

### POST /api/v1/accounts/:id/transfer
Transferencia entre cuentas.

Body:
{
  "recipient_account_id": 2,
  "amount": 500,
  "description": "Transferencia"
}

### POST /api/v1/accounts/:id/pay_service
Pago de servicio.

Body:
{
  "service_id": 1,
  "amount": 300,
  "description": "Pago luz"
}

### POST /api/v1/accounts/:id/deposit
Deposito directo en cuenta.

Body:
{
  "amount": 1000,
  "description": "Abono caja"
}

### POST /api/v1/accounts/:id/withdraw
Retiro directo en cuenta.

Body:
{
  "amount": 200,
  "description": "Retiro ventanilla"
}

## 4. Transacciones

### GET /api/v1/accounts/:account_id/transactions
Lista transacciones de cuenta.

### POST /api/v1/accounts/:account_id/transactions
Transferencia a destinatario registrado.

Body:
{
  "recipient_id": 1,
  "amount": 150,
  "description": "Pago"
}

## 5. Prestamos

### POST /api/v1/accounts/:account_id/loans
Crea prestamo y plan de cuotas.

Body:
{
  "amount": 120000,
  "term_months": 24,
  "first_due_date": "2026-08-15"
}

### GET /api/v1/accounts/:account_id/loans
Lista prestamos de cuenta.

### GET /api/v1/accounts/:account_id/loans/:id
Detalle de prestamo.

### POST /api/v1/accounts/:account_id/loans/:id/pay
Aplica pago de prestamo debitando cuenta del cliente.

Body:
{
  "amount": 5000,
  "paid_on": "2026-08-20T10:30:00Z"
}

### GET /api/v1/accounts/:account_id/loans/:id/installments
Consulta cuotas pagadas y pendientes.

## 6. ATM (simulacion de cajero)

Todas las operaciones ATM requieren pin en el body.

### POST /api/v1/atm/accounts/:id/deposit
Deposito por cajero.

Body:
{
  "pin": "1234",
  "amount": 1000,
  "description": "Deposito ATM"
}

### POST /api/v1/atm/accounts/:id/withdraw
Retiro por cajero.

Body:
{
  "pin": "1234",
  "amount": 300,
  "description": "Retiro ATM"
}

### GET /api/v1/atm/accounts/:id/balance
Consulta saldo ATM (usar query pin).

Ejemplo:
/api/v1/atm/accounts/1/balance?pin=1234

### GET /api/v1/atm/accounts/:id/statement
Mini estado ATM (ultimos 10 movimientos, usar query pin).

Ejemplo:
/api/v1/atm/accounts/1/statement?pin=1234

## 7. Destinatarios y servicios

### GET /api/v1/recipients
Lista destinatarios.

### POST /api/v1/recipients
Crea destinatario.

### DELETE /api/v1/recipients/:id
Elimina destinatario.

### GET /api/v1/recipients/search?clabe=...
Busca destinatario por CLABE.

### GET /api/v1/services
Lista servicios.

### GET /api/v1/services/:id
Detalle de servicio.

## 8. Gerencia (role manager)

Requiere usuario con role=manager.

### GET /api/v1/manager/users
Vista de usuarios (listado de usuarios y direccion resumida).

### POST /api/v1/manager/users
Agregar usuario desde panel gerente.

Body:
{
  "first_name": "Mario",
  "last_name": "Perez",
  "email": "mario.perez@example.com",
  "phone": "+51998111222",
  "pin": "1234",
  "role": "customer"
}

### DELETE /api/v1/manager/users/:id
Eliminar usuario desde panel gerente.

### GET /api/v1/manager/reports/overview
Reporte ejecutivo:
- usuarios
- cuentas
- transacciones
- cartera de prestamos
- cuotas vencidas

### GET /api/v1/manager/reports/loans
Reporte de prestamos (opcional filtro status).

Ejemplo:
/api/v1/manager/reports/loans?status=active

### GET /api/v1/manager/reports/accounts_activity
Reporte de actividad por cuenta.

Parametro opcional:
- days (default 30)

Ejemplo:
/api/v1/manager/reports/accounts_activity?days=15

### POST /api/v1/manager/loans/:id/cancel
Cancela prestamo (si no esta completed).

### POST /api/v1/manager/accounts/:account_id/loans/preview
Previsualiza plan de pagos para originacion por manager.

Body:
{
  "amount": 15000,
  "term_months": 12,
  "first_due_date": "2026-08-15"
}

Respuesta ejemplo:
{
  "account_id": 10,
  "annual_interest_rate": 5.0,
  "term_months": 12,
  "monthly_payment": 1284.11,
  "projected_schedule": [
    {
      "installment_number": 1,
      "due_date": "2026-08-15",
      "amount": 1284.11,
      "principal_amount": 1221.61,
      "interest_amount": 62.5
    }
  ]
}

### POST /api/v1/manager/accounts/:account_id/loans
Origina prestamo para una cuenta objetivo.

Body:
{
  "amount": 15000,
  "term_months": 12,
  "first_due_date": "2026-08-15"
}

### GET /api/v1/manager/accounts/:account_id/summary
Resumen de cuenta para consulta operativa manager.

Acepta account_id o account_number en :account_id.

### GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments
Plan de pagos paginado para manager.

Query params:
- page (default 1)
- per_page (default 10, max 50)

### GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/summary
Resumen agregado de cuotas para manager.

Uso recomendado:
- UI y reportes que solo necesitan contadores paid/pending sin recorrer paginas.

Respuesta ejemplo:
{
  "account_id": 10,
  "loan_id": 6,
  "paid_count": 4,
  "pending_count": 8,
  "total": 12
}

### GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/download
Descarga plan de pagos completo en CSV.

### POST /api/v1/manager/accounts/:account_id/deposit
Deposito por manager en cuenta objetivo.

### POST /api/v1/manager/accounts/:account_id/withdraw
Retiro por manager en cuenta objetivo.

### POST /api/v1/manager/accounts/:account_id/loans/:loan_id/pay
Pago de prestamo por manager.

## 9. Ejemplos cURL rapidos

### Login
curl -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"account_number":"1234567890","pin":"1234"}'

### Deposito cuenta
curl -X POST http://localhost:3001/api/v1/accounts/1/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":1000,"description":"Deposito"}'

### Retiro cuenta
curl -X POST http://localhost:3001/api/v1/accounts/1/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":250,"description":"Retiro"}'

### Pago prestamo (debita cuenta)
curl -X POST http://localhost:3001/api/v1/accounts/1/loans/1/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":5000}'

### ATM retiro
curl -X POST http://localhost:3001/api/v1/atm/accounts/1/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"pin":"1234","amount":300}'

### Reporte gerencial
curl -X GET http://localhost:3001/api/v1/manager/reports/overview \
  -H "Authorization: Bearer TOKEN_MANAGER"

### Preview prestamo manager
curl -X POST http://localhost:3001/api/v1/manager/accounts/9000000001/loans/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_MANAGER" \
  -d '{"amount":15000,"term_months":12,"first_due_date":"2026-08-15"}'

### Resumen de cuotas manager (nuevo)
curl -X GET http://localhost:3001/api/v1/manager/accounts/9000000001/loans/6/installments/summary \
  -H "Accept: application/json" \
  -H "Authorization: Bearer TOKEN_MANAGER"

Respuesta esperada:
{
  "account_id": 10,
  "loan_id": 6,
  "paid_count": 4,
  "pending_count": 8,
  "total": 12
}

### Descargar plan CSV manager
curl -X GET http://localhost:3001/api/v1/manager/accounts/9000000001/loans/6/installments/download \
  -H "Accept: text/csv" \
  -H "Authorization: Bearer TOKEN_MANAGER" -o loan_6_installments.csv

### Direccion de usuario
curl -X PUT http://localhost:3001/api/v1/users/1/address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"country":"Peru","city":"Lima","province":"Lima","street":"Av. Principal","street_number":"123"}'

### Upload archivo usuario
curl -X POST http://localhost:3001/api/v1/users/1/files \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@C:/tmp/comprobante.png"

## 10. Notas operativas

- Todas las operaciones monetarias exigen montos positivos.
- Retiros y pago de prestamo validan fondos.
- El role por defecto en registro es customer.
- Para pruebas de manager, asignar role manager desde consola/DB a un usuario.

## 11. Prueba integral automatizada

Script unificado para validar el flujo completo de operaciones financieras:
- scripts/test_full_financial_flow.ps1

Comando:
- powershell -ExecutionPolicy Bypass -File scripts/test_full_financial_flow.ps1

Reporte generado:
- tmp/full_financial_flow_report.json

## 12. Novedades recientes

- Se agrego endpoint de resumen de cuotas manager:
  - GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/summary
  - Retorna paid_count y pending_count para consumo rapido en UI/reportes.
- Se consolido el flujo manager de originacion:
  - preview del plan (POST /loans/preview)
  - originacion (POST /loans)
  - descarga CSV del plan (GET /installments/download)
- Mejora de performance en frontend admin:
  - ahora usa installments/summary para contadores globales de cuotas, evitando recorrer todas las paginas de installments.
