# Nuevas funcionalidades implementadas

Este documento resume las nuevas funcionalidades agregadas a la solución, las APIs creadas, los cambios en el código y ejemplos de consumo.

## 1. Objetivo
Se añadieron nuevas capacidades para que la solución bancaria tenga más funcionalidad realista y permita:
- consultar saldo de una cuenta,
- transferir saldo entre cuentas,
- ver un resumen mensual,
- cambiar el PIN del usuario,
- consultar perfil del usuario,
- consultar detalle de servicios,
- buscar destinatarios por CLABE,
- cerrar sesión.

---

## 2. Cambios realizados en el código

### 2.1 Rutas nuevas
Se añadieron nuevas rutas en [bankfacilito/config/routes.rb](bankfacilito/config/routes.rb) para exponer las nuevas APIs bajo el prefijo /api/v1.

Rutas añadidas:
- POST /api/v1/accounts/:id/transfer
- GET /api/v1/accounts/:id/balance
- GET /api/v1/accounts/:id/summary
- PUT /api/v1/users/:id/pin
- GET /api/v1/users/:id/profile
- GET /api/v1/services/:id
- GET /api/v1/recipients/search
- POST /api/v1/logout

### 2.2 Controlador de cuentas
Se actualizó [bankfacilito/app/controllers/accounts_controller.rb](bankfacilito/app/controllers/accounts_controller.rb) para agregar:
- balance: devuelve el saldo actual de una cuenta.
- summary: devuelve un resumen mensual con ingresos, egresos y saldo.
- transfer: permite mover fondos entre cuentas utilizando la lógica de transacciones existente.

### 2.3 Controlador de usuarios
Se actualizó [bankfacilito/app/controllers/users_controller.rb](bankfacilito/app/controllers/users_controller.rb) para agregar:
- pin: permite cambiar el PIN si el PIN actual es correcto.
- profile: devuelve los datos públicos del usuario autenticado.
- logout: entrega una respuesta de cierre de sesión.

### 2.4 Controlador de servicios
Se actualizó [bankfacilito/app/controllers/services_controller.rb](bankfacilito/app/controllers/services_controller.rb) para agregar:
- show: permite ver los detalles de un servicio por su ID.

### 2.5 Controlador de destinatarios
Se actualizó [bankfacilito/app/controllers/recipients_controller.rb](bankfacilito/app/controllers/recipients_controller.rb) para agregar:
- search: permite buscar un destinatario por CLABE.

---

## 3. APIs añadidas

### 3.1 Consultar saldo

#### Endpoint
GET /api/v1/accounts/:id/balance

#### Authorization
Sí requerida.

#### Headers
- Authorization: Bearer <token>

#### Body
Ninguno.

#### Params
- id: ID de la cuenta.

#### Ejemplo
```bash
curl http://localhost:3001/api/v1/accounts/1/balance \
  -H "Authorization: Bearer <token>"
```

---

### 3.2 Transferencia entre cuentas

#### Endpoint
POST /api/v1/accounts/:id/transfer

#### Authorization
Sí requerida.

#### Headers
- Content-Type: application/json
- Authorization: Bearer <token>

#### Body
```json
{
  "recipient_account_id": 2,
  "amount": 200,
  "description": "Pago de renta"
}
```

#### Params
- id: ID de la cuenta origen.

#### Ejemplo
```bash
curl -X POST http://localhost:3001/api/v1/accounts/1/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"recipient_account_id":2,"amount":200,"description":"Pago de renta"}'
```

---

### 3.3 Resumen mensual

#### Endpoint
GET /api/v1/accounts/:id/summary

#### Authorization
Sí requerida.

#### Headers
- Authorization: Bearer <token>

#### Body
Ninguno.

#### Params
- id: ID de la cuenta.

#### Ejemplo
```bash
curl http://localhost:3001/api/v1/accounts/1/summary \
  -H "Authorization: Bearer <token>"
```

---

### 3.4 Cambiar PIN

#### Endpoint
PUT /api/v1/users/:id/pin

#### Authorization
Sí requerida.

#### Headers
- Content-Type: application/json
- Authorization: Bearer <token>

#### Body
```json
{
  "current_pin": "1234",
  "new_pin": "5678"
}
```

#### Params
- id: ID del usuario.

#### Ejemplo
```bash
curl -X PUT http://localhost:3001/api/v1/users/1/pin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"current_pin":"1234","new_pin":"5678"}'
```

---

### 3.5 Perfil del usuario

#### Endpoint
GET /api/v1/users/:id/profile

#### Authorization
Sí requerida.

#### Headers
- Authorization: Bearer <token>

#### Body
Ninguno.

#### Params
- id: ID del usuario.

#### Ejemplo
```bash
curl http://localhost:3001/api/v1/users/1/profile \
  -H "Authorization: Bearer <token>"
```

---

### 3.6 Detalle de un servicio

#### Endpoint
GET /api/v1/services/:id

#### Authorization
Sí requerida.

#### Headers
- Authorization: Bearer <token>

#### Body
Ninguno.

#### Params
- id: ID del servicio.

#### Ejemplo
```bash
curl http://localhost:3001/api/v1/services/1 \
  -H "Authorization: Bearer <token>"
```

---

### 3.7 Buscar destinatario por CLABE

#### Endpoint
GET /api/v1/recipients/search?clabe=1234567890

#### Authorization
Sí requerida.

#### Headers
- Authorization: Bearer <token>

#### Body
Ninguno.

#### Params
- clabe: CLABE del destinatario.

#### Ejemplo
```bash
curl "http://localhost:3001/api/v1/recipients/search?clabe=1234567890" \
  -H "Authorization: Bearer <token>"
```

---

### 3.8 Cerrar sesión

#### Endpoint
POST /api/v1/logout

#### Authorization
Sí requerida.

#### Headers
- Authorization: Bearer <token>

#### Body
Ninguno.

#### Params
Ninguno.

#### Ejemplo
```bash
curl -X POST http://localhost:3001/api/v1/logout \
  -H "Authorization: Bearer <token>"
```

---

## 4. Cambios en la lógica de negocio

### 4.1 Transferencias
Se reutilizó la lógica existente del servicio de transacciones para asegurar que:
- el monto sea mayor que cero,
- la cuenta origen tenga fondos suficientes,
- no se pueda transferir a la misma cuenta,
- se registren transacciones en ambas cuentas.

### 4.2 Cambio de PIN
El cambio de PIN valida que el PIN actual sea correcto antes de actualizarlo. Si no lo es, la API devuelve un error 401.

### 4.3 Perfil del usuario
Se devuelve un JSON minimalista con los datos básicos del usuario autenticado.

### 4.4 Detalle de servicios
Se devuelve nombre y descripción del servicio solicitado.

### 4.5 Buscar destinatarios
La búsqueda se realiza por CLABE y devuelve el destinatario asociado si existe.

---

## 5. Consideraciones importantes
- Todas las nuevas APIs requieren autenticación mediante JWT.
- La base de datos sigue siendo SQLite local.
- El proyecto continúa usando el prefijo /api/v1 para todas las nuevas rutas.

---

## 6. Siguiente paso recomendado
El siguiente paso es validar estas APIs con pruebas de request o con llamadas reales a la API usando Postman o curl.
