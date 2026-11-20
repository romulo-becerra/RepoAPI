# API Documentation

Este documento describe los endpoints disponibles en la API del proyecto, incluyendo método HTTP, ruta, headers, body/params, y si requieren Authorization.

## Notas generales
- La API base es: http://localhost:3001
- Los endpoints están bajo el prefijo /api/v1
- La autenticación se realiza mediante JWT en el header Authorization: Bearer <token>
- El sistema usa la siguiente matriz: customer, cashier, customer_service, manager, admin y roles especializados.

## Matriz de permisos por rol

| Rol | Permisos principales |
| --- | --- |
| customer | Consulta su propia cuenta, transferencias, pago de servicios, movimientos y estado de préstamos. |
| cashier | Apertura/cierre de caja, depósitos, retiros, pagos y transferencias en ventanilla. |
| customer_service | Registro y actualización de clientes, desbloqueo, reset de PIN, cuentas, soporte y casos. |
| manager | Reportes, consultas de gestión, operaciones de cuenta, originación de préstamos y revisión de logs. |
| admin | Acceso completo: administración de usuarios, estados, roles, reportes, operaciones y gestión interna. |

### Regla de acceso
- customer solo puede operar sobre su propia cuenta y pagos de servicio asociados.
- cashier puede realizar operaciones de caja, pero no crear usuarios ni administrar roles.
- customer_service puede gestionar clientes, acceso básico, cuentas de ahorro/corriente y casos; no opera caja ni movimientos financieros.
- manager puede consultar y operar en gestión, pero no crear/bloquear usuarios de administración ni cambiar roles.
- admin es el único rol con capacidad total para crear, eliminar, bloquear y cambiar el estado de usuarios y roles.

---

## 1) Health Check

### GET /
- Descripción: Verifica que la API esté funcionando.
- Authorization: No requerida.
- Headers:
  - Content-Type: application/json (opcional)
- Body: Ninguno.
- Params: Ninguno.

Ejemplo:
```bash
curl http://localhost:3001/
```

---

## 2) Registro de usuario

### POST /api/v1/register
- Descripción: Registra un nuevo usuario.
- Authorization: No requerida.
- Headers:
  - Content-Type: application/json
- Body (JSON):
```json
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan.perez@example.com",
  "pin": "1234"
}
```
- Params: Ninguno.

Ejemplo:
```bash
curl -X POST http://localhost:3001/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Juan","last_name":"Perez","email":"juan.perez@example.com","pin":"1234"}'
```

---

## 3) Inicio de sesión

### POST /api/v1/login
- Descripción: Inicia sesión del usuario.
- Authorization: No requerida.
- Headers:
  - Content-Type: application/json
- Body (JSON):
```json
{
  "account_number": "2152221842",
  "pin": "1234"
}
```
- Params: Ninguno.

Ejemplo:
```bash
curl -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"account_number":"2152221842","pin":"1234"}'
```

---

## 4) Actualizar usuario

### PUT /api/v1/users/:id
- Descripción: Actualiza datos del usuario.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "first_name": "Cody",
  "last_name": "Facilito",
  "email": "ayuda@codigofacilito.com"
}
```
- Params:
  - id: ID del usuario a actualizar.

Ejemplo:
```bash
curl -X PUT http://localhost:3001/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"first_name":"Cody","last_name":"Facilito","email":"ayuda@codigofacilito.com"}'
```

---

## 5) Listar cuentas

### GET /api/v1/accounts
- Descripción: Lista todas las cuentas.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params: Ninguno.

Ejemplo:
```bash
curl http://localhost:3001/api/v1/accounts \
  -H "Authorization: Bearer <token>"
```

---

## 6) Crear cuenta

### POST /api/v1/accounts
- Descripción: Crea una nueva cuenta.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "account_type": 0
}
```
- Params: Ninguno.

Ejemplo:
```bash
curl -X POST http://localhost:3001/api/v1/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"account_type":0}'
```

---

## 7) Obtener cuenta por ID

### GET /api/v1/accounts/:id
- Descripción: Muestra una cuenta específica.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID de la cuenta.

Ejemplo:
```bash
curl http://localhost:3001/api/v1/accounts/1 \
  -H "Authorization: Bearer <token>"
```

---

## 8) Listar transacciones de una cuenta

### GET /api/v1/accounts/:account_id/transactions
- Descripción: Lista las transacciones de una cuenta.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - account_id: ID de la cuenta.

Ejemplo:
```bash
curl http://localhost:3001/api/v1/accounts/1/transactions \
  -H "Authorization: Bearer <token>"
```

---

## 9) Crear transacción

### POST /api/v1/accounts/:account_id/transactions
- Descripción: Crea una transacción para una cuenta.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "amount": 100,
  "transaction_type": "deposit"
}
```
- Params:
  - account_id: ID de la cuenta.

Ejemplo:
```bash
curl -X POST http://localhost:3001/api/v1/accounts/1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":100,"transaction_type":"deposit"}'
```

---

## 10) Pagar servicio

### POST /api/v1/accounts/:id/pay_service
- Descripción: Realiza el pago de un servicio.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "service_id": 1,
  "amount": 50
}
```
- Params:
  - id: ID de la cuenta.

Ejemplo:
```bash
curl -X POST http://localhost:3001/api/v1/accounts/1/pay_service \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"service_id":1,"amount":50}'
```

---

## 11) Listar destinatarios

### GET /api/v1/recipients
- Descripción: Lista los destinatarios del usuario autenticado.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params: Ninguno.

Ejemplo:
```bash
curl http://localhost:3001/api/v1/recipients \
  -H "Authorization: Bearer <token>"
```

---

## 12) Crear destinatario

### POST /api/v1/recipients
- Descripción: Crea un destinatario.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "name": "Carlos",
  "account_number": "1234567890"
}
```
- Params: Ninguno.

Ejemplo:
```bash
curl -X POST http://localhost:3001/api/v1/recipients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Carlos","account_number":"1234567890"}'
```

---

## 13) Eliminar destinatario

### DELETE /api/v1/recipients/:id
- Descripción: Elimina un destinatario.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID del destinatario.

Ejemplo:
```bash
curl -X DELETE http://localhost:3001/api/v1/recipients/1 \
  -H "Authorization: Bearer <token>"
```

---

## 14) Listar servicios

### GET /api/v1/services
- Descripción: Lista los servicios disponibles.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params: Ninguno.

Ejemplo:
```bash
curl http://localhost:3001/api/v1/services \
  -H "Authorization: Bearer <token>"
```

---

  ## Referencias de documentación extendida

  - Para el catálogo financiero completo (incluye manager, préstamos, ATM, archivos y novedades recientes), ver [FINANCIAL_APIS.md](FINANCIAL_APIS.md).
  - Para catálogo interactivo con ejemplos completos request/response, ver [public/angelfire/endpoints.html](public/angelfire/endpoints.html).

---

## Actualizaciones recientes (2026-07)

Esta sección resume endpoints manager y mejoras incorporadas recientemente para originación y consulta de préstamos.

### 1) Previsualizar plan de préstamo (manager)

### POST /api/v1/manager/accounts/:account_id/loans/preview
- Descripción: Genera una previsualización del plan de cuotas antes de originar el préstamo.
- Authorization: Sí requerida (manager).
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token_manager>
- Body (JSON):
```json
{
  "amount": 15000,
  "term_months": 12,
  "first_due_date": "2026-08-15"
}
```

Ejemplo cURL:
```bash
curl -X POST http://localhost:3001/api/v1/manager/accounts/9000000001/loans/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_manager>" \
  -d '{"amount":15000,"term_months":12,"first_due_date":"2026-08-15"}'
```

Respuesta ejemplo:
```json
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
```

### 2) Originar préstamo en cuenta objetivo (manager)

### POST /api/v1/manager/accounts/:account_id/loans
- Descripción: Crea el préstamo y su cronograma en la cuenta indicada.
- Authorization: Sí requerida (manager).
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token_manager>

Ejemplo cURL:
```bash
curl -X POST http://localhost:3001/api/v1/manager/accounts/9000000001/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_manager>" \
  -d '{"amount":15000,"term_months":12,"first_due_date":"2026-08-15"}'
```

### 3) Resumen de cuotas pagadas/pendientes (nuevo)

### GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/summary
- Descripción: Retorna totales de cuotas pagadas y pendientes para un préstamo.
- Authorization: Sí requerida (manager).
- Headers:
  - Accept: application/json
  - Authorization: Bearer <token_manager>
- Params:
  - account_id: ID de cuenta o número de cuenta.
  - loan_id: ID del préstamo.

Ejemplo cURL:
```bash
curl -X GET http://localhost:3001/api/v1/manager/accounts/9000000001/loans/6/installments/summary \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token_manager>"
```

Respuesta ejemplo:
```json
{
  "account_id": 10,
  "loan_id": 6,
  "paid_count": 4,
  "pending_count": 8,
  "total": 12
}
```

### 4) Descarga de plan de pagos CSV (manager)

### GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/download
- Descripción: Descarga el plan de cuotas completo en formato CSV.
- Authorization: Sí requerida (manager).

Ejemplo cURL:
```bash
curl -X GET http://localhost:3001/api/v1/manager/accounts/9000000001/loans/6/installments/download \
  -H "Accept: text/csv" \
  -H "Authorization: Bearer <token_manager>" -o loan_6_installments.csv
```

### 5) Mejora funcional aplicada

- La consulta manager de cuenta acepta tanto account_id como account_number en :account_id.
- El endpoint de resumen de cuenta para operaciones de personal autorizado también valida la cuenta antes de permitir continuar con depositos, retiros, pagos y prestamo: una cuenta invalida debe bloquear los campos y mostrar un mensaje de validacion; una cuenta valida muestra nombre del cliente asociado y habilita el flujo.
- El acceso a la busqueda de cuenta aplica al staff autorizado (admin, manager y cashier) para la operacion de cuenta de usuario; el origen de prestamo sigue reservado a admin/manager, con la misma validacion previa de cuenta antes de habilitar monto, plazo y fecha.
- Para mostrar totales paid/pending en frontend admin, se recomienda usar el endpoint /installments/summary en lugar de recorrer todas las páginas de /installments.

## Actualización de endpoints (2026-11-19)

### Cajero

- POST /api/v1/cashier/cash/open
- GET /api/v1/cashier/cash/status
- GET /api/v1/cashier/cash/movements
- POST /api/v1/cashier/cash/reconciliation
- POST /api/v1/cashier/cash/close
- GET /api/v1/cashier/reports/daily
- GET /api/v1/cashier/receipts
- GET /api/v1/cashier/clients/search

### Atención al Cliente

- GET /api/v1/customer_service/users/search
- POST /api/v1/customer_service/users
- PATCH /api/v1/customer_service/users/:id
- PATCH /api/v1/customer_service/users/:id/unblock
- PATCH /api/v1/customer_service/users/:id/deactivate
- PATCH /api/v1/customer_service/users/:id/reactivate
- PATCH /api/v1/customer_service/users/:id/reset_password
- POST /api/v1/customer_service/accounts
- PATCH /api/v1/customer_service/accounts/:id/status
- GET /api/v1/customer_service/users/:user_id/accounts
- GET /api/v1/customer_service/tickets
- POST /api/v1/customer_service/tickets
- PATCH /api/v1/customer_service/tickets/:id/close

### Portal del cliente

- GET /api/v1/customer/dashboard
- GET /api/v1/customer/transactions
- GET /api/v1/customer/accounts/:account_id/statement
- GET /api/v1/customer/credit_requests
- POST /api/v1/customer/credit_requests
- GET /api/v1/customer/tickets
- POST /api/v1/customer/tickets
- GET /api/v1/customer/preferences
- PATCH /api/v1/customer/preferences
- GET /api/v1/customer/notifications
- PATCH /api/v1/customer/notifications/:id/read

### Comprobantes y recuperación

- GET /api/v1/receipts/:id
- GET /api/v1/receipts/:id/download
- GET /api/v1/transactions/:transaction_id/receipt
- POST /api/v1/password/reset/request
- POST /api/v1/password/reset
- POST /api/v1/accounts/:id/reverse/:transaction_id

### Roles, conciliación, contabilidad y facturas

- GET /api/v1/manager/roles
- GET /api/v1/manager/reports/dashboard
- GET /api/v1/manager/reconciliations
- POST /api/v1/manager/reconciliations
- GET /api/v1/manager/accounting/accounts
- POST /api/v1/manager/accounting/accounts
- GET /api/v1/manager/accounting/journal_entries
- POST /api/v1/manager/accounting/journal_entries
- POST /api/v1/manager/accounting/journal_entries/:id/approve
- GET /api/v1/manager/accounting/reports
- GET /api/v1/manager/invoices
- POST /api/v1/manager/invoices
- PATCH /api/v1/manager/accounts/:account_id/limits
- PATCH /api/v1/manager/accounts/:account_id/status
