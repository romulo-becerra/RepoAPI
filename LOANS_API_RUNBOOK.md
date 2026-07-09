# Guia de APIs de Prestamos

Este documento concentra todo lo necesario para usar, probar y validar las APIs nuevas de prestamos.

## 1. Alcance funcional implementado

Las APIs de prestamos permiten:
- Registrar un prestamo asociado a una cuenta.
- Asignar interes anual segun el monto solicitado.
- Generar automaticamente un plan de pagos (cuotas mensuales).
- Consultar el estado del prestamo desde la cuenta.
- Aplicar pagos al prestamo reduciendo interes y luego capital.
- Consultar cuotas pagadas y cuotas pendientes.

## 2. Reglas de negocio

### 2.1 Tasa anual segun monto
- Monto menor o igual a 100000: 5.0%
- Monto mayor a 100000 y menor o igual a 200000: 5.5%
- Monto mayor a 200000: 6.0%

Nota: El interes que se cobra por cuota es mensual, calculado como tasa_anual / 12.

### 2.2 Orden de aplicacion de pagos
Cuando se aplica un pago:
1. Se cubre primero el interes pendiente de la cuota.
2. Luego se cubre capital pendiente.
3. Si sobra dinero, se aplica a cuotas siguientes.

## 3. Endpoints nuevos de prestamos

Base URL local: http://localhost:3001

Todos los endpoints de prestamos requieren header Authorization: Bearer TOKEN.

### 3.1 Crear prestamo
- Metodo: POST
- Ruta: /api/v1/accounts/:account_id/loans
- Body JSON:

{
  "amount": 120000,
  "term_months": 24,
  "first_due_date": "2026-08-15"
}

- Respuesta esperada:
  - message
  - account_id
  - loan (incluye installments)

### 3.2 Listar prestamos de una cuenta
- Metodo: GET
- Ruta: /api/v1/accounts/:account_id/loans

### 3.3 Ver detalle de prestamo
- Metodo: GET
- Ruta: /api/v1/accounts/:account_id/loans/:id

### 3.4 Aplicar pago al prestamo
- Metodo: POST
- Ruta: /api/v1/accounts/:account_id/loans/:id/pay
- Body JSON:

{
  "amount": 5000,
  "paid_on": "2026-08-20T10:30:00Z"
}

- Respuesta esperada:
  - payment.principal_paid
  - payment.interest_paid
  - payment.remaining_payment
  - loan (actualizado)

### 3.5 Consultar cuotas pagadas y pendientes
- Metodo: GET
- Ruta: /api/v1/accounts/:account_id/loans/:id/installments

## 4. Endpoint relacionado de cuenta

Se actualizo el endpoint de cuenta para visibilidad de prestamo:
- Metodo: GET
- Ruta: /api/v1/accounts/:id

Campos relevantes:
- loan.has_active_loan
- loan.total_loan_amount
- loan.outstanding_principal
- loan.paid_installments_count
- loan.pending_installments_count

## 5. Flujo recomendado para la aplicacion

1. Login del usuario para obtener token y cuenta.
2. Crear prestamo con monto y plazo.
3. Guardar loan.id devuelto.
4. Mostrar en pantalla de cuenta el resumen de prestamo.
5. Mostrar cronograma con endpoint de installments.
6. Registrar pagos con endpoint pay.
7. Refrescar detalle de prestamo y cuenta para mostrar saldo capital y cuotas pagadas.

## 6. Como correr el proyecto para pruebas

### 6.1 Levantar servicios

Ejecutar:
- docker compose up --build -d

### 6.2 Migrar base de datos

Ejecutar:
- docker compose exec -T api bundle exec rails db:migrate

### 6.3 Verificar que responde

Ejecutar:
- curl.exe -s -o NUL -w "%{http_code}" http://localhost:3001

Debe responder 200.

## 7. Pruebas con Postman

Se incluyeron archivos listos para importar:
- postman/collections/RepoAPI-All-Endpoints.postman_collection.json
- postman/collections/RepoAPI-Loans.postman_collection.json
- postman/environments/RepoAPI-Local.postman_environment.json

### 7.1 Importar
1. Abrir Postman.
2. Importar la coleccion RepoAPI-All-Endpoints para cubrir toda la API.
3. Importar el environment.
4. Seleccionar el environment RepoAPI Local.

### 7.2 Orden de ejecucion sugerido
1. Auth > Register User
2. Auth > Login User
3. Loans > Create Loan
4. Loans > List Loans
5. Loans > Get Loan Detail
6. Loans > Pay Loan
7. Loans > Get Installments
8. Loans > Account With Loan Summary

La coleccion incluye scripts de test para guardar automaticamente:
- token
- user_id
- account_number
- account_id
- loan_id

## 8. Pruebas con cURL o PowerShell

### 8.1 cURL - Login

curl -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"account_number":"ACCOUNT_NUMBER","pin":"1234"}'

### 8.2 cURL - Crear prestamo

curl -X POST http://localhost:3001/api/v1/accounts/ACCOUNT_ID/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":120000,"term_months":24,"first_due_date":"2026-08-15"}'

### 8.3 cURL - Pagar prestamo

curl -X POST http://localhost:3001/api/v1/accounts/ACCOUNT_ID/loans/LOAN_ID/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":5000}'

### 8.4 Script automatico de flujo completo

Tambien se incluyo:
- scripts/test_loans_flow.ps1

Ejemplo de ejecucion:
- powershell -ExecutionPolicy Bypass -File scripts/test_loans_flow.ps1

## 9. Casos de prueba recomendados

1. Crear prestamo de 9000 y validar tasa 5.0.
2. Crear prestamo de 150000 y validar tasa 5.5.
3. Crear prestamo de 250000 y validar tasa 6.0.
4. Hacer pago parcial y validar cuota en estado partial.
5. Hacer pago completo de cuota y validar estado paid con paid_at.
6. Completar todo el prestamo y validar loan.status = completed.

## 10. Solucion de problemas

- Error 401: validar token en Authorization.
- Error 404 cuenta: validar account_id del usuario autenticado.
- Error 422 monto/plazo: revisar amount mayor a 0 y term_months mayor a 0.
- Error de migracion: volver a ejecutar db:migrate dentro del contenedor.

## 11. Funcionalidad financiera extendida

Se agrego soporte adicional para operar el sistema como financiera:
- Depositos y retiros directos en cuenta.
- Simulacion de operaciones ATM con validacion de PIN.
- Pago de prestamo debitado desde la cuenta del cliente.
- Reportes y acciones por rol gerente.

Documentos relacionados:
- FINANCIAL_PLATFORM_SUMMARY.md
- FINANCIAL_APIS.md
