# API Documentation

Este documento describe los endpoints disponibles en la API del proyecto, incluyendo método HTTP, ruta, headers, body/params, y si requieren Authorization.

## Notas generales
- La API base es: http://localhost:3001
- Los endpoints están bajo el prefijo /api/v1
- La autenticación se realiza mediante JWT en el header Authorization: Bearer <token>

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

## Sugerencias de nuevas APIs para añadir

Estas son buenas mejoras para una solución bancaria y encajan bien con el dominio actual del proyecto.

### 1) Transferencia entre cuentas

### POST /api/v1/accounts/:id/transfer
- Descripción: Transfiere saldo desde una cuenta a otra.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "recipient_account_id": 2,
  "amount": 200,
  "description": "Pago de renta"
}
```
- Params:
  - id: ID de la cuenta origen.

### 2) Consultar saldo

### GET /api/v1/accounts/:id/balance
- Descripción: Devuelve el saldo actual de una cuenta.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID de la cuenta.

### 3) Historial de transacciones filtrado

### GET /api/v1/accounts/:id/transactions?from=2026-01-01&to=2026-12-31
- Descripción: Devuelve transacciones por rango de fechas.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID de la cuenta.
  - from: Fecha inicial.
  - to: Fecha final.

### 4) Cambiar PIN

### PUT /api/v1/users/:id/pin
- Descripción: Cambia el PIN del usuario.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "current_pin": "1234",
  "new_pin": "5678"
}
```
- Params:
  - id: ID del usuario.

### 5) Obtener perfil del usuario

### GET /api/v1/users/:id/profile
- Descripción: Devuelve el perfil del usuario autenticado.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID del usuario.

### 6) Crear servicio nuevo

### POST /api/v1/services
- Descripción: Permite crear un servicio administrable.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "name": "Internet",
  "account_id": 1
}
```
- Params: Ninguno.

### 7) Obtener detalle de un servicio

### GET /api/v1/services/:id
- Descripción: Retorna la información de un servicio en particular.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID del servicio.

### 8) Buscar destinatario por CLABE

### GET /api/v1/recipients/search?clabe=1234567890
- Descripción: Busca un destinatario por CLABE.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - clabe: CLABE del destinatario.

### 9) Obtener resumen del mes

### GET /api/v1/accounts/:id/summary
- Descripción: Devuelve un resumen de ingresos, egresos y saldo del mes.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID de la cuenta.

### 10) Cerrar sesión

### POST /api/v1/logout
- Descripción: Invalida el token actual.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params: Ninguno.

---

## APIs adicionales ya implementadas

### GET /api/v1/accounts/:id/balance
- Descripción: Devuelve el saldo actual de una cuenta.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID de la cuenta.

### POST /api/v1/accounts/:id/transfer
- Descripción: Transfiere saldo entre cuentas.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "recipient_account_id": 2,
  "amount": 200,
  "description": "Pago de renta"
}
```
- Params:
  - id: ID de la cuenta origen.

### GET /api/v1/accounts/:id/summary
- Descripción: Devuelve un resumen mensual de ingresos, egresos y saldo.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID de la cuenta.

### PUT /api/v1/users/:id/pin
- Descripción: Cambia el PIN del usuario.
- Authorization: Sí requerida.
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
- Body (JSON):
```json
{
  "current_pin": "1234",
  "new_pin": "5678"
}
```
- Params:
  - id: ID del usuario.

### GET /api/v1/users/:id/profile
- Descripción: Devuelve el perfil del usuario autenticado.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID del usuario.

### GET /api/v1/services/:id
- Descripción: Devuelve el detalle de un servicio.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - id: ID del servicio.

### GET /api/v1/recipients/search?clabe=1234567890
- Descripción: Busca un destinatario por CLABE.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params:
  - clabe: CLABE del destinatario.

### POST /api/v1/logout
- Descripción: Cierra la sesión del usuario.
- Authorization: Sí requerida.
- Headers:
  - Authorization: Bearer <token>
- Body: Ninguno.
- Params: Ninguno.
