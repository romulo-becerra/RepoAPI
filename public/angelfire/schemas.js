/* Esquemas request/response de la API v1 de AngelFire.
   Todo se define como JSON Schema (subset compatible con OpenAPI 3.1), de modo que
   las tablas de la pagina y el documento OpenAPI descargable salen de una sola fuente. */
(function () {
  'use strict';

  const API_BASE_URL = 'http://localhost:3001';

  const str = (description, extra = {}) => ({ type: 'string', description, ...extra });
  const nullableStr = (description) => ({ type: [ 'string', 'null' ], description });
  const int = (description, extra = {}) => ({ type: 'integer', description, ...extra });
  const nullableInt = (description) => ({ type: [ 'integer', 'null' ], description });
  const dec = (description) => ({ type: 'number', description });
  const bool = (description) => ({ type: 'boolean', description });
  const date = (description) => ({ type: 'string', format: 'date', description });
  const nullableDate = (description) => ({ type: [ 'string', 'null' ], format: 'date', description });
  const dateTime = (description) => ({ type: 'string', format: 'date-time', description });
  const nullableDateTime = (description) => ({ type: [ 'string', 'null' ], format: 'date-time', description });
  const enm = (values, description) => ({ type: 'string', enum: values, description });
  const arr = (items, description) => ({ type: 'array', items, description });
  const obj = (properties, extra = {}) => ({ type: 'object', properties, ...extra });
  const ref = (name, description) => (description
    ? { $ref: `#/components/schemas/${name}`, description }
    : { $ref: `#/components/schemas/${name}` });

  const TRANSACTION_TYPES = [
    'deposit',
    'withdraw',
    'transfer',
    'service_payment',
    'loan_payment',
    'atm_deposit',
    'atm_withdrawal'
  ];

  const loanProperties = {
    id: int('Identificador del prestamo.'),
    amount: dec('Monto original del prestamo.'),
    annual_interest_rate: dec('Tasa anual aplicada (%).'),
    term_months: int('Plazo en meses.'),
    monthly_payment: dec('Cuota mensual calculada.'),
    status: enm([ 'active', 'completed', 'cancelled' ], 'Estado del prestamo.'),
    disbursed_at: nullableDateTime('Fecha de desembolso.'),
    first_due_date: date('Fecha de la primera cuota.'),
    outstanding_principal: dec('Capital pendiente.'),
    paid_installments_count: int('Cuotas pagadas.'),
    pending_installments_count: int('Cuotas pendientes.')
  };

  const components = {
    ErrorResponse: obj({
      errors: {
        description: 'Mensaje de error o lista de mensajes de validacion.',
        oneOf: [
          str('Mensaje unico.'),
          arr(str('Mensaje de validacion.'), 'Lista de errores.')
        ]
      }
    }, { required: [ 'errors' ], description: 'Formato estandar de error de la API.' }),

    TransactionErrorResponse: obj({
      error: str('Mensaje de error del modulo de transacciones.')
    }, { required: [ 'error' ], description: 'Formato de error del modulo de transacciones.' }),

    MessageResponse: obj({
      message: str('Mensaje informativo.')
    }, { required: [ 'message' ] }),

    ServiceStatus: obj({
      status: enm([ 'ok' ], 'Estado del servicio.'),
      service: str('Nombre interno del servicio.'),
      message: str('Mensaje de bienvenida.')
    }, { required: [ 'status', 'service', 'message' ] }),

    AddressInput: obj({
      country: str('Pais.'),
      city: str('Ciudad.'),
      province: str('Provincia o departamento.'),
      street: str('Calle.'),
      street_number: str('Numero de calle.'),
      district: str('Distrito o zona.'),
      postal_code: str('Codigo postal.'),
      reference: str('Referencia adicional.')
    }, {
      required: [ 'country', 'city', 'province', 'street' ],
      description: 'Direccion del usuario. country, city, province y street son obligatorios.'
    }),

    Address: obj({
      id: int('Identificador de la direccion.'),
      user_id: int('Usuario propietario.'),
      country: str('Pais.'),
      city: str('Ciudad.'),
      province: str('Provincia o departamento.'),
      street: str('Calle.'),
      street_number: nullableStr('Numero de calle.'),
      district: nullableStr('Distrito o zona.'),
      postal_code: nullableStr('Codigo postal.'),
      reference: nullableStr('Referencia adicional.'),
      created_at: dateTime('Fecha de creacion.'),
      updated_at: dateTime('Fecha de actualizacion.')
    }, {
      required: [
        'id', 'user_id', 'country', 'city', 'province', 'street', 'street_number',
        'district', 'postal_code', 'reference', 'created_at', 'updated_at'
      ],
      description: 'Direccion registrada del usuario.'
    }),

    UserSummary: obj({
      id: int('Identificador del usuario.'),
      first_name: str('Nombres.'),
      last_name: str('Apellidos.'),
      email: str('Correo electronico.', { format: 'email' }),
      phone: nullableStr('Telefono en formato +59170000000.'),
      date_of_birth: nullableDate('Fecha de nacimiento (YYYY-MM-DD).'),
      role: enm([ 'customer', 'manager', 'cashier', 'admin', 'super_admin' ], 'Rol del usuario.')
    }, { required: [ 'id', 'first_name', 'last_name', 'email', 'role' ] }),

    RegisterRequest: obj({
      first_name: str('Nombres (obligatorio).'),
      last_name: str('Apellidos (obligatorio).'),
      email: str('Correo unico (obligatorio).', { format: 'email' }),
      phone: str('Telefono unico (opcional).'),
      date_of_birth: date('Fecha de nacimiento (opcional).'),
      pin: str('PIN numerico de 4 digitos (obligatorio).', { pattern: '^\\d{4}$' }),
      address: ref('AddressInput', 'Direccion opcional del usuario.')
    }, { required: [ 'first_name', 'last_name', 'email', 'pin' ] }),

    RegisterAccount: obj({
      account_number: str('Numero de cuenta generado.'),
      balance: dec('Saldo inicial (1000 por defecto).'),
      clabe: str('CLABE generada.')
    }, { required: [ 'account_number', 'balance', 'clabe' ] }),

    LoginAccount: obj({
      id: int('Identificador de la cuenta.'),
      clabe: str('CLABE interbancaria de 18 digitos.'),
      account_number: str('Numero de cuenta.')
    }, { required: [ 'id', 'clabe', 'account_number' ] }),

    LoginRequest: obj({
      account_number: str('Numero de cuenta del usuario.'),
      pin: str('PIN de 4 digitos.', { pattern: '^\\d{4}$' })
    }, { required: [ 'account_number', 'pin' ] }),

    LoginResponse: obj({
      message: str('Mensaje de exito.'),
      token: str('JWT para autenticar las siguientes peticiones.'),
      user: ref('UserSummary'),
      account: ref('LoginAccount')
    }, { required: [ 'token', 'user', 'account' ] }),

    RegisterResponse: obj({
      message: str('Mensaje de exito.'),
      token: str('JWT del usuario recien creado.'),
      user: ref('UserSummary'),
      address: ref('Address', 'Presente solo si se envio una direccion.'),
      account: ref('RegisterAccount')
    }, { required: [ 'token', 'user', 'account' ] }),

    OfficialRate: obj({
      country: str('Pais.'),
      currency: str('Moneda.'),
      code: str('Codigo ISO.'),
      tco_bs_usd: str('Tipo de cambio oficial Bs/USD.')
    }, { required: [ 'country', 'currency', 'code', 'tco_bs_usd' ] }),

    CurrencyRate: obj({
      country_region: str('Pais o region.'),
      currency: str('Moneda.'),
      code: str('Codigo ISO.'),
      bs_per_unit: str('Bolivianos por unidad.'),
      fx_rate: str('Tipo de cambio de referencia.')
    }, { required: [ 'country_region', 'currency', 'code', 'bs_per_unit', 'fx_rate' ] }),

    UfvRate: obj({
      country: str('Pais.'),
      description: str('Descripcion de la unidad.'),
      code: str('Codigo.'),
      value: str('Valor de la UFV.')
    }, { required: [ 'country', 'description', 'code', 'value' ] }),

    CurrencyRatesResponse: obj({
      status: enm([ 'ok', 'fallback' ], 'Origen de los datos: BCB en vivo o respaldo local.'),
      title: str('Titulo de la tabla de cotizaciones.'),
      source_url: str('URL de origen de los datos.'),
      official_rate: ref('OfficialRate'),
      currencies: arr(ref('CurrencyRate'), 'Cotizaciones por moneda.'),
      ufv: ref('UfvRate'),
      updated_at: dateTime('Momento de la consulta.'),
      message: str('Presente solo cuando se usan datos de respaldo.')
    }, { required: [ 'status', 'official_rate', 'currencies', 'ufv', 'updated_at' ] }),

    Account: obj({
      id: int('Identificador de la cuenta.'),
      user_id: int('Usuario propietario.'),
      account_number: str('Numero de cuenta.'),
      clabe: str('CLABE interbancaria.'),
      balance: dec('Saldo disponible.')
    }, { required: [ 'id', 'user_id', 'account_number', 'clabe', 'balance' ] }),

    AccountRecord: obj({
      id: int('Identificador de la cuenta.'),
      user_id: int('Usuario propietario.'),
      account_number: str('Numero de cuenta generado.'),
      balance: dec('Saldo de la cuenta.'),
      clabe: str('CLABE generada.'),
      default: bool('Indica si es la cuenta por defecto.'),
      account_type: enm([ 'user', 'service' ], 'Tipo de cuenta.'),
      created_at: dateTime('Fecha de creacion.'),
      updated_at: dateTime('Fecha de actualizacion.')
    }, {
      required: [ 'id', 'user_id', 'account_number', 'balance', 'clabe', 'default', 'account_type', 'created_at', 'updated_at' ],
      description: 'Registro completo de la cuenta (respuesta de creacion).'
    }),

    ActiveLoanSummary: obj({
      id: int('Identificador del prestamo.'),
      has_active_loan: bool('Siempre true en este objeto.'),
      total_loan_amount: dec('Monto original del prestamo.'),
      annual_interest_rate: dec('Tasa anual (%).'),
      term_months: int('Plazo en meses.'),
      monthly_payment: dec('Cuota mensual.'),
      first_due_date: date('Primera fecha de vencimiento.'),
      outstanding_principal: dec('Capital pendiente.'),
      paid_installments_count: int('Cuotas pagadas.'),
      pending_installments_count: int('Cuotas pendientes.')
    }, {
      required: [ 'id', 'has_active_loan', 'total_loan_amount', 'annual_interest_rate', 'term_months', 'monthly_payment', 'first_due_date', 'outstanding_principal', 'paid_installments_count', 'pending_installments_count' ],
      description: 'Resumen del prestamo activo de la cuenta.'
    }),

    NoActiveLoan: obj({
      has_active_loan: bool('Siempre false.')
    }, { required: [ 'has_active_loan' ] }),

    AccountDetail: obj({
      id: int('Identificador de la cuenta.'),
      user_id: int('Usuario propietario.'),
      account_number: str('Numero de cuenta.'),
      clabe: str('CLABE interbancaria.'),
      balance: dec('Saldo disponible.'),
      loan: {
        description: 'Prestamo activo o indicador de ausencia.',
        oneOf: [ ref('ActiveLoanSummary'), ref('NoActiveLoan') ]
      }
    }, { required: [ 'id', 'user_id', 'account_number', 'clabe', 'balance', 'loan' ] }),

    BalanceResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      balance: dec('Saldo actual.')
    }, { required: [ 'account_id', 'balance' ] }),

    AccountSummaryResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      balance: dec('Saldo actual.'),
      income: dec('Total de ingresos completados.'),
      expense: dec('Total de egresos completados.'),
      month: str('Mes consultado en formato YYYY-MM.')
    }, { required: [ 'account_id', 'balance', 'income', 'expense', 'month' ] }),

    AccountOperationRequest: obj({
      amount: dec('Monto mayor a cero.'),
      description: nullableStr('Descripcion opcional del movimiento.')
    }, { required: [ 'amount' ] }),

    AccountOperationResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      balance: dec('Saldo resultante.'),
      transaction_id: int('Identificador de la transaccion generada.'),
      transaction_type: enm(TRANSACTION_TYPES, 'Tipo de transaccion.'),
      amount: dec('Monto aplicado.')
    }, { required: [ 'account_id', 'balance', 'transaction_id', 'transaction_type', 'amount' ] }),

    AtmOperationRequest: obj({
      pin: str('PIN de 4 digitos del usuario.', { pattern: '^\\d{4}$' }),
      amount: dec('Monto mayor a cero.'),
      description: nullableStr('Descripcion opcional del movimiento.')
    }, { required: [ 'pin', 'amount' ] }),

    AtmOperationResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      balance: dec('Saldo resultante.'),
      transaction_id: int('Identificador de la transaccion generada.'),
      amount: dec('Monto aplicado.')
    }, { required: [ 'account_id', 'balance', 'transaction_id', 'amount' ] }),

    TransferRequest: obj({
      recipient_account_id: {
        description: 'Identificador o numero de cuenta destino. Tambien se acepta recipient_account_number.',
        oneOf: [ int('Identificador de la cuenta.'), str('Numero de cuenta.') ]
      },
      amount: dec('Monto a transferir.'),
      description: nullableStr('Descripcion opcional.')
    }, { required: [ 'recipient_account_id', 'amount' ] }),

    TransferResponse: obj({
      message: str('Mensaje de exito.'),
      amount: dec('Monto transferido.'),
      source_account: obj({ account_number: str('Cuenta de origen.') }),
      recipient_account: obj({ account_number: str('Cuenta de destino.') })
    }, { required: [ 'message', 'amount', 'source_account', 'recipient_account' ] }),

    ServicePaymentRequest: obj({
      service_id: int('Servicio a pagar.'),
      amount: dec('Monto del pago.'),
      description: nullableStr('Descripcion opcional.')
    }, { required: [ 'service_id', 'amount' ] }),

    Transaction: obj({
      id: int('Identificador de la transaccion.'),
      transaction_type: enm(TRANSACTION_TYPES, 'Tipo de movimiento.'),
      display_type: str('Tipo mostrado al cliente (incluye loan_disbursement).'),
      movement_kind: enm([ 'credit', 'debit' ], 'Naturaleza del movimiento.'),
      amount: dec('Monto del movimiento.'),
      description: str('Descripcion sin los metadatos del actor.'),
      original_description: str('Descripcion original almacenada.'),
      performed_by_role: nullableStr('Rol que ejecuto la operacion.'),
      performed_by_user_id: nullableInt('Usuario que ejecuto la operacion.'),
      performed_by_name: nullableStr('Nombre del ejecutor.'),
      performed_by_label: str('Etiqueta legible del ejecutor.'),
      status: enm([ 'pending', 'completed', 'failed' ], 'Estado de la transaccion.'),
      created_at: dateTime('Fecha de creacion.')
    }, {
      required: [ 'id', 'transaction_type', 'display_type', 'movement_kind', 'amount', 'description', 'original_description', 'performed_by_role', 'performed_by_user_id', 'performed_by_name', 'performed_by_label', 'status', 'created_at' ],
      required: [ 'id', 'transaction_type', 'amount', 'status', 'created_at' ]
    }),

    TransactionsPage: obj({
      account_id: int('Identificador de la cuenta.'),
      total: int('Total de movimientos que cumplen el filtro.'),
      page: int('Pagina actual.'),
      per_page: int('Elementos por pagina (maximo 50).'),
      total_pages: int('Total de paginas.'),
      has_prev: bool('Existe pagina anterior.'),
      has_next: bool('Existe pagina siguiente.'),
      transactions: arr(ref('Transaction'), 'Movimientos de la pagina.')
    }, { required: [ 'account_id', 'total', 'page', 'per_page', 'transactions' ] }),

    TransactionCreateRequest: obj({
      recipient_id: int('Destinatario registrado del usuario.'),
      amount: dec('Monto a transferir.'),
      description: nullableStr('Descripcion opcional.')
    }, { required: [ 'recipient_id', 'amount' ] }),

    CustomerLoan: obj(loanProperties, {
      required: [
        'id', 'amount', 'annual_interest_rate', 'term_months', 'monthly_payment', 'status',
        'disbursed_at', 'first_due_date', 'outstanding_principal', 'paid_installments_count',
        'pending_installments_count'
      ],
      description: 'Prestamo del cliente.'
    }),

    CustomerLoanWithSchedule: obj({
      ...loanProperties,
      installments: arr(ref('Installment'), 'Plan de pagos completo.')
    }, {
      required: [
        'id', 'amount', 'annual_interest_rate', 'term_months', 'monthly_payment', 'status',
        'disbursed_at', 'first_due_date', 'outstanding_principal', 'paid_installments_count',
        'pending_installments_count', 'installments'
      ],
      description: 'Prestamo con su plan de pagos.'
    }),

    Installment: obj({
      id: int('Identificador de la cuota.'),
      installment_number: int('Numero de cuota.'),
      due_date: date('Fecha de vencimiento.'),
      amount: dec('Monto de la cuota.'),
      principal_amount: dec('Capital de la cuota.'),
      interest_amount: dec('Interes de la cuota.'),
      remaining_principal: dec('Capital pendiente.'),
      remaining_interest: dec('Interes pendiente.'),
      principal_paid: dec('Capital pagado.'),
      interest_paid: dec('Interes pagado.'),
      paid_amount: dec('Monto total pagado.'),
      paid_at: nullableDateTime('Fecha de pago.'),
      status: enm([ 'pending', 'partial', 'paid' ], 'Estado de la cuota.')
    }, {
      required: [ 'id', 'installment_number', 'due_date', 'amount', 'principal_amount', 'interest_amount', 'remaining_principal', 'remaining_interest', 'principal_paid', 'interest_paid', 'paid_amount', 'paid_at', 'status' ],
      required: [ 'id', 'installment_number', 'due_date', 'amount', 'status' ]
    }),

    Pagination: obj({
      page: int('Pagina actual.'),
      per_page: int('Elementos por pagina (maximo 50).'),
      total: int('Total de elementos.'),
      total_pages: int('Total de paginas.'),
      has_prev: bool('Existe pagina anterior.'),
      has_next: bool('Existe pagina siguiente.')
    }, { required: [ 'page', 'per_page', 'total', 'total_pages', 'has_prev', 'has_next' ] }),

    CustomerLoansResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      loans: arr(ref('CustomerLoan'), 'Prestamos de la cuenta.')
    }, { required: [ 'account_id', 'loans' ] }),

    CustomerLoanResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      loan: ref('CustomerLoanWithSchedule')
    }, { required: [ 'account_id', 'loan' ] }),

    CustomerLoanCreatedResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      loan: ref('CustomerLoanWithSchedule')
    }, { required: [ 'account_id', 'loan' ] }),

    LoanCreateRequest: obj({
      amount: dec('Monto solicitado.'),
      term_months: int('Plazo en meses.'),
      first_due_date: date('Primera cuota (YYYY-MM-DD).')
    }, { required: [ 'amount', 'term_months', 'first_due_date' ] }),

    LoanPaymentRequest: obj({
      amount: dec('Monto a pagar; no puede exceder el saldo pendiente.'),
      paid_on: nullableDate('Fecha de pago (por defecto hoy).')
    }, { required: [ 'amount' ] }),

    InstallmentPayment: obj({
      transaction_id: int('Transaccion generada por el pago.'),
      principal_paid: dec('Capital pagado en esta operacion.'),
      interest_paid: dec('Interes pagado en esta operacion.'),
      remaining_payment: dec('Monto no aplicado.')
    }, { required: [ 'principal_paid', 'interest_paid', 'remaining_payment' ] }),

    LoanPaymentResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      account_balance: dec('Saldo de la cuenta tras el pago.'),
      loan_id: int('Identificador del prestamo.'),
      payment: ref('InstallmentPayment'),
      loan: ref('CustomerLoan')
    }, { required: [ 'account_id', 'loan_id', 'payment', 'loan' ] }),

    LoanInstallmentsResponse: obj({
      loan_id: int('Identificador del prestamo.'),
      paid_installments: arr(ref('Installment'), 'Cuotas pagadas.'),
      pending_installments: arr(ref('Installment'), 'Cuotas pendientes de la pagina.'),
      pending_pagination: ref('Pagination')
    }, { required: [ 'loan_id', 'paid_installments', 'pending_installments', 'pending_pagination' ] }),

    Recipient: obj({
      id: int('Identificador del destinatario.'),
      user_id: int('Usuario propietario.'),
      name: str('Alias del destinatario.'),
      account_id: int('Cuenta destino.'),
      clabe: str('CLABE usada al crear el destinatario (solo entrada).'),
      created_at: dateTime('Fecha de creacion.'),
      updated_at: dateTime('Fecha de actualizacion.')
    }, {
      required: [ 'id', 'user_id', 'name', 'account_id', 'created_at', 'updated_at' ],
      required: [ 'id', 'name', 'account_id' ]
    }),

    RecipientCreateRequest: obj({
      recipient: obj({
        name: str('Alias del destinatario.'),
        clabe: str('CLABE de 18 digitos.')
      }, { required: [ 'name', 'clabe' ] })
    }, { required: [ 'recipient' ] }),

    Contact: obj({
      id: int('Identificador del contacto.'),
      user_id: int('Usuario propietario.'),
      name: str('Nombre (maximo 100 caracteres).'),
      phone: str('Telefono de 4 a 15 digitos.'),
      created_at: dateTime('Fecha de creacion.'),
      updated_at: dateTime('Fecha de actualizacion.')
    }, {
      required: [ 'id', 'user_id', 'name', 'phone', 'created_at', 'updated_at' ],
      required: [ 'id', 'name', 'phone' ]
    }),

    ContactCreateRequest: obj({
      contact: obj({
        name: str('Nombre del contacto.'),
        phone: str('Telefono del contacto.')
      }, { required: [ 'name', 'phone' ] })
    }, { required: [ 'contact' ] }),

    ContactListResponse: obj({
      contacts: arr(ref('Contact'), 'Contactos ordenados por nombre.')
    }, { required: [ 'contacts' ] }),

    ContactCreatedResponse: obj({
      contact: ref('Contact')
    }, { required: [ 'contact' ] }),

    Service: obj({
      id: int('Identificador del servicio.'),
      name: str('Nombre del servicio.'),
      description: nullableStr('Descripcion del servicio.')
    }, {
      required: [ 'id', 'name', 'description' ],
      required: [ 'id', 'name' ]
    }),

    AtmBalanceResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      balance: dec('Saldo actual.'),
      checked_at: dateTime('Momento de la consulta.')
    }, { required: [ 'account_id', 'balance', 'checked_at' ] }),

    AtmTransaction: obj({
      id: int('Identificador del movimiento.'),
      type: enm(TRANSACTION_TYPES, 'Tipo de movimiento.'),
      status: enm([ 'pending', 'completed', 'failed' ], 'Estado del movimiento.'),
      amount: dec('Monto.'),
      description: str('Descripcion.'),
      created_at: dateTime('Fecha del movimiento.')
    }, { required: [ 'id', 'type', 'status', 'amount', 'description', 'created_at' ] }),

    AtmStatementResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      balance: dec('Saldo actual.'),
      transactions: arr(ref('AtmTransaction'), 'Ultimos 10 movimientos.')
    }, {
      required: [ 'id', 'type', 'status', 'amount', 'description', 'created_at' ],
      required: [ 'account_id', 'balance', 'transactions' ]
    }),

    UserUpdateRequest: obj({
      first_name: str('Nombres.'),
      last_name: str('Apellidos.'),
      email: str('Correo electronico.', { format: 'email' }),
      phone: str('Telefono.'),
      date_of_birth: date('Fecha de nacimiento (YYYY-MM-DD).'),
      pin: str('Nuevo PIN de 4 digitos.', { pattern: '^\\d{4}$' })
    }, { description: 'Todos los campos son opcionales; se actualizan solo los enviados.' }),

    UserUpdateResponse: obj({
      user: ref('UserSummary')
    }, { required: [ 'user' ] }),

    PinChangeRequest: obj({
      current_pin: str('PIN actual.', { pattern: '^\\d{4}$' }),
      new_pin: str('PIN nuevo de 4 digitos.', { pattern: '^\\d{4}$' })
    }, { required: [ 'current_pin', 'new_pin' ] }),

    UserFile: obj({
      id: int('Identificador del archivo.'),
      user_id: int('Usuario propietario.'),
      uploaded_by_user_id: nullableInt('Usuario que subio el archivo.'),
      original_filename: str('Nombre original del archivo.'),
      content_type: str('Tipo MIME permitido (texto, CSV, JSON o imagen).'),
      file_size: int('Tamano en bytes (maximo 5 MB).'),
      created_at: dateTime('Fecha de carga.')
    }, {
      required: [ 'id', 'user_id', 'uploaded_by_user_id', 'original_filename', 'content_type', 'file_size', 'created_at' ],
      required: [ 'id', 'user_id', 'original_filename', 'content_type', 'file_size' ]
    }),

    UserFilesResponse: obj({
      user_id: int('Usuario propietario.'),
      files: arr(ref('UserFile'), 'Archivos del usuario, mas recientes primero.')
    }, { required: [ 'user_id', 'files' ] }),

    FileUploadRequest: obj({
      file: { type: 'string', format: 'binary', description: 'Archivo a subir (texto, CSV, JSON o imagen; maximo 5 MB).' }
    }, { required: [ 'file' ] }),

    UserFileCreatedResponse: obj({
      message: str('Mensaje de exito.'),
      file: ref('UserFile')
    }, { required: [ 'message', 'file' ] }),

    UserFileDeletedResponse: obj({
      message: str('Mensaje de exito.'),
      file_id: int('Identificador del archivo eliminado.')
    }, { required: [ 'message', 'file_id' ] }),

    AddressUpsertResponse: obj({
      message: str('Mensaje de exito.'),
      address: ref('Address')
    }, { required: [ 'message', 'address' ] }),

    OverviewReport: obj({
      generated_at: dateTime('Momento de generacion del reporte.'),
      users: obj({
        total: int('Usuarios totales.'),
        customers: int('Usuarios con rol customer.'),
        managers: int('Usuarios con rol manager.')
      }),
      accounts: obj({
        total: int('Cuentas totales.'),
        total_balance: dec('Saldo agregado de todas las cuentas.'),
        average_balance: dec('Saldo promedio por cuenta.')
      }),
      transactions: obj({
        total: int('Transacciones totales.'),
        today: int('Transacciones de hoy.'),
        deposits: int('Depositos.'),
        withdrawals: int('Retiros.'),
        atm_operations: int('Operaciones ATM.'),
        service_payments: int('Pagos de servicio.'),
        loan_payments: int('Pagos de prestamo.')
      }),
      loans: obj({
        total: int('Prestamos totales.'),
        active: int('Prestamos activos.'),
        completed: int('Prestamos completados.'),
        cancelled: int('Prestamos cancelados.'),
        total_disbursed: dec('Monto total desembolsado.'),
        total_outstanding_principal: dec('Capital pendiente total.'),
        overdue_installments: int('Cuotas vencidas sin pagar.')
      })
    }, { required: [ 'generated_at', 'users', 'accounts', 'transactions', 'loans' ] }),

    LoanReportItem: obj({
      id: int('Identificador del prestamo.'),
      status: enm([ 'active', 'completed', 'cancelled' ], 'Estado del prestamo.'),
      amount: dec('Monto original.'),
      outstanding_principal: dec('Capital pendiente.'),
      annual_interest_rate: dec('Tasa anual (%).'),
      term_months: int('Plazo en meses.'),
      account_id: int('Identificador de la cuenta.'),
      account_number: str('Numero de cuenta.'),
      user_id: int('Identificador del usuario.'),
      customer_name: str('Nombre del cliente.'),
      created_at: dateTime('Fecha de creacion.')
    }, {
      required: [
        'id', 'status', 'amount', 'outstanding_principal', 'annual_interest_rate', 'term_months',
        'account_id', 'account_number', 'user_id', 'customer_name', 'created_at'
      ]
    }),

    LoansReport: obj({
      generated_at: dateTime('Momento de generacion del reporte.'),
      total: int('Prestamos que cumplen el filtro.'),
      loans: arr(ref('LoanReportItem'), 'Hasta 200 prestamos.')
    }, {
      required: [ 'id', 'status', 'amount', 'outstanding_principal', 'annual_interest_rate', 'term_months', 'account_id', 'account_number', 'user_id', 'customer_name', 'created_at' ],
      required: [ 'generated_at', 'total', 'loans' ]
    }),

    AccountActivityItem: obj({
      account_id: int('Identificador de la cuenta.'),
      account_number: str('Numero de cuenta.'),
      balance: dec('Saldo actual.'),
      transactions_count: int('Transacciones en la ventana.'),
      transactions_amount: dec('Monto agregado de esas transacciones.')
    }, { required: [ 'account_id', 'account_number', 'balance', 'transactions_count', 'transactions_amount' ] }),

    AccountsActivityReport: obj({
      generated_at: dateTime('Momento de generacion del reporte.'),
      window_days: int('Ventana analizada en dias.'),
      accounts: arr(ref('AccountActivityItem'), 'Hasta 100 cuentas con mas actividad.')
    }, {
      required: [ 'account_id', 'account_number', 'balance', 'transactions_count', 'transactions_amount' ],
      required: [ 'generated_at', 'window_days', 'accounts' ]
    }),

    LoginEvent: obj({
      id: int('Identificador del evento.'),
      created_at: dateTime('Fecha del intento de acceso.'),
      status: enm([ 'success', 'failure', 'blocked' ], 'Resultado del acceso.'),
      user_id: nullableInt('Usuario identificado (null si no existe).'),
      user_name: str('Nombre del usuario.'),
      account_number: str('Numero de cuenta usado en el intento.')
    }, { required: [ 'id', 'created_at', 'status', 'user_id', 'user_name', 'account_number' ] }),

    DateRange: obj({
      from: dateTime('Inicio del rango consultado.'),
      to: dateTime('Fin del rango consultado.')
    }, { required: [ 'from', 'to' ] }),

    LoginEventsPage: obj({
      period: enm([ 'day', 'week', 'month' ], 'Periodo aplicado.'),
      date: date('Fecha de referencia.'),
      range: ref('DateRange'),
      status: str('Filtro de estado aplicado o "all".'),
      page: int('Pagina actual.'),
      per_page: int('Elementos por pagina (maximo 50).'),
      total: int('Eventos que cumplen el filtro.'),
      total_pages: int('Total de paginas.'),
      has_prev: bool('Existe pagina anterior.'),
      has_next: bool('Existe pagina siguiente.'),
      totals_by_status: obj({
        success: int('Accesos exitosos.'),
        failure: int('Accesos fallidos.'),
        blocked: int('Accesos de usuarios bloqueados.')
      }),
      logins: arr(ref('LoginEvent'), 'Eventos de la pagina.')
    }, { required: [ 'period', 'date', 'range', 'page', 'per_page', 'total', 'logins' ] }),

    Operation: obj({
      id: int('Identificador de la transaccion.'),
      created_at: dateTime('Fecha de la operacion.'),
      transaction_type: enm(TRANSACTION_TYPES, 'Tipo de operacion.'),
      amount: dec('Monto operado.'),
      description: str('Descripcion sin metadatos del actor.'),
      status: enm([ 'pending', 'completed', 'failed' ], 'Estado de la transaccion.'),
      account_id: int('Identificador de la cuenta.'),
      account_number: str('Numero de cuenta.'),
      user_id: int('Usuario propietario de la cuenta.'),
      user_name: str('Nombre del propietario.'),
      performed_by_role: nullableStr('Rol que ejecuto la operacion.'),
      performed_by_user_id: nullableInt('Usuario que ejecuto la operacion.'),
      performed_by_name: nullableStr('Nombre del ejecutor.'),
      performed_by_label: str('Etiqueta legible del ejecutor.')
    }, {
      required: [
        'id', 'created_at', 'transaction_type', 'amount', 'description', 'status', 'account_id',
        'account_number', 'user_id', 'user_name', 'performed_by_role', 'performed_by_user_id',
        'performed_by_name', 'performed_by_label'
      ]
    }),

    OperationsPage: obj({
      period: enm([ 'day', 'week', 'month' ], 'Periodo aplicado.'),
      date: date('Fecha de referencia.'),
      range: ref('DateRange'),
      page: int('Pagina actual.'),
      per_page: int('Elementos por pagina (maximo 50).'),
      total: int('Operaciones que cumplen el filtro.'),
      total_pages: int('Total de paginas.'),
      has_prev: bool('Existe pagina anterior.'),
      has_next: bool('Existe pagina siguiente.'),
      total_amount: dec('Suma de montos del periodo.'),
      operations: arr(ref('Operation'), 'Operaciones de la pagina.')
    }, {
      required: [ 'id', 'created_at', 'transaction_type', 'amount', 'description', 'status', 'account_id', 'account_number', 'user_id', 'user_name', 'performed_by_role', 'performed_by_user_id', 'performed_by_name', 'performed_by_label' ],
      required: [ 'period', 'date', 'range', 'page', 'per_page', 'total', 'total_amount', 'operations' ]
    }),

    ManagedLoan: obj({
      id: int('Identificador del prestamo.'),
      amount: dec('Monto original.'),
      annual_interest_rate: dec('Tasa anual (%).'),
      term_months: int('Plazo en meses.'),
      monthly_payment: dec('Cuota mensual.'),
      outstanding_principal: dec('Capital pendiente.'),
      status: enm([ 'active', 'completed', 'cancelled' ], 'Estado del prestamo.'),
      first_due_date: date('Primera fecha de vencimiento.')
    }, { required: [ 'id', 'amount', 'annual_interest_rate', 'term_months', 'monthly_payment', 'outstanding_principal', 'status', 'first_due_date' ] }),

    ManagerAccountSummary: obj({
      account_id: int('Identificador de la cuenta.'),
      account_number: str('Numero de cuenta.'),
      user_id: int('Usuario propietario.'),
      user_name: nullableStr('Nombre del propietario.'),
      balance: dec('Saldo actual.'),
      active_loan_id: nullableInt('Prestamo activo, si existe.'),
      loans: arr(ref('ManagedLoan'), 'Prestamos de la cuenta.')
    }, {
      required: [ 'id', 'amount', 'annual_interest_rate', 'term_months', 'monthly_payment', 'outstanding_principal', 'status', 'first_due_date' ],
      required: [ 'account_id', 'account_number', 'balance', 'loans' ]
    }),

    ManagerOperationResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      user_id: int('Usuario propietario.'),
      balance: dec('Saldo resultante.'),
      transaction_id: int('Transaccion generada.'),
      transaction_type: enm(TRANSACTION_TYPES, 'Tipo de transaccion.'),
      amount: dec('Monto aplicado.')
    }, { required: [ 'account_id', 'balance', 'transaction_id', 'amount' ] }),

    ManagerLoanPaymentResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      user_id: int('Usuario propietario.'),
      account_balance: dec('Saldo de la cuenta tras el pago.'),
      loan_id: int('Identificador del prestamo.'),
      payment: ref('InstallmentPayment'),
      loan_status: enm([ 'active', 'completed', 'cancelled' ], 'Estado del prestamo tras el pago.'),
      outstanding_principal: dec('Capital pendiente tras el pago.')
    }, { required: [ 'account_id', 'loan_id', 'payment', 'loan_status' ] }),

    ManagerAccount: obj({
      id: int('Identificador de la cuenta.'),
      account_number: str('Numero de cuenta.'),
      clabe: str('CLABE interbancaria.'),
      account_type: enm([ 'user', 'service' ], 'Tipo de cuenta.'),
      balance: dec('Saldo actual.'),
      default: bool('Cuenta por defecto del usuario.')
    }, { required: [ 'id', 'account_number', 'clabe', 'account_type', 'balance', 'default' ] }),

    ManagerUserAddressShort: obj({
      country: str('Pais.'),
      city: str('Ciudad.'),
      province: str('Provincia o departamento.'),
      street: str('Calle.'),
      postal_code: nullableStr('Codigo postal.')
    }, { required: [ 'country', 'city', 'province', 'street', 'postal_code' ] }),

    ManagerUserAddressFull: obj({
      country: str('Pais.'),
      city: str('Ciudad.'),
      province: str('Provincia o departamento.'),
      street: str('Calle.'),
      street_number: nullableStr('Numero de calle.'),
      district: nullableStr('Distrito o zona.'),
      postal_code: nullableStr('Codigo postal.'),
      reference: nullableStr('Referencia adicional.')
    }, { required: [ 'country', 'city', 'province', 'street', 'street_number', 'district', 'postal_code', 'reference' ] }),

    ManagerUser: obj({
      id: int('Identificador del usuario.'),
      first_name: str('Nombres.'),
      last_name: str('Apellidos.'),
      email: str('Correo electronico.', { format: 'email' }),
      phone: nullableStr('Telefono.'),
      date_of_birth: nullableDate('Fecha de nacimiento.'),
      role: enm([ 'customer', 'manager', 'cashier', 'admin', 'super_admin' ], 'Rol del usuario.'),
      active: bool('Usuario activo.'),
      blocked: bool('Usuario bloqueado.'),
      status: enm([ 'active', 'blocked', 'deactivated' ], 'Estado legible del usuario.'),
      account_number: nullableStr('Numero de la cuenta principal.'),
      address: ref('ManagerUserAddressShort', 'Direccion resumida (null si no tiene).'),
      created_at: dateTime('Fecha de creacion.')
    }, { required: [ 'id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'role', 'active', 'blocked', 'status', 'account_number', 'address', 'created_at' ] }),

    ManagerUserDetail: obj({
      id: int('Identificador del usuario.'),
      first_name: str('Nombres.'),
      last_name: str('Apellidos.'),
      email: str('Correo electronico.', { format: 'email' }),
      phone: nullableStr('Telefono.'),
      date_of_birth: nullableDate('Fecha de nacimiento.'),
      role: enm([ 'customer', 'manager', 'cashier', 'admin', 'super_admin' ], 'Rol del usuario.'),
      active: bool('Usuario activo.'),
      blocked: bool('Usuario bloqueado.'),
      deleted: bool('Siempre false: los usuarios se eliminan fisicamente.'),
      status: enm([ 'active', 'blocked', 'deactivated' ], 'Estado legible del usuario.'),
      account_number: nullableStr('Numero de la cuenta principal.'),
      accounts: arr(ref('ManagerAccount'), 'Cuentas del usuario.'),
      address: ref('ManagerUserAddressFull', 'Direccion completa (null si no tiene).'),
      created_at: dateTime('Fecha de creacion.'),
      updated_at: dateTime('Fecha de actualizacion.')
    }, { required: [ 'id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'role', 'active', 'blocked', 'deleted', 'status', 'account_number', 'accounts', 'address', 'created_at', 'updated_at' ] }),

    UsersPage: obj({
      total: int('Usuarios totales.'),
      page: int('Pagina actual.'),
      per_page: int('Elementos por pagina (maximo 50).'),
      total_pages: int('Total de paginas.'),
      has_prev: bool('Existe pagina anterior.'),
      has_next: bool('Existe pagina siguiente.'),
      users: arr(ref('ManagerUser'), 'Usuarios de la pagina.')
    }, { required: [ 'total', 'page', 'per_page', 'users' ] }),

    ManagerUserDetailResponse: obj({
      user: ref('ManagerUserDetail')
    }, { required: [ 'user' ] }),

    ManagerUserResponse: obj({
      message: str('Mensaje de exito.'),
      user: ref('ManagerUser')
    }, { required: [ 'message', 'user' ] }),

    ManagerUserDeleteResponse: obj({
      message: str('Mensaje de exito.'),
      user_id: int('Identificador del usuario eliminado.')
    }, { required: [ 'message', 'user_id' ] }),

    ManagerUserCreateRequest: obj({
      first_name: str('Nombres (obligatorio).'),
      last_name: str('Apellidos (obligatorio).'),
      email: str('Correo unico (obligatorio).', { format: 'email' }),
      pin: str('PIN de 4 digitos (obligatorio).', { pattern: '^\\d{4}$' }),
      role: enm([ 'customer', 'manager', 'cashier', 'admin', 'super_admin' ], 'Rol; por defecto customer.'),
      phone: str('Telefono.'),
      date_of_birth: date('Fecha de nacimiento.'),
      account_number: str('Numero de cuenta inicial (opcional).')
    }, { required: [ 'first_name', 'last_name', 'email', 'pin' ] }),

    ManagerUserUpdateRequest: obj({
      first_name: str('Nombres.'),
      last_name: str('Apellidos.'),
      email: str('Correo unico.', { format: 'email' }),
      phone: str('Telefono.'),
      date_of_birth: date('Fecha de nacimiento.'),
      pin: str('Nuevo PIN de 4 digitos.', { pattern: '^\\d{4}$' })
    }, { description: 'Todos los campos son opcionales.' }),

    LoanCancelResponse: obj({
      message: str('Mensaje de exito.'),
      loan_id: int('Identificador del prestamo.'),
      status: enm([ 'active', 'completed', 'cancelled' ], 'Nuevo estado del prestamo.')
    }, { required: [ 'loan_id', 'status' ] }),

    ProjectedInstallment: obj({
      installment_number: int('Numero de cuota proyectada.'),
      due_date: date('Fecha de vencimiento.'),
      amount: dec('Monto de la cuota.'),
      principal_amount: dec('Capital de la cuota.'),
      interest_amount: dec('Interes de la cuota.'),
      projected_remaining_principal: dec('Capital pendiente proyectado.')
    }, {
      required: [ 'installment_number', 'due_date', 'amount', 'principal_amount', 'interest_amount', 'projected_remaining_principal' ],
      required: [ 'installment_number', 'due_date', 'amount' ]
    }),

    LoanPreviewResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      annual_interest_rate: dec('Tasa anual aplicada (%).'),
      term_months: int('Plazo en meses.'),
      monthly_payment: dec('Cuota mensual calculada.'),
      total_principal: dec('Capital total.'),
      total_interest: dec('Interes total.'),
      total_payable: dec('Total a pagar.'),
      first_due_date: date('Primera fecha de vencimiento.'),
      projected_schedule: arr(ref('ProjectedInstallment'), 'Plan de pagos proyectado.')
    }, { required: [ 'account_id', 'monthly_payment', 'projected_schedule' ] }),

    ManagerInstallment: obj({
      id: int('Identificador de la cuota.'),
      installment_number: int('Numero de cuota.'),
      due_date: date('Fecha de vencimiento.'),
      amount: dec('Monto de la cuota.'),
      principal_amount: dec('Capital de la cuota.'),
      interest_amount: dec('Interes de la cuota.'),
      status: enm([ 'pending', 'partial', 'paid' ], 'Estado de la cuota.'),
      paid_at: nullableDateTime('Fecha de pago.')
    }, { required: [ 'id', 'installment_number', 'due_date', 'amount', 'principal_amount', 'interest_amount', 'status', 'paid_at' ] }),

    ManagerLoanWithSchedule: obj({
      id: int('Identificador del prestamo.'),
      amount: dec('Monto original.'),
      annual_interest_rate: dec('Tasa anual (%).'),
      term_months: int('Plazo en meses.'),
      monthly_payment: dec('Cuota mensual.'),
      first_due_date: date('Primera fecha de vencimiento.'),
      outstanding_principal: dec('Capital pendiente.'),
      installments: arr(ref('ManagerInstallment'), 'Plan de pagos generado.')
    }, { required: [ 'id', 'amount', 'annual_interest_rate', 'term_months', 'monthly_payment', 'first_due_date', 'outstanding_principal', 'installments' ] }),

    ManagerLoanCreatedResponse: obj({
      message: str('Mensaje de exito.'),
      account_id: int('Identificador de la cuenta.'),
      loan: ref('ManagerLoanWithSchedule')
    }, {
      required: [ 'id', 'installment_number', 'due_date', 'amount', 'principal_amount', 'interest_amount', 'status', 'paid_at' ],
      required: [ 'account_id', 'loan' ]
    }),

    ManagerInstallmentsPage: obj({
      account_id: int('Identificador de la cuenta.'),
      loan_id: int('Identificador del prestamo.'),
      page: int('Pagina actual.'),
      per_page: int('Elementos por pagina (maximo 50).'),
      total: int('Total de cuotas.'),
      total_pages: int('Total de paginas.'),
      has_prev: bool('Existe pagina anterior.'),
      has_next: bool('Existe pagina siguiente.'),
      installments: arr(ref('ManagerInstallment'), 'Cuotas de la pagina.')
    }, { required: [ 'account_id', 'loan_id', 'page', 'per_page', 'total', 'installments' ] }),

    InstallmentsSummaryResponse: obj({
      account_id: int('Identificador de la cuenta.'),
      loan_id: int('Identificador del prestamo.'),
      paid_count: int('Cuotas pagadas.'),
      pending_count: int('Cuotas pendientes.'),
      total: int('Total de cuotas.')
    }, { required: [ 'account_id', 'loan_id', 'paid_count', 'pending_count', 'total' ] })
  };

  const ERR = (description) => ({ description, schema: ref('ErrorResponse') });

  const common = {
    unauthorized: ERR('Token no proporcionado, invalido o expirado.'),
    forbidden: ERR('El rol del usuario no permite la operacion.'),
    notFound: ERR('Recurso no encontrado.'),
    validation: ERR('Datos invalidos o regla de negocio incumplida.'),
    insufficientFunds: ERR('Saldo insuficiente para la operacion.'),
    invalidPin: ERR('PIN invalido.')
  };

  const csv = (description) => ({
    description,
    contentType: 'text/csv',
    schema: { type: 'string', description: 'Contenido CSV generado por el servidor.' }
  });

  const paginationQuery = [
    { name: 'page', in: 'query', required: false, description: 'Pagina solicitada (1 por defecto).', schema: { type: 'integer', minimum: 1 } },
    { name: 'per_page', in: 'query', required: false, description: 'Elementos por pagina (maximo 50).', schema: { type: 'integer', minimum: 1, maximum: 50 } }
  ];

  const endpointSchemas = {
    'GET /up': {
      responses: {
        '200': {
          description: 'La aplicacion responde correctamente (health check de Rails).',
          contentType: 'text/html',
          schema: { type: 'string', description: 'HTML de estado de Rails.' }
        }
      }
    },

    'GET /': {
      summary: 'Estado base del servicio.',
      responses: {
        '200': { description: 'Servicio activo.', schema: ref('ServiceStatus') }
      }
    },

    'POST /api/v1/register': {
      note: 'Crea el usuario, su cuenta por defecto (saldo inicial 1000) y la direccion si se envia. Devuelve un JWT.',
      request: { schema: ref('RegisterRequest') },
      responses: {
        '201': { description: 'Usuario registrado.', schema: ref('RegisterResponse') },
        '422': ERR('Datos invalidos o correo/telefono duplicado.')
      }
    },

    'POST /api/v1/login': {
      request: { schema: ref('LoginRequest') },
      responses: {
        '200': { description: 'Sesion iniciada.', schema: ref('LoginResponse') },
        '401': ERR('Numero de cuenta o PIN incorrecto.'),
        '403': ERR('Usuario bloqueado o desactivado.')
      }
    },

    'POST /api/v1/logout': {
      responses: {
        '200': { description: 'Sesion cerrada.', schema: ref('MessageResponse') },
        '401': common.unauthorized
      }
    },

    'GET /api/v1/currency_rates': {
      responses: {
        '200': { description: 'Cotizaciones oficiales (BCB) o respaldo local.', schema: ref('CurrencyRatesResponse') }
      }
    },

    'GET /api/v1/accounts': {
      responses: {
        '200': { description: 'Cuentas del usuario autenticado.', schema: arr(ref('Account')) },
        '401': common.unauthorized
      }
    },

    'POST /api/v1/accounts': {
      note: 'No requiere body: la cuenta se crea para el usuario autenticado.',
      responses: {
        '201': { description: 'Cuenta creada.', schema: ref('AccountRecord') },
        '401': common.unauthorized,
        '422': common.validation
      }
    },

    'GET /api/v1/accounts/:id': {
      responses: {
        '200': { description: 'Detalle de la cuenta y su prestamo activo.', schema: ref('AccountDetail') },
        '401': common.unauthorized,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'GET /api/v1/accounts/:id/balance': {
      responses: {
        '200': { description: 'Saldo de la cuenta.', schema: ref('BalanceResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'GET /api/v1/accounts/:id/summary': {
      responses: {
        '200': { description: 'Resumen de ingresos y egresos del mes.', schema: ref('AccountSummaryResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'POST /api/v1/accounts/:id/deposit': {
      note: 'Solo personal (admin, manager o cajero); un customer recibe 403.',
      request: { schema: ref('AccountOperationRequest') },
      responses: {
        '200': { description: 'Deposito aplicado.', schema: ref('AccountOperationResponse') },
        '401': common.unauthorized,
        '403': ERR('Los clientes no pueden depositar por este canal.'),
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/accounts/:id/withdraw': {
      request: { schema: ref('AccountOperationRequest') },
      responses: {
        '200': { description: 'Retiro aplicado.', schema: ref('AccountOperationResponse') },
        '401': common.unauthorized,
        '402': common.insufficientFunds,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/accounts/:id/transfer': {
      request: { schema: ref('TransferRequest') },
      responses: {
        '200': { description: 'Transferencia realizada.', schema: ref('TransferResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta de origen o destino no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/accounts/:id/pay_service': {
      request: { schema: ref('ServicePaymentRequest') },
      responses: {
        '200': { description: 'Pago de servicio aplicado.', schema: ref('TransferResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta o servicio no encontrado.'),
        '422': common.validation
      }
    },

    'GET /api/v1/accounts/:account_id/transactions': {
      parameters: [
        {
          name: 'transaction_filter',
          in: 'query',
          required: false,
          description: 'Filtro por tipo o grupo de movimiento.',
          schema: { type: 'string', enum: [ 'all', 'credit', 'debit', 'loan_disbursement', ...TRANSACTION_TYPES ] }
        },
        {
          name: 'performed_by_filter',
          in: 'query',
          required: false,
          description: 'Filtro por rol que ejecuto la operacion.',
          schema: { type: 'string', enum: [ 'all', 'manager', 'admin', 'cashier', 'user' ] }
        },
        ...paginationQuery
      ],
      responses: {
        '200': { description: 'Movimientos paginados de la cuenta.', schema: ref('TransactionsPage') },
        '401': common.unauthorized,
        '404': { description: 'Cuenta no encontrada.', schema: ref('TransactionErrorResponse') }
      }
    },

    'POST /api/v1/accounts/:account_id/transactions': {
      request: { schema: ref('TransactionCreateRequest') },
      responses: {
        '200': { description: 'Transferencia realizada.', schema: ref('TransferResponse') },
        '401': common.unauthorized,
        '402': { description: 'Fondos insuficientes.', schema: ref('TransactionErrorResponse') },
        '404': { description: 'Cuenta no encontrada.', schema: ref('TransactionErrorResponse') },
        '422': { description: 'Destinatario o monto invalido.', schema: ref('TransactionErrorResponse') },
        '500': { description: 'Error inesperado.', schema: ref('TransactionErrorResponse') }
      }
    },

    'GET /api/v1/accounts/:account_id/loans': {
      responses: {
        '200': { description: 'Prestamos de la cuenta.', schema: ref('CustomerLoansResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'POST /api/v1/accounts/:account_id/loans': {
      note: 'Solo Admin o Manager pueden originar prestamos.',
      request: { schema: ref('LoanCreateRequest') },
      responses: {
        '201': { description: 'Prestamo registrado.', schema: ref('CustomerLoanCreatedResponse') },
        '401': common.unauthorized,
        '403': ERR('Solo Admin o Manager pueden originar prestamos.'),
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'GET /api/v1/accounts/:account_id/loans/:id': {
      responses: {
        '200': { description: 'Detalle del prestamo con su plan de pagos.', schema: ref('CustomerLoanResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta o prestamo no encontrado.')
      }
    },

    'POST /api/v1/accounts/:account_id/loans/:id/pay': {
      request: { schema: ref('LoanPaymentRequest') },
      responses: {
        '200': { description: 'Pago aplicado.', schema: ref('LoanPaymentResponse') },
        '401': common.unauthorized,
        '402': common.insufficientFunds,
        '404': ERR('Cuenta o prestamo no encontrado.'),
        '422': common.validation
      }
    },

    'GET /api/v1/accounts/:account_id/loans/:id/installments': {
      parameters: paginationQuery,
      responses: {
        '200': { description: 'Cuotas pagadas y pendientes.', schema: ref('LoanInstallmentsResponse') },
        '401': common.unauthorized,
        '404': ERR('Cuenta o prestamo no encontrado.')
      }
    },

    'GET /api/v1/recipients': {
      responses: {
        '200': { description: 'Destinatarios del usuario.', schema: arr(ref('Recipient')) },
        '401': common.unauthorized
      }
    },

    'POST /api/v1/recipients': {
      request: { schema: ref('RecipientCreateRequest') },
      responses: {
        '201': { description: 'Destinatario creado.', schema: ref('Recipient') },
        '401': common.unauthorized,
        '422': ERR('CLABE invalida o destinatario duplicado.')
      }
    },

    'DELETE /api/v1/recipients/:id': {
      responses: {
        '200': { description: 'Destinatario eliminado.', schema: ref('MessageResponse') },
        '401': common.unauthorized,
        '404': ERR('Destinatario no encontrado.')
      }
    },

    'GET /api/v1/recipients/search': {
      parameters: [
        { name: 'clabe', in: 'query', required: true, description: 'CLABE del destinatario a buscar.', schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'Destinatario encontrado.', schema: ref('Recipient') },
        '400': ERR('CLABE requerida.'),
        '401': common.unauthorized,
        '404': ERR('Destinatario no encontrado.')
      }
    },

    'GET /api/v1/contacts': {
      responses: {
        '200': { description: 'Contactos del usuario.', schema: ref('ContactListResponse') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'POST /api/v1/contacts': {
      request: { schema: ref('ContactCreateRequest') },
      responses: {
        '201': { description: 'Contacto creado.', schema: ref('ContactCreatedResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '422': common.validation
      }
    },

    'DELETE /api/v1/contacts/:id': {
      responses: {
        '200': { description: 'Contacto eliminado.', schema: ref('MessageResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Contacto no encontrado.')
      }
    },

    'GET /api/v1/services': {
      note: 'Endpoint publico: no requiere Authorization.',
      responses: {
        '200': { description: 'Servicios disponibles.', schema: arr(ref('Service')) }
      }
    },

    'GET /api/v1/services/:id': {
      responses: {
        '200': { description: 'Detalle del servicio.', schema: ref('Service') },
        '401': common.unauthorized,
        '404': ERR('Servicio no encontrado.')
      }
    },

    'POST /api/v1/atm/accounts/:id/deposit': {
      request: { schema: ref('AtmOperationRequest') },
      responses: {
        '200': { description: 'Deposito ATM aplicado.', schema: ref('AtmOperationResponse') },
        '401': common.invalidPin,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/atm/accounts/:id/withdraw': {
      request: { schema: ref('AtmOperationRequest') },
      responses: {
        '200': { description: 'Retiro ATM aplicado.', schema: ref('AtmOperationResponse') },
        '401': common.invalidPin,
        '402': common.insufficientFunds,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'GET /api/v1/atm/accounts/:id/balance': {
      parameters: [
        { name: 'pin', in: 'query', required: true, description: 'PIN de 4 digitos del usuario.', schema: { type: 'string', pattern: '^\\d{4}$' } }
      ],
      responses: {
        '200': { description: 'Saldo consultado.', schema: ref('AtmBalanceResponse') },
        '401': common.invalidPin,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'GET /api/v1/atm/accounts/:id/statement': {
      parameters: [
        { name: 'pin', in: 'query', required: true, description: 'PIN de 4 digitos del usuario.', schema: { type: 'string', pattern: '^\\d{4}$' } }
      ],
      responses: {
        '200': { description: 'Ultimos 10 movimientos.', schema: ref('AtmStatementResponse') },
        '401': common.invalidPin,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'PUT /api/v1/users/:id': {
      request: { schema: ref('UserUpdateRequest') },
      responses: {
        '200': { description: 'Perfil actualizado.', schema: ref('UserUpdateResponse') },
        '400': ERR('Solo se puede actualizar el propio usuario.'),
        '401': common.unauthorized,
        '422': common.validation
      }
    },

    'PATCH /api/v1/users/:id': {
      request: { schema: ref('UserUpdateRequest') },
      responses: {
        '200': { description: 'Perfil actualizado.', schema: ref('UserUpdateResponse') },
        '400': ERR('Solo se puede actualizar el propio usuario.'),
        '401': common.unauthorized,
        '422': common.validation
      }
    },

    'PUT /api/v1/users/:id/pin': {
      request: { schema: ref('PinChangeRequest') },
      responses: {
        '200': { description: 'PIN actualizado.', schema: ref('MessageResponse') },
        '401': ERR('PIN actual incorrecto.'),
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'GET /api/v1/users/:id/profile': {
      responses: {
        '200': { description: 'Perfil del usuario.', schema: ref('UserSummary') },
        '401': common.unauthorized,
        '404': ERR('Usuario no encontrado.')
      }
    },

    'GET /api/v1/users/:id/address': {
      responses: {
        '200': { description: 'Direccion del usuario.', schema: ref('Address') },
        '401': common.unauthorized,
        '403': ERR('No autorizado para gestionar esta direccion.'),
        '404': ERR('Direccion no encontrada.')
      }
    },

    'PUT /api/v1/users/:id/address': {
      request: { schema: ref('AddressInput') },
      responses: {
        '200': { description: 'Direccion guardada.', schema: ref('AddressUpsertResponse') },
        '401': common.unauthorized,
        '403': ERR('No autorizado para gestionar esta direccion.'),
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'GET /api/v1/users/:id/files': {
      responses: {
        '200': { description: 'Archivos del usuario.', schema: ref('UserFilesResponse') },
        '401': common.unauthorized,
        '403': ERR('No autorizado para gestionar archivos de este usuario.'),
        '404': ERR('Usuario no encontrado.')
      }
    },

    'POST /api/v1/users/:id/files': {
      note: 'Enviar como multipart/form-data con el campo file.',
      request: { contentType: 'multipart/form-data', schema: ref('FileUploadRequest') },
      responses: {
        '201': { description: 'Archivo cargado.', schema: ref('UserFileCreatedResponse') },
        '401': common.unauthorized,
        '403': ERR('No autorizado para gestionar archivos de este usuario.'),
        '404': ERR('Usuario no encontrado.'),
        '422': ERR('Archivo ausente, tipo no permitido o mayor a 5 MB.')
      }
    },

    'DELETE /api/v1/users/:id/files/:file_id': {
      responses: {
        '200': { description: 'Archivo eliminado.', schema: ref('UserFileDeletedResponse') },
        '401': common.unauthorized,
        '403': ERR('No autorizado para gestionar archivos de este usuario.'),
        '404': ERR('Archivo no encontrado.')
      }
    },

    'GET /api/v1/manager/reports/overview': {
      responses: {
        '200': { description: 'Reporte ejecutivo general.', schema: ref('OverviewReport') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/reports/loans': {
      parameters: [
        {
          name: 'status',
          in: 'query',
          required: false,
          description: 'Filtra por estado del prestamo.',
          schema: { type: 'string', enum: [ 'active', 'completed', 'cancelled' ] }
        }
      ],
      responses: {
        '200': { description: 'Reporte de prestamos.', schema: ref('LoansReport') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/reports/accounts_activity': {
      parameters: [
        { name: 'days', in: 'query', required: false, description: 'Ventana en dias (30 por defecto).', schema: { type: 'integer', minimum: 1 } }
      ],
      responses: {
        '200': { description: 'Actividad de cuentas.', schema: ref('AccountsActivityReport') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/logins': {
      parameters: [
        { name: 'period', in: 'query', required: false, description: 'Periodo a consultar.', schema: { type: 'string', enum: [ 'day', 'week', 'month' ] } },
        { name: 'date', in: 'query', required: false, description: 'Fecha de referencia (YYYY-MM-DD).', schema: { type: 'string', format: 'date' } },
        { name: 'status', in: 'query', required: false, description: 'Resultado del acceso.', schema: { type: 'string', enum: [ 'success', 'failure', 'blocked' ] } },
        ...paginationQuery
      ],
      responses: {
        '200': { description: 'Reporte de accesos paginado.', schema: ref('LoginEventsPage') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/logins/download': {
      parameters: [
        { name: 'period', in: 'query', required: false, description: 'Periodo a exportar.', schema: { type: 'string', enum: [ 'day', 'week', 'month' ] } },
        { name: 'date', in: 'query', required: false, description: 'Fecha de referencia (YYYY-MM-DD).', schema: { type: 'string', format: 'date' } },
        { name: 'status', in: 'query', required: false, description: 'Resultado del acceso.', schema: { type: 'string', enum: [ 'success', 'failure', 'blocked' ] } }
      ],
      responses: {
        '200': csv('CSV con encabezados created_at, status, user_id, user_name, account_number.'),
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/users': {
      parameters: paginationQuery,
      responses: {
        '200': { description: 'Usuarios paginados.', schema: ref('UsersPage') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/users/:id': {
      responses: {
        '200': { description: 'Detalle del usuario.', schema: ref('ManagerUserDetailResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.')
      }
    },

    'POST /api/v1/manager/users': {
      note: 'Solo Admin.',
      request: { schema: ref('ManagerUserCreateRequest') },
      responses: {
        '201': { description: 'Usuario creado.', schema: ref('ManagerUserResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '422': common.validation
      }
    },

    'PUT /api/v1/manager/users/:id': {
      note: 'Solo Admin. La respuesta usa el resumen de usuario.',
      request: { schema: ref('ManagerUserUpdateRequest') },
      responses: {
        '200': { description: 'Usuario actualizado.', schema: ref('ManagerUserResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'PATCH /api/v1/manager/users/:id': {
      note: 'Solo Admin. La respuesta usa el resumen de usuario.',
      request: { schema: ref('ManagerUserUpdateRequest') },
      responses: {
        '200': { description: 'Usuario actualizado.', schema: ref('ManagerUserResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'PATCH /api/v1/manager/users/:id/block': {
      note: 'Solo Admin. No permite bloquear el propio usuario ni uno desactivado.',
      responses: {
        '200': { description: 'Usuario bloqueado.', schema: ref('ManagerUserResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'PATCH /api/v1/manager/users/:id/unblock': {
      note: 'Solo Admin.',
      responses: {
        '200': { description: 'Usuario desbloqueado.', schema: ref('ManagerUserResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'PATCH /api/v1/manager/users/:id/deactivate': {
      note: 'Solo Admin. No permite desactivar el propio usuario.',
      responses: {
        '200': { description: 'Usuario desactivado.', schema: ref('ManagerUserResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.'),
        '422': common.validation
      }
    },

    'DELETE /api/v1/manager/users/:id': {
      note: 'Solo Admin. No permite eliminar el propio usuario.',
      responses: {
        '200': { description: 'Usuario eliminado.', schema: ref('ManagerUserDeleteResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Usuario no encontrado.'),
        '422': ERR('No puede eliminar su propio usuario.')
      }
    },

    'POST /api/v1/manager/loans/:id/cancel': {
      responses: {
        '200': { description: 'Prestamo cancelado.', schema: ref('LoanCancelResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Prestamo no encontrado.'),
        '422': ERR('El prestamo ya esta completado.')
      }
    },

    'POST /api/v1/manager/accounts/:account_id/loans/preview': {
      request: { schema: ref('LoanCreateRequest') },
      responses: {
        '200': { description: 'Plan de pagos proyectado.', schema: ref('LoanPreviewResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/manager/accounts/:account_id/loans': {
      request: { schema: ref('LoanCreateRequest') },
      responses: {
        '201': { description: 'Prestamo originado en la cuenta.', schema: ref('ManagerLoanCreatedResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'GET /api/v1/manager/accounts/:account_id/summary': {
      responses: {
        '200': { description: 'Resumen de saldo y prestamos de la cuenta.', schema: ref('ManagerAccountSummary') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta no encontrada.')
      }
    },

    'GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments': {
      parameters: paginationQuery,
      responses: {
        '200': { description: 'Plan de pagos paginado.', schema: ref('ManagerInstallmentsPage') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta o prestamo no encontrado.')
      }
    },

    'GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/summary': {
      responses: {
        '200': { description: 'Conteo de cuotas pagadas y pendientes.', schema: ref('InstallmentsSummaryResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta o prestamo no encontrado.')
      }
    },

    'GET /api/v1/manager/accounts/:account_id/loans/:loan_id/installments/download': {
      responses: {
        '200': csv('CSV con installment_number, due_date, amount, principal_amount, interest_amount, status, paid_at.'),
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta o prestamo no encontrado.')
      }
    },

    'GET /api/v1/manager/operations': {
      parameters: [
        { name: 'period', in: 'query', required: false, description: 'Periodo a consultar.', schema: { type: 'string', enum: [ 'day', 'week', 'month' ] } },
        { name: 'date', in: 'query', required: false, description: 'Fecha de referencia (YYYY-MM-DD).', schema: { type: 'string', format: 'date' } },
        {
          name: 'operation_type',
          in: 'query',
          required: false,
          description: 'Tipo de operacion o grupo (credit/debit).',
          schema: { type: 'string', enum: [ 'all', 'credit', 'debit', ...TRANSACTION_TYPES ] }
        },
        {
          name: 'performed_by',
          in: 'query',
          required: false,
          description: 'Rol del ejecutor.',
          schema: { type: 'string', enum: [ 'all', 'manager', 'admin', 'cashier', 'user' ] }
        },
        ...paginationQuery
      ],
      responses: {
        '200': { description: 'Bitacora de operaciones paginada.', schema: ref('OperationsPage') },
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'GET /api/v1/manager/operations/download': {
      parameters: [
        { name: 'period', in: 'query', required: false, description: 'Periodo a exportar.', schema: { type: 'string', enum: [ 'day', 'week', 'month' ] } },
        { name: 'date', in: 'query', required: false, description: 'Fecha de referencia (YYYY-MM-DD).', schema: { type: 'string', format: 'date' } },
        { name: 'operation_type', in: 'query', required: false, description: 'Tipo de operacion o grupo.', schema: { type: 'string' } },
        { name: 'performed_by', in: 'query', required: false, description: 'Rol del ejecutor.', schema: { type: 'string' } }
      ],
      responses: {
        '200': csv('CSV con id, created_at, transaction_type, amount, description, status, cuenta, usuario y ejecutor.'),
        '401': common.unauthorized,
        '403': common.forbidden
      }
    },

    'POST /api/v1/manager/accounts/:account_id/deposit': {
      note: 'Requiere rol admin, manager o cajero.',
      request: { schema: ref('AccountOperationRequest') },
      responses: {
        '200': { description: 'Deposito aplicado.', schema: ref('ManagerOperationResponse') },
        '401': common.unauthorized,
        '403': common.forbidden,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/manager/accounts/:account_id/withdraw': {
      note: 'Requiere rol admin, manager o cajero.',
      request: { schema: ref('AccountOperationRequest') },
      responses: {
        '200': { description: 'Retiro aplicado.', schema: ref('ManagerOperationResponse') },
        '401': common.unauthorized,
        '402': common.insufficientFunds,
        '403': common.forbidden,
        '404': ERR('Cuenta no encontrada.'),
        '422': common.validation
      }
    },

    'POST /api/v1/manager/accounts/:account_id/loans/:loan_id/pay': {
      request: { schema: ref('LoanPaymentRequest') },
      responses: {
        '200': { description: 'Pago de prestamo aplicado.', schema: ref('ManagerLoanPaymentResponse') },
        '401': common.unauthorized,
        '402': common.insufficientFunds,
        '403': common.forbidden,
        '404': ERR('Cuenta o prestamo no encontrado.'),
        '422': common.validation
      }
    }
  };

  const GROUPS = [
    { id: 'sistema', title: 'Sistema', test: (path) => path === '/' || path === '/up' },
    { id: 'auth', title: 'Autenticacion y tipos de cambio', test: (path) => [ '/api/v1/register', '/api/v1/login', '/api/v1/logout', '/api/v1/currency_rates' ].includes(path) },
    { id: 'manager-reportes', title: 'Manager · Reportes', test: (path) => path.startsWith('/api/v1/manager/reports') },
    { id: 'manager-auditoria', title: 'Manager · Auditoria', test: (path) => path.startsWith('/api/v1/manager/logins') || path.startsWith('/api/v1/manager/operations') },
    { id: 'manager-usuarios', title: 'Manager · Usuarios', test: (path) => path.startsWith('/api/v1/manager/users') },
    { id: 'manager-cuentas', title: 'Manager · Cuentas y prestamos', test: (path) => path.startsWith('/api/v1/manager/loans') || path.startsWith('/api/v1/manager/accounts') },
    { id: 'prestamos', title: 'Prestamos (cliente)', test: (path) => path.includes('/loans') },
    { id: 'destinatarios', title: 'Destinatarios', test: (path) => path.startsWith('/api/v1/recipients') },
    { id: 'contactos', title: 'Contactos', test: (path) => path.startsWith('/api/v1/contacts') },
    { id: 'servicios', title: 'Servicios', test: (path) => path.startsWith('/api/v1/services') },
    { id: 'atm', title: 'Cajero (ATM)', test: (path) => path.startsWith('/api/v1/atm') },
    { id: 'usuarios', title: 'Usuarios: perfil, direccion y archivos', test: (path) => path.startsWith('/api/v1/users') },
    { id: 'cuentas', title: 'Cuentas y transacciones', test: (path) => path.startsWith('/api/v1/accounts') }
  ];

  function groupFor(path) {
    return GROUPS.find((group) => group.test(path)) || { id: 'otros', title: 'Otros' };
  }

  function endpointKey(endpoint) {
    return `${endpoint.method} ${endpoint.path}`;
  }

  function schemaId(key) {
    return `schema-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function refName(refPath) {
    return String(refPath).split('/').pop();
  }

  function typeLabel(schema) {
    if (!schema) return '—';
    if (schema.$ref) return refName(schema.$ref);
    if (schema.oneOf) return schema.oneOf.map((item) => typeLabel(item)).join(' | ');
    if (schema.enum) return schema.enum.map((value) => `"${value}"`).join(' | ');
    if (schema.type === 'array') return `${typeLabel(schema.items)}[]`;
    if (schema.format && typeof schema.type === 'string') return `${schema.type} (${schema.format})`;
    if (Array.isArray(schema.type)) return schema.type.join(' | ');
    return schema.type || 'object';
  }

  const PATH_PARAM_TYPES = { account_id: 'string', id: 'integer', loan_id: 'integer', file_id: 'integer' };

  function pathParameters(path) {
    const names = [ ...path.matchAll(/:([A-Za-z_][A-Za-z0-9_]*)/g) ].map((match) => match[1]);
    return names.map((name) => ({
      name,
      in: 'path',
      required: true,
      description: name === 'account_id' ? 'Identificador o numero de cuenta.' : 'Identificador numerico.',
      schema: { type: PATH_PARAM_TYPES[name] || 'string' }
    }));
  }

  function escapeHtml(text) {
    return String(text ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function refLink(name) {
    return `<a class="ref-link" href="#component-${escapeHtml(name)}"><code>${escapeHtml(name)}</code></a>`;
  }

  function schemaRows(schema, options = {}) {
    const depth = options.depth || 0;
    const prefix = options.prefix || '';
    const properties = schema.properties || {};
    const required = new Set(schema.required || []);
    const rows = [];

    Object.keys(properties).forEach((name) => {
      const property = properties[name];
      const rowName = prefix ? `${prefix}.${name}` : name;
      const arrayRef = property.type === 'array' && property.items && property.items.$ref
        ? refName(property.items.$ref)
        : null;

      rows.push({
        name: rowName,
        type: typeLabel(property),
        ref: property.$ref ? refName(property.$ref) : arrayRef,
        isArray: property.type === 'array',
        required: required.has(name),
        description: property.description || ''
      });

      if (depth >= 2 || property.$ref) return;

      if (property.type === 'object' && property.properties) {
        rows.push(...schemaRows(property, { depth: depth + 1, prefix: rowName }));
      }
      if (property.type === 'array' && property.items && property.items.type === 'object' && property.items.properties) {
        rows.push(...schemaRows(property.items, { depth: depth + 1, prefix: `${rowName}[]` }));
      }
    });

    return rows;
  }

  function renderSchemaTable(schema) {
    if (!schema) return '<p class="schema-note">Sin esquema declarado.</p>';

    if (schema.$ref) {
      const name = refName(schema.$ref);
      const target = components[name];
      if (!target) return `<p class="schema-note">Referencia a ${escapeHtml(name)}.</p>`;

      return `<p class="schema-note">Definicion: ${refLink(name)}</p>${renderProperties(target)}`;
    }

    if (schema.type === 'array') {
      const items = schema.items || {};
      if (items.$ref) {
        return `<p class="schema-note">Arreglo de ${refLink(refName(items.$ref))}.</p>`;
      }
      return `<p class="schema-note">${escapeHtml(schema.description || 'Arreglo de elementos.')}</p>${renderProperties(items)}`;
    }

    if (schema.type === 'string' && (schema.format === 'binary' || schema.description)) {
      return `<p class="schema-note">${escapeHtml(schema.description || 'Contenido de texto.')} Tipo: ${escapeHtml(typeLabel(schema))}.</p>`;
    }

    return renderProperties(schema);
  }

  function renderProperties(schema) {
    if (!schema || !schema.properties) {
      return `<p class="schema-note">Tipo: ${escapeHtml(typeLabel(schema))}.</p>`;
    }

    const rows = schemaRows(schema);
    if (!rows.length) return '<p class="schema-note">Sin propiedades declaradas.</p>';

    const body = rows.map((row) => `
      <tr>
        <td class="mono"><code>${escapeHtml(row.name)}</code></td>
        <td>${row.ref ? `${refLink(row.ref)}${row.isArray ? '[]' : ''}` : `<code>${escapeHtml(row.type)}</code>`}</td>
        <td>${row.required ? 'Si' : 'No'}</td>
        <td>${escapeHtml(row.description)}</td>
      </tr>`).join('');

    return `
      <table class="schema-table">
        <thead>
          <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Descripcion</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>`;
  }

  function renderParameters(parameters) {
    if (!parameters.length) return '';

    const rows = parameters.map((parameter) => `
      <tr>
        <td class="mono"><code>${escapeHtml(parameter.name)}</code></td>
        <td><code>${escapeHtml(parameter.in)}</code></td>
        <td><code>${escapeHtml(typeLabel(parameter.schema))}</code></td>
        <td>${parameter.required ? 'Si' : 'No'}</td>
        <td>${escapeHtml(parameter.description || '')}</td>
      </tr>`).join('');

    return `
      <table class="schema-table">
        <thead>
          <tr><th>Parametro</th><th>Ubicacion</th><th>Tipo</th><th>Obligatorio</th><th>Descripcion</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function statusClass(status) {
    const first = String(status).charAt(0);
    if (first === '2') return 'status s2xx';
    if (first === '4') return 'status s4xx';
    if (first === '5') return 'status s5xx';
    return 'status';
  }

  function renderEndpointCard(endpoint, exampleFor) {
    const key = endpointKey(endpoint);
    const schema = endpointSchemas[key];
    const group = groupFor(endpoint.path);
    const parameters = [ ...pathParameters(endpoint.path), ...((schema && schema.parameters) || []) ];
    const request = schema && schema.request;
    const responses = (schema && schema.responses) || {};
    const statuses = Object.keys(responses);

    const requestBlock = request
      ? `<div class="schema-block">
           <h4>Request · ${escapeHtml(request.contentType || 'application/json')}</h4>
           ${renderSchemaTable(request.schema)}
         </div>`
      : `<div class="schema-block"><h4>Request</h4><p class="schema-note">Sin body: los datos viajan en la ruta o en el query string.</p></div>`;

    const parametersBlock = parameters.length
      ? `<div class="schema-block"><h4>Parametros</h4>${renderParameters(parameters)}</div>`
      : '';

    const responsesBlock = statuses.length
      ? statuses.map((status) => {
        const response = responses[status];
        const content = response.schema
          ? `<div class="schema-note"><code>Content-Type: ${escapeHtml(response.contentType || 'application/json')}</code></div>${renderSchemaTable(response.schema)}`
          : '';
        return `<div class="response">
          <div class="response-head"><span class="${statusClass(status)}">${escapeHtml(status)}</span><span>${escapeHtml(response.description || '')}</span></div>
          ${content}
        </div>`;
      }).join('')
      : '<p class="schema-note">Sin respuestas documentadas.</p>';

    const example = typeof exampleFor === 'function'
      ? `<details class="example">
           <summary>Ver ejemplo completo de la peticion</summary>
           <pre class="example-pre">${escapeHtml(exampleFor(endpoint))}</pre>
         </details>`
      : '';

    return `
      <article class="schema-card" id="${schemaId(key)}">
        <div class="schema-head">
          <span class="method m-${endpoint.method.toLowerCase()}">${escapeHtml(endpoint.method)}</span>
          <h3 class="path">${escapeHtml(endpoint.path)}</h3>
          <span class="chip ${endpoint.auth === 'public' ? 'ok' : 'warn'}">${escapeHtml(endpoint.auth)}</span>
          <span class="chip">${escapeHtml(group.title)}</span>
        </div>
        <p class="schema-desc">${escapeHtml((schema && schema.summary) || endpoint.desc)}</p>
        ${schema && schema.note ? `<p class="schema-note">${escapeHtml(schema.note)}</p>` : ''}
        ${parametersBlock}
        ${requestBlock}
        <div class="schema-block"><h4>Responses</h4>${responsesBlock}</div>
        ${example}
      </article>`;
  }

  function renderComponentCard(name) {
    const schema = components[name];
    return `
      <article class="component-card" id="component-${escapeHtml(name)}">
        <h3><code>${escapeHtml(name)}</code></h3>
        ${schema.description ? `<p class="schema-note">${escapeHtml(schema.description)}</p>` : ''}
        ${renderProperties(schema)}
      </article>`;
  }

  function mount(config) {
    const endpoints = config.endpoints || [];
    const endpointsContainer = config.endpointsContainer;
    const componentsContainer = config.componentsContainer;
    const searchInput = config.searchInput;
    const groupSelect = config.groupSelect;
    const countLabel = config.countLabel;
    const downloadButton = config.downloadButton;

    const activeGroups = GROUPS
      .map((group) => ({
        ...group,
        endpoints: endpoints.filter((endpoint) => groupFor(endpoint.path).id === group.id)
      }))
      .filter((group) => group.endpoints.length > 0);

    if (groupSelect) {
      groupSelect.innerHTML = '<option value="all">Todos los modulos</option>'
        + activeGroups.map((group) => `<option value="${escapeHtml(group.id)}">${escapeHtml(group.title)} (${group.endpoints.length})</option>`).join('');
    }

    const componentNames = Object.keys(components);

    function matchesQuery(text, query) {
      return !query || text.toLowerCase().includes(query);
    }

    function renderEndpoints() {
      const query = (searchInput && searchInput.value || '').trim().toLowerCase();
      const groupId = groupSelect ? groupSelect.value : 'all';

      const visibleGroups = activeGroups
        .filter((group) => groupId === 'all' || group.id === groupId)
        .map((group) => ({
          ...group,
          endpoints: group.endpoints.filter((endpoint) => {
            const schema = endpointSchemas[endpointKey(endpoint)] || {};
            const text = `${endpointKey(endpoint)} ${endpoint.desc} ${endpoint.payload} ${group.title} ${JSON.stringify(schema)}`;
            return matchesQuery(text, query);
          })
        }))
        .filter((group) => group.endpoints.length > 0);

      const total = visibleGroups.reduce((sum, group) => sum + group.endpoints.length, 0);

      if (!total) {
        endpointsContainer.innerHTML = '<p class="empty-state">Sin resultados para el filtro actual.</p>';
      } else {
        endpointsContainer.innerHTML = visibleGroups.map((group) => `
          <section class="schema-group">
            <h3>${escapeHtml(group.title)}</h3>
            ${group.endpoints.map((endpoint) => renderEndpointCard(endpoint, config.exampleFor)).join('')}
          </section>`).join('');
      }

      const visibleComponents = componentNames.filter((name) => {
        const text = `${name} ${JSON.stringify(components[name])}`;
        return matchesQuery(text, query);
      });

      if (componentsContainer) {
        componentsContainer.innerHTML = visibleComponents.length
          ? `<div class="component-grid">${visibleComponents.map(renderComponentCard).join('')}</div>`
          : '<p class="empty-state">Sin componentes que coincidan con la busqueda.</p>';
      }

      if (countLabel) {
        countLabel.textContent = `${total} de ${endpoints.length} endpoints documentados · ${visibleComponents.length} componentes reutilizables.`;
      }
    }

    function showEndpoint(key) {
      if (!endpointsContainer) return;

      if (searchInput) searchInput.value = '';
      if (groupSelect) groupSelect.value = 'all';
      renderEndpoints();

      const card = document.getElementById(schemaId(key));
      if (!card) return;

      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.classList.add('is-highlighted');
      window.setTimeout(() => card.classList.remove('is-highlighted'), 2200);
    }

    if (searchInput) searchInput.addEventListener('input', renderEndpoints);
    if (groupSelect) groupSelect.addEventListener('change', renderEndpoints);
    if (downloadButton) {
      downloadButton.addEventListener('click', () => downloadOpenApi(endpoints));
    }

    renderEndpoints();

    return { showEndpoint, renderEndpoints };
  }

  function operationId(endpoint) {
    const normalized = `${endpoint.method.toLowerCase()} ${endpoint.path}`
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');
    return normalized;
  }

  function buildOpenApi(endpoints) {
    const paths = {};

    endpoints.forEach((endpoint) => {
      const schema = endpointSchemas[endpointKey(endpoint)];
      if (!schema) return;

      const openApiPath = endpoint.path.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, '{$1}');
      const operation = {
        tags: [ groupFor(endpoint.path).title ],
        summary: schema.summary || endpoint.desc,
        operationId: operationId(endpoint),
        security: endpoint.auth === 'public' ? [] : [ { bearerAuth: [] } ],
        responses: {}
      };

      const parameters = [ ...pathParameters(endpoint.path), ...(schema.parameters || []) ];
      if (parameters.length) operation.parameters = parameters;

      if (schema.request && schema.request.schema) {
        const contentType = schema.request.contentType || 'application/json';
        operation.requestBody = {
          required: true,
          content: { [contentType]: { schema: schema.request.schema } }
        };
      }

      Object.entries(schema.responses || {}).forEach(([ status, response ]) => {
        const content = response.schema
          ? { [response.contentType || 'application/json']: { schema: response.schema } }
          : null;
        operation.responses[status] = content
          ? { description: response.description || '', content }
          : { description: response.description || '' };
      });

      if (!Object.keys(operation.responses).length) {
        operation.responses['200'] = { description: 'OK' };
      }

      paths[openApiPath] = paths[openApiPath] || {};
      paths[openApiPath][endpoint.method.toLowerCase()] = operation;
    });

    return {
      openapi: '3.1.0',
      info: {
        title: 'AngelFire · RepoAPI',
        version: '1.0.0',
        description: 'Esquemas de request/response de las APIs v1 del sistema AngelFire (BankFacilito).'
      },
      servers: [ { url: API_BASE_URL, description: 'Servidor local de desarrollo' } ],
      tags: GROUPS
        .filter((group) => endpoints.some((endpoint) => groupFor(endpoint.path).id === group.id))
        .map((group) => ({ name: group.title })),
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        },
        schemas: components
      },
      paths
    };
  }

  function downloadOpenApi(endpoints) {
    const document_ = buildOpenApi(endpoints);
    const blob = new Blob([ JSON.stringify(document_, null, 2) ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'angelfire-openapi.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  window.AngelFireSchemas = {
    components,
    endpointSchemas,
    groupFor,
    mount,
    buildOpenApi,
    downloadOpenApi
  };
})();
