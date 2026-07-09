# Resumen General de la Plataforma Financiera

Este documento resume en forma clara y detallada las funcionalidades financieras del sistema, incluyendo banca digital, operaciones de cajero (ATM), prestamos y capacidades de gestion para rol gerente.

## 1. Modulos funcionales

### 1.1 Banca de cliente
- Registro y login con JWT.
- Registro extendido con first_name, last_name, email, phone y pin.
- Gestion de cuentas del usuario.
- Gestion de direccion de usuario (pais, ciudad, provincia, calle y extras).
- Carga de archivos de texto e imagen por usuario.
- Consulta de saldo y resumen mensual.
- Transferencias entre cuentas.
- Pago de servicios.
- Depositos y retiros directos sobre cuenta.

### 1.2 Prestamos
- Solicitud de prestamo asociada a una cuenta.
- Tasa de interes anual segun rango de monto.
- Generacion automatica de plan de cuotas mensuales.
- Consulta de prestamo, cuotas pagadas y pendientes.
- Pago del prestamo debitado desde la cuenta del cliente.

### 1.3 Simulacion de ATM
- Deposito por cajero con validacion de PIN.
- Retiro por cajero con validacion de PIN y fondos.
- Consulta de saldo por ATM.
- Mini estado de cuenta (ultimas 10 transacciones).

### 1.4 Rol gerente
- Reporte general operativo y financiero.
- Reporte de cartera de prestamos.
- Reporte de actividad de cuentas por ventana de dias.
- Accion operativa de cancelacion de prestamo por gerencia.
- Gestion de usuarios: agregar, vista de usuarios y eliminar usuarios.

## 2. Reglas de negocio clave

### 2.1 Tasas de interes anual de prestamo
- <= 100000: 5.0%
- > 100000 y <= 200000: 5.5%
- > 200000: 6.0%

### 2.2 Pagos de prestamo
- El pago SI se debita del saldo de la cuenta del cliente.
- El pago se distribuye en este orden:
  1. Interes pendiente.
  2. Capital pendiente.
- El sistema impide pagar mas que el saldo total pendiente del prestamo.

### 2.3 Movimientos y saldo
- Depositos incrementan saldo.
- Retiros disminuyen saldo.
- Se valida monto positivo e integer para operaciones monetarias.
- Se evita saldo negativo por validacion de fondos insuficientes.

## 3. Roles y seguridad

### 3.1 Roles
- customer (por defecto): operaciones de su propia cuenta.
- manager: acceso a endpoints de reporte y acciones gerenciales.

### 3.2 Seguridad
- JWT obligatorio para endpoints protegidos.
- Control de acceso por rol para modulo manager.
- PIN obligatorio para operaciones ATM.

## 4. Estructura de datos agregada

- users.role (customer/manager)
- users.phone
- user_addresses (direccion detallada por usuario)
- user_files (metadatos de archivos cargados por usuario)
- transactions.transaction_type con nuevos tipos:
  - loan_payment
  - atm_deposit
  - atm_withdrawal

## 5. Flujo operativo recomendado

1. Cliente se registra e inicia sesion.
2. Cliente opera cuenta (deposito/retiro/transferencia/pago servicio).
3. Cliente solicita prestamo.
4. Sistema genera plan de cuotas.
5. Cliente paga cuotas con debito a su cuenta.
6. Cliente y sistema consultan saldo de prestamo y cuotas.
7. Gerencia monitorea reportes y gestiona incidencias (ej. cancelacion por politica).

## 6. Operacion local

1. Levantar servicio:
- docker compose up --build -d

2. Migrar base de datos:
- docker compose exec -T api bundle exec rails db:migrate

3. Verificar API:
- GET http://localhost:3001/

## 7. Documentacion de APIs

El detalle completo de endpoints, rutas, body y ejemplos esta en:
- FINANCIAL_APIS.md

## 8. Prueba integral automatizada

Se agrego un script unico para validar el flujo completo de financiera (cliente + prestamos + ATM + gerente + reportes):
- scripts/test_full_financial_flow.ps1

Ejecucion:
- powershell -ExecutionPolicy Bypass -File scripts/test_full_financial_flow.ps1

Salida:
- tmp/full_financial_flow_report.json
