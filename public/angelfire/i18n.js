(() => {
  const storageKey = 'angelfire-language';
  const languages = ['es', 'en', 'pt'];
  const phrases = [
    ['Gestión de clientes y usuarios', 'Customer and user management', 'Gerenciamento de clientes e usuários'],
    ['Buscar usuario', 'Search user', 'Buscar usuário'],
    ['Cliente seleccionado', 'Selected customer', 'Cliente selecionado'],
    ['Atención al Cliente', 'Customer Service', 'Atendimento ao Cliente'],
    ['Datos personales', 'Personal data', 'Dados pessoais'],
    ['Cuentas asociadas', 'Linked accounts', 'Contas vinculadas'],
    ['Forzar cambio de PIN', 'Force PIN change', 'Forçar alteração do PIN'],
    ['Desactivar', 'Deactivate', 'Desativar'],
    ['Roles y permisos', 'Roles and permissions', 'Funções e permissões'],
    ['Contabilidad financiera', 'Financial accounting', 'Contabilidade financeira'],
    ['Balance general', 'Balance sheet', 'Balanço patrimonial'],
    ['Estado de resultados', 'Income statement', 'Demonstrativo de resultados'],
    ['Vista cajero', 'Cashier view', 'Visão do caixa'],
    ['Apertura de caja', 'Cash register opening', 'Abertura de caixa'],
    ['Arqueo de caja', 'Cash count', 'Conferência de caixa'],
    ['Cierre de caja', 'Cash register closing', 'Fechamento de caixa'],
    ['Monto inicial', 'Opening amount', 'Valor inicial'],
    ['Dinero físico', 'Physical cash', 'Dinheiro físico'],
    ['Registrar cliente', 'Register customer', 'Cadastrar cliente'],
    ['Aperturar cuenta', 'Open account', 'Abrir conta'],
    ['Movimientos y comprobantes', 'Movements and receipts', 'Movimentos e comprovantes'],
    ['Reporte diario de caja', 'Daily cash report', 'Relatório diário de caixa'],
    ['Solicitar crédito', 'Request credit', 'Solicitar crédito'],
    ['Enviar solicitud', 'Submit request', 'Enviar solicitação'],
    ['Crear ticket', 'Create ticket', 'Criar chamado'],
    ['Asunto', 'Subject', 'Assunto'],
    ['Describe el problema', 'Describe the problem', 'Descreva o problema'],
    ['Ticket de soporte creado.', 'Support ticket created.', 'Chamado de suporte criado.'],
    ['Solicitud de crédito creada.', 'Credit request created.', 'Solicitação de crédito criada.'],
    ['Preferencias actualizadas.', 'Preferences updated.', 'Preferências atualizadas.'],
    ['Sin notificaciones', 'No notifications', 'Sem notificações'],
    ['Actualizar', 'Refresh', 'Atualizar'],
    ['Guardar', 'Save', 'Salvar'],
    ['Preferencias', 'Preferences', 'Preferências'],
    ['Tema', 'Theme', 'Tema'],
    ['Claro', 'Light', 'Claro'],
    ['Oscuro', 'Dark', 'Escuro'],
    ['Saldo consolidado', 'Consolidated balance', 'Saldo consolidado'],
    ['Ingresos del mes', 'Monthly income', 'Receitas do mês'],
    ['Gastos del mes', 'Monthly expenses', 'Despesas do mês'],
    ['Notificaciones', 'Notifications', 'Notificações'],
    ['Comprobante', 'Receipt', 'Comprovante'],
    ['Generar', 'Generate', 'Gerar'],
    ['Descargar', 'Download', 'Baixar'],
    ['Guardar datos', 'Save data', 'Salvar dados'],
    ['Atención al cliente', 'Customer service', 'Atendimento ao cliente'],
    ['Vista atención al cliente', 'Customer service view', 'Visão de atendimento ao cliente'],
    ['Casos y reclamos', 'Cases and complaints', 'Casos e reclamações'],
    ['Restablecer PIN', 'Reset PIN', 'Redefinir PIN'],
    ['Inactivar usuario', 'Deactivate user', 'Desativar usuário'],
    ['Reactivar usuario', 'Reactivate user', 'Reativar usuário'],
    ['Registrar nuevo cliente', 'Register new customer', 'Cadastrar novo cliente'],
    ['Nombre', 'First name', 'Nome'],
    ['Apellido', 'Last name', 'Sobrenome'],
    ['Buscar cliente', 'Search customer', 'Buscar cliente'],
    ['Casos y reclamos', 'Cases and complaints', 'Casos e reclamações'],
    ['Crear caso', 'Create case', 'Criar caso'],
    ['Desbloquear usuario', 'Unblock user', 'Desbloquear usuário'],
    ['Nuevo PIN', 'New PIN', 'Novo PIN'],
    ['Crear cuenta', 'Create account', 'Criar conta'],
    ['Idioma', 'Language', 'Idioma'],
    ['AngelFire - Inicio', 'AngelFire - Home', 'AngelFire - Início'],
    ['AngelFire | Login', 'AngelFire | Sign in', 'AngelFire | Entrar'],
    ['AngelFire | Core Banking Console', 'AngelFire | Banking console', 'AngelFire | Console bancário'],
    ['AngelFire | Encuesta', 'AngelFire | Survey', 'AngelFire | Pesquisa'],
    ['AngelFire | API Endpoints', 'AngelFire | API Endpoints', 'AngelFire | Endpoints da API'],
    ['Inicio', 'Home', 'Início'],
    ['Sobre nosotros', 'About us', 'Sobre nós'],
    ['Características', 'Features', 'Recursos'],
    ['Contacto', 'Contact', 'Contato'],
    ['Acceder', 'Sign in', 'Entrar'],
    ['Plataforma financiera digital', 'Digital financial platform', 'Plataforma financeira digital'],
    ['Confianza y seguridad para tus finanzas', 'Confidence and security for your finances', 'Confiança e segurança para suas finanças'],
    ['Operaciones seguras, experiencia digital ágil y soporte dedicado para mover tu dinero con total tranquilidad.', 'Secure transactions, a seamless digital experience, and dedicated support to move your money with confidence.', 'Operações seguras, experiência digital ágil e suporte dedicado para movimentar seu dinheiro com tranquilidade.'],
    ['Ingresar a mi cuenta', 'Access my account', 'Acessar minha conta'],
    ['Conoce más', 'Learn more', 'Saiba mais'],
    ['Transferencias en tiempo real', 'Real-time transfers', 'Transferências em tempo real'],
    ['Autenticación segura', 'Secure authentication', 'Autenticação segura'],
    ['Soporte 24/7', '24/7 support', 'Suporte 24/7'],
    ['Resumen financiero', 'Financial summary', 'Resumo financeiro'],
    ['Resumen', 'Summary', 'Resumo'],
    ['Saldo disponible', 'Available balance', 'Saldo disponível'],
    ['Ingresos', 'Income', 'Receitas'],
    ['Gastos', 'Expenses', 'Despesas'],
    ['Pago recibido', 'Payment received', 'Pagamento recebido'],
    ['Hace 2 horas', '2 hours ago', 'Há 2 horas'],
    ['Transferencia', 'Transfer', 'Transferência'],
    ['Hoy', 'Today', 'Hoje'],
    ['Indicadores de confianza', 'Trust indicators', 'Indicadores de confiança'],
    ['movimientos seguros', 'secure transactions', 'transações seguras'],
    ['disponibilidad', 'availability', 'disponibilidade'],
    ['atención humana', 'human support', 'atendimento humano'],
    ['encriptación', 'encryption', 'criptografia'],
    ['Sobre AngelFire', 'About AngelFire', 'Sobre a AngelFire'],
    ['Diseñado para personas y equipos que quieren control total', 'Designed for people and teams who want full control', 'Feito para pessoas e equipes que querem controle total'],
    ['AngelFire es una plataforma financiera de ejemplo pensada para demostrar APIs y flujos de usuario seguros, con una experiencia moderna, clara y confiable en cada operación.', 'AngelFire is a sample financial platform demonstrating secure APIs and user flows, with a modern, clear, and reliable experience for every transaction.', 'AngelFire é uma plataforma financeira demonstrativa criada para apresentar APIs e fluxos seguros, com uma experiência moderna, clara e confiável em cada operação.'],
    ['¿Por qué elegirnos?', 'Why choose us?', 'Por que nos escolher?'],
    ['Todo lo necesario para operar con tranquilidad', 'Everything you need to bank with confidence', 'Tudo o que você precisa para operar com tranquilidade'],
    ['Rendimiento', 'Performance', 'Desempenho'],
    ['Acceso ágil a tus cuentas, transferencias y consultas con una interfaz enfocada en velocidad.', 'Quick access to your accounts, transfers, and inquiries through an interface built for speed.', 'Acesso rápido às suas contas, transferências e consultas em uma interface feita para oferecer agilidade.'],
    ['Seguridad', 'Security', 'Segurança'],
    ['Protección por capas, validaciones y flujos de autenticación diseñados para reducir riesgos.', 'Layered protection, validation, and authentication flows designed to reduce risk.', 'Proteção em camadas, validações e fluxos de autenticação projetados para reduzir riscos.'],
    ['Visibilidad', 'Visibility', 'Visibilidade'],
    ['Monitorea tus movimientos, saldos y resultados con resúmenes claros y fáciles de entender.', 'Track transactions, balances, and results with clear, easy-to-understand summaries.', 'Acompanhe suas movimentações, saldos e resultados com resumos claros e fáceis de entender.'],
    ['Empieza hoy', 'Get started today', 'Comece hoje'],
    ['Haz crecer tus finanzas con una experiencia más segura', 'Grow your finances with a safer experience', 'Faça suas finanças crescerem com uma experiência mais segura'],
    ['Abrir plataforma', 'Open platform', 'Acessar plataforma'],
    ['Demo financiera', 'Financial demo', 'Demonstração financeira'],
    ['Soporte:', 'Support:', 'Suporte:'],
    ['Core Banking Console', 'Core Banking Console', 'Console bancário'],
    ['Sesion actual', 'Current session', 'Sessão atual'],
    ['Sin autenticar', 'Not authenticated', 'Não autenticado'],
    ['Rol:', 'Role:', 'Perfil:'],
    ['Permisos por seccion', 'Section permissions', 'Permissões por seção'],
    ['Cliente', 'Customer', 'Cliente'],
    ['Admin Dashboard', 'Admin dashboard', 'Painel administrativo'],
    ['Manager Users', 'Manager users', 'Usuários do gerente'],
    ['Bloqueado', 'Blocked', 'Bloqueado'],
    ['Plataforma financiera', 'Financial platform', 'Plataforma financeira'],
    ['Panel Operativo', 'Operations dashboard', 'Painel operacional'],
    ['Actualizar datos', 'Update details', 'Atualizar dados'],
    ['Cambiar PIN', 'Change PIN', 'Alterar PIN'],
    ['Ocultar seccion', 'Hide section', 'Ocultar seção'],
    ['Guardar', 'Save', 'Salvar'],
    ['Cerrar sesion', 'Sign out', 'Sair'],
    ['Vistas del sistema', 'System views', 'Visões do sistema'],
    ['Vista cliente', 'Customer view', 'Visão do cliente'],
    ['Vista admin', 'Admin view', 'Visão administrativa'],
    ['Saldo actual', 'Current balance', 'Saldo atual'],
    ['Auto ON', 'Auto ON', 'Automático ativado'],
    ['Actualizar saldo', 'Refresh balance', 'Atualizar saldo'],
    ['Auto-actualizar cada 15s', 'Auto-refresh every 15s', 'Atualizar automaticamente a cada 15s'],
    ['Cuenta', 'Account', 'Conta'],
    ['Usuario', 'User', 'Usuário'],
    ['Prestamo activo', 'Active loan', 'Empréstimo ativo'],
    ['Sin datos', 'No data', 'Sem dados'],
    ['Deposito', 'Deposit', 'Depósito'],
    ['Monto', 'Amount', 'Valor'],
    ['Detalle', 'Description', 'Descrição'],
    ['Deposito AngelFire', 'AngelFire deposit', 'Depósito AngelFire'],
    ['Motivo del deposito', 'Deposit reason', 'Motivo do depósito'],
    ['Aplicar deposito', 'Apply deposit', 'Efetuar depósito'],
    ['Retiro', 'Withdrawal', 'Saque'],
    ['Retiro AngelFire', 'AngelFire withdrawal', 'Saque AngelFire'],
    ['Motivo del retiro', 'Withdrawal reason', 'Motivo do saque'],
    ['Aplicar retiro', 'Apply withdrawal', 'Efetuar saque'],
    ['Pago de servicios', 'Bill payment', 'Pagamento de serviços'],
    ['Servicio', 'Service', 'Serviço'],
    ['Pago de servicio AngelFire', 'AngelFire bill payment', 'Pagamento de serviço AngelFire'],
    ['Motivo del pago', 'Payment reason', 'Motivo do pagamento'],
    ['Pagar servicio', 'Pay bill', 'Pagar serviço'],
    ['Plan de pagos del prestamo', 'Loan repayment schedule', 'Cronograma de parcelas do empréstimo'],
    ['Actualizar cuotas', 'Refresh installments', 'Atualizar parcelas'],
    ['No hay prestamo activo.', 'There is no active loan.', 'Não há empréstimo ativo.'],
    ['Pagar prestamo', 'Pay loan', 'Pagar empréstimo'],
    ['Proxima cuota pendiente:', 'Next pending installment:', 'Próxima parcela pendente:'],
    ['Cuotas a pagar', 'Installments to pay', 'Parcelas a pagar'],
    ['Calcular monto', 'Calculate amount', 'Calcular valor'],
    ['Monto total a pagar', 'Total amount to pay', 'Valor total a pagar'],
    ['Pagar cuotas', 'Pay installments', 'Pagar parcelas'],
    ['Cuotas pendientes', 'Pending installments', 'Parcelas pendentes'],
    ['Ver', 'Show', 'Exibir'],
    ['Anterior', 'Previous', 'Anterior'],
    ['Siguiente', 'Next', 'Próxima'],
    ['Vence', 'Due date', 'Vencimento'],
    ['Capital', 'Principal', 'Principal'],
    ['Interes', 'Interest', 'Juros'],
    ['Cuotas pagadas', 'Paid installments', 'Parcelas pagas'],
    ['Pago', 'Payment', 'Pagamento'],
    ['Archivos del usuario', 'User files', 'Arquivos do usuário'],
    ['Actualizar archivos', 'Refresh files', 'Atualizar arquivos'],
    ['Subir archivo', 'Upload file', 'Enviar arquivo'],
    ['Sin archivos', 'No files', 'Nenhum arquivo'],
    ['Archivo', 'File', 'Arquivo'],
    ['Tipo', 'Type', 'Tipo'],
    ['Tamaño', 'Size', 'Tamanho'],
    ['Fecha', 'Date', 'Data'],
    ['Movimientos de cuenta', 'Account transactions', 'Movimentações da conta'],
    ['Todos', 'All', 'Todos'],
    ['Debitos', 'Debits', 'Débitos'],
    ['Creditos', 'Credits', 'Créditos'],
    ['Depositos', 'Deposits', 'Depósitos'],
    ['Retiros', 'Withdrawals', 'Saques'],
    ['Transferencias', 'Transfers', 'Transferências'],
    ['Pago servicio', 'Bill payment', 'Pagamento de serviço'],
    ['Pago prestamo', 'Loan payment', 'Pagamento de empréstimo'],
    ['Prestamo desembolsado', 'Loan disbursed', 'Empréstimo liberado'],
    ['Ejecutado por', 'Performed by', 'Realizado por'],
    ['Admin', 'Admin', 'Admin'],
    ['Debito', 'Debit', 'Débito'],
    ['Credito', 'Credit', 'Crédito'],
    ['Actualizar', 'Refresh', 'Atualizar'],
    ['Total usuarios', 'Total users', 'Total de usuários'],
    ['Prestamos activos', 'Active loans', 'Empréstimos ativos'],
    ['Monto en prestamos', 'Loan amount', 'Valor em empréstimos'],
    ['Actividad 30 dias', 'Activity in 30 days', 'Atividade em 30 dias'],
    ['Operaciones admin para cliente/customer', 'Admin operations for customer', 'Operações administrativas para clientes'],
    ['Selecciona una operacion y recien se mostrara su formulario.', 'Select an operation to display its form.', 'Selecione uma operação para exibir o formulário.'],
    ['Crear usuario (admin)', 'Create user (admin)', 'Criar usuário (admin)'],
    ['Originar prestamo (admin)', 'Create loan (admin)', 'Conceder empréstimo (admin)'],
    ['Operar cuenta de usuario', 'Manage user account', 'Gerenciar conta de usuário'],
    ['Requeridos: nombre, apellido, email, PIN y rol.', 'Required: first name, last name, email, PIN, and role.', 'Obrigatórios: nome, sobrenome, e-mail, PIN e perfil.'],
    ['Nombre *', 'First name *', 'Nome *'],
    ['Apellido *', 'Last name *', 'Sobrenome *'],
    ['Telefono (opcional)', 'Phone (optional)', 'Telefone (opcional)'],
    ['Crear usuario', 'Create user', 'Criar usuário'],
    ['Cancelar operacion', 'Cancel operation', 'Cancelar operação'],
    ['Requeridos: account ID o numero de cuenta, monto, plazo y primera fecha de pago.', 'Required: account ID or account number, amount, term, and first payment date.', 'Obrigatórios: ID ou número da conta, valor, prazo e primeira data de pagamento.'],
    ['Account ID o numero de cuenta objetivo *', 'Target account ID or account number *', 'ID ou número da conta de destino *'],
    ['Monto del prestamo *', 'Loan amount *', 'Valor do empréstimo *'],
    ['Plazo en meses *', 'Term in months *', 'Prazo em meses *'],
    ['Previsualizar plan', 'Preview schedule', 'Pré-visualizar cronograma'],
    ['Aplicar prestamo', 'Apply loan', 'Conceder empréstimo'],
    ['Interes anual:', 'Annual interest:', 'Juros anuais:'],
    ['Interes anual estimado:', 'Estimated annual interest:', 'Juros anuais estimados:'],
    ['Requeridos: account ID o numero de cuenta y monto. Para pagar prestamo tambien se requiere loan ID.', 'Required: account ID or account number and amount. Paying a loan also requires a loan ID.', 'Obrigatórios: ID ou número da conta e valor. Para pagar um empréstimo, também é necessário o ID do empréstimo.'],
    ['Loan ID (solo para pagar prestamo)', 'Loan ID (for loan payments only)', 'ID do empréstimo (somente para pagamento)'],
    ['Descripcion (opcional)', 'Description (optional)', 'Descrição (opcional)'],
    ['Depositar', 'Deposit', 'Depositar'],
    ['Retirar', 'Withdraw', 'Sacar'],
    ['Eliminar usuario', 'Delete user', 'Excluir usuário'],
    ['Requerido: User ID.', 'Required: User ID.', 'Obrigatório: User ID.'],
    ['Estado de usuario', 'User status', 'Status do usuário'],
    ['Requerido: User ID para bloquear o desbloquear.', 'Required: User ID to block or unblock.', 'Obrigatório: User ID para bloquear ou desbloquear.'],
    ['Bloquear', 'Block', 'Bloquear'],
    ['Desbloquear', 'Unblock', 'Desbloquear'],
    ['Acciones admin', 'Admin actions', 'Ações administrativas'],
    ['Refresca reportes y lista de usuarios del sistema.', 'Refresh reports and the system user list.', 'Atualize os relatórios e a lista de usuários do sistema.'],
    ['Actualizar panel admin', 'Refresh admin dashboard', 'Atualizar painel administrativo'],
    ['Consulta de cuenta y prestamo', 'Account and loan lookup', 'Consulta de conta e empréstimo'],
    ['Consultar cuenta', 'Look up account', 'Consultar conta'],
    ['Sin cuenta seleccionada.', 'No account selected.', 'Nenhuma conta selecionada.'],
    ['Prestamo', 'Loan', 'Empréstimo'],
    ['Descargar plan CSV', 'Download schedule CSV', 'Baixar cronograma CSV'],
    ['Cuotas pagadas (paid)', 'Paid installments', 'Parcelas pagas'],
    ['Cuotas pendientes (pending)', 'Pending installments', 'Parcelas pendentes'],
    ['Sin plan cargado', 'No schedule loaded', 'Nenhum cronograma carregado'],
    ['Archivos del usuario (admin)', 'User files (admin)', 'Arquivos do usuário (admin)'],
    ['Usuarios del sistema', 'System users', 'Usuários do sistema'],
    ['Nombre', 'Name', 'Nome'],
    ['Correo electronico', 'Email', 'E-mail'],
    ['Estado', 'Status', 'Status'],
    ['Acciones', 'Actions', 'Ações'],
    ['Bitacora de operaciones admin', 'Admin activity log', 'Registro de operações administrativas'],
    ['Sin eventos de auditoria', 'No audit events', 'Nenhum evento de auditoria'],
    ['Respuesta API', 'API response', 'Resposta da API'],
    ['Listo para operar.', 'Ready to operate.', 'Pronto para operar.'],
    ['Confirmar operacion', 'Confirm operation', 'Confirmar operação'],
    ['Estas seguro de continuar?', 'Are you sure you want to continue?', 'Tem certeza de que deseja continuar?'],
    ['Cancelar', 'Cancel', 'Cancelar'],
    ['Confirmar', 'Confirm', 'Confirmar'],
    ['Previsualizacion de plan de pagos', 'Payment schedule preview', 'Pré-visualização do cronograma de parcelas'],
    ['Completa cuenta, monto y meses para generar una previsualizacion.', 'Enter an account, amount, and term to preview the schedule.', 'Informe a conta, o valor e o prazo para pré-visualizar o cronograma.'],
    ['Sin plan previsualizado', 'No schedule preview available', 'Nenhuma pré-visualização disponível'],
    ['Cerrar', 'Close', 'Fechar'],
    ['Guardar CSV', 'Save CSV', 'Salvar CSV'],
    ['No hay previsualizacion disponible para exportar en CSV.', 'No preview is available to export as CSV.', 'Não há pré-visualização disponível para exportar como CSV.'],
    ['La cuenta no existe.', 'The account does not exist.', 'A conta não existe.'],
    ['La cuenta no existe o no tiene prestamo asignado.', 'The account does not exist or has no assigned loan.', 'A conta não existe ou não possui empréstimo associado.'],
    ['Autenticado', 'Authenticated', 'Autenticado'],
    ['Operacion no completada', 'Operation not completed', 'Operação não concluída'],
    ['Entendido', 'Understood', 'Entendi'],
    ['Operacion cancelada por el usuario.', 'Operation canceled by user.', 'Operação cancelada pelo usuário.'],
    ['Saldo insuficiente para completar la operacion.', 'Insufficient balance to complete the operation.', 'Saldo insuficiente para concluir a operação.'],
    ['No disponible', 'Unavailable', 'Indisponível'],
    ['Debes indicar account ID objetivo.', 'You must provide a target account ID.', 'Você deve informar o ID da conta de destino.'],
    ['Debes indicar un monto valido mayor a cero.', 'You must enter a valid amount greater than zero.', 'Você deve informar um valor válido maior que zero.'],
    ['Debes indicar un plazo en meses valido.', 'You must enter a valid term in months.', 'Você deve informar um prazo válido em meses.'],
    ['Debes indicar la fecha de primera cuota.', 'You must enter the first installment date.', 'Você deve informar a data da primeira parcela.'],
    ['desactivado', 'deactivated', 'desativado'],
    ['bloqueado', 'blocked', 'bloqueado'],
    ['activo', 'active', 'ativo'],
    ['Activo', 'Active', 'Ativo'],
    ['Pendiente:', 'Pending:', 'Pendente:'],
    ['Meses:', 'Months:', 'Meses:'],
    ['Sin usuarios', 'No users', 'Nenhum usuário'],
    ['El nombre completo es obligatorio.', 'Full name is required.', 'O nome completo é obrigatório.'],
    ['El nombre debe tener al menos 5 caracteres.', 'Name must be at least 5 characters long.', 'O nome deve ter pelo menos 5 caracteres.'],
    ['Incluye nombre y apellido.', 'Enter both first and last name.', 'Informe o nome e o sobrenome.'],
    ['El correo es obligatorio.', 'Email is required.', 'O e-mail é obrigatório.'],
    ['Ingresa un correo valido.', 'Enter a valid email address.', 'Informe um endereço de e-mail válido.'],
    ['El telefono debe tener entre 8 y 15 digitos.', 'Phone number must contain 8 to 15 digits.', 'O telefone deve ter entre 8 e 15 dígitos.'],
    ['Selecciona un pais.', 'Select a country.', 'Selecione um país.'],
    ['Selecciona un rango de edad.', 'Select an age range.', 'Selecione uma faixa etária.'],
    ['Selecciona tu tipo de cuenta principal.', 'Select your primary account type.', 'Selecione seu tipo de conta principal.'],
    ['Selecciona al menos un producto usado.', 'Select at least one product used.', 'Selecione pelo menos um produto utilizado.'],
    ['Selecciona la frecuencia de uso digital.', 'Select the frequency of digital usage.', 'Selecione a frequência de uso digital.'],
    ['El NPS es obligatorio.', 'NPS is required.', 'O NPS é obrigatório.'],
    ['El NPS debe estar entre 0 y 100.', 'NPS must be between 0 and 100.', 'O NPS deve estar entre 0 e 100.'],
    ['La URL debe iniciar con http:// o https://.', 'URL must start with http:// or https://.', 'A URL deve começar com http:// ou https://.'],
    ['Ingresa una URL valida.', 'Enter a valid URL.', 'Informe uma URL válida.'],
    ['Comparte un comentario para continuar.', 'Add a comment to continue.', 'Adicione um comentário para continuar.'],
    ['El comentario debe tener al menos 10 caracteres.', 'Comment must be at least 10 characters long.', 'O comentário deve ter pelo menos 10 caracteres.'],
    ['Selecciona al menos una operacion frecuente.', 'Select at least one frequent transaction.', 'Selecione pelo menos uma operação frequente.'],
    ['Conservador', 'Conservative', 'Conservador'],
    ['Moderado', 'Moderate', 'Moderado'],
    ['Agresivo', 'Aggressive', 'Agressivo'],
    ['Institucion Financiera', 'Financial Institution', 'Instituição financeira'],
    ['Inicia sesion con numero de cuenta y PIN. Si aun no tienes cuenta, registrate y el sistema mostrara tu account_number para ingresar al panel operativo.', 'Sign in with your account number and PIN. If you do not have an account yet, register to receive the account number used to access the operations dashboard.', 'Entre com o número da conta e o PIN. Se ainda não tiver uma conta, cadastre-se para receber o número usado para acessar o painel operacional.'],
    ['El login usa account_number + PIN.', 'Sign-in uses account_number + PIN.', 'O acesso usa account_number + PIN.'],
    ['Si no tienes cuenta, puedes abrir el formulario de registro.', 'If you do not have an account, you can open the registration form.', 'Se não tiver uma conta, você pode abrir o formulário de cadastro.'],
    ['Tras ingresar, veras tu nombre y account_number en el panel.', 'After signing in, your name and account_number will appear on the dashboard.', 'Após entrar, seu nome e account_number aparecerão no painel.'],
    ['Formulario de encuestas', 'Survey form', 'Formulário de pesquisa'],
    ['Abrir formulario de encuestas', 'Open survey form', 'Abrir formulário de pesquisa'],
    ['Tablas web para pruebas', 'Web tables for testing', 'Tabelas web para testes'],
    ['Static web table', 'Static web table', 'Tabela web estática'],
    ['Tabla estatica de tipos de cuenta y beneficios.', 'Static table of account types and benefits.', 'Tabela estática de tipos de conta e benefícios.'],
    ['Tipo de cuenta', 'Account type', 'Tipo de conta'],
    ['Mantenimiento (Bs)', 'Maintenance (Bs)', 'Manutenção (Bs)'],
    ['Atencion', 'Support', 'Atendimento'],
    ['Basica', 'Basic', 'Básica'],
    ['Nacionales', 'Domestic', 'Nacionais'],
    ['Digital', 'Digital', 'Digital'],
    ['Nacionales + QR', 'Domestic + QR', 'Nacionais + QR'],
    ['Chat', 'Chat', 'Chat'],
    ['Premium', 'Premium', 'Premium'],
    ['Internacionales', 'International', 'Internacionais'],
    ['Prioritaria', 'Priority', 'Prioritário'],
    ['Sponsors', 'Sponsors', 'Patrocinadores'],
    ['sponsor', 'sponsor', 'patrocinador'],
    ['Cotizacion de monedas', 'Currency exchange rates', 'Cotações de moedas'],
    ['Ver tabla de cotizacion de monedas', 'View currency exchange rates', 'Ver tabela de cotações de moedas'],
    ['Cerrar tabla de cotizaciones', 'Close exchange-rate table', 'Fechar tabela de cotações'],
    ['Fuente oficial:', 'Official source:', 'Fonte oficial:'],
    ['Banco Central de Bolivia - Cotizaciones', 'Central Bank of Bolivia - Exchange rates', 'Banco Central da Bolívia - Cotações'],
    ['Actualizacion: datos locales', 'Updated: local data', 'Atualização: dados locais'],
    ['Actualizacion:', 'Updated:', 'Atualização:'],
    ['Actualizacion: datos de respaldo', 'Updated: fallback data', 'Atualização: dados alternativos'],
    ['Actualizacion: no se pudo consultar API, usando tabla local.', 'Update: could not reach the API; using the local table.', 'Atualização: não foi possível consultar a API; usando a tabela local.'],
    ['Cotizacion Oficial del Boliviano respecto al Dolar (BCB)', 'Official Boliviano to US Dollar exchange rate (BCB)', 'Cotação oficial do boliviano em relação ao dólar (BCB)'],
    ['Pais / Concepto', 'Country / Description', 'País / Descrição'],
    ['Pais / Region', 'Country / Region', 'País / Região'],
    ['Moneda', 'Currency', 'Moeda'],
    ['Codigo', 'Code', 'Código'],
    ['Tipo de Cambio Oficial (TCO) (Bs/USD)', 'Official exchange rate (OER) (Bs/USD)', 'Taxa de câmbio oficial (TCO) (Bs/USD)'],
    ['Tipo de Cambio en Bs por unidad de moneda extranjera', 'Exchange rate in Bs per unit of foreign currency', 'Taxa de câmbio em Bs por unidade de moeda estrangeira'],
    ['Tipo Cambio en M.E.', 'Exchange rate in foreign currency', 'Taxa de câmbio em moeda estrangeira'],
    ['Cotizacion de UFV', 'UFV exchange rate', 'Cotação da UFV'],
    ['ESTADOS UNIDOS', 'UNITED STATES', 'ESTADOS UNIDOS'],
    ['DOLAR', 'DOLLAR', 'DÓLAR'],
    ['Bienvenido a AngelFire', 'Welcome to AngelFire', 'Bem-vindo à AngelFire'],
    ['Para acceder al área privada, haz clic en Mostrar credenciales o visita desde la página principal usando el enlace Login.', 'To access the private area, click Show credentials or use the Login link on the home page.', 'Para acessar a área privada, clique em Mostrar credenciais ou use o link Login na página inicial.'],
    ['Mostrar credenciales', 'Show credentials', 'Mostrar credenciais'],
    ['Volver al inicio', 'Back to home', 'Voltar ao início'],
    ['Login', 'Sign in', 'Entrar'],
    ['Numero de cuenta', 'Account number', 'Número da conta'],
    ['Ver PIN', 'Show PIN', 'Mostrar PIN'],
    ['Ingresar', 'Sign in', 'Entrar'],
    ['Ingresar admin', 'Sign in as admin', 'Entrar como admin'],
    ['No tengo cuenta, registrarme', 'I do not have an account, register', 'Não tenho conta, quero me cadastrar'],
    ['Acceso para administradores', 'Administrator access', 'Acesso para administradores'],
    ['Registro', 'Registration', 'Cadastro'],
    ['Pasos del registro', 'Registration steps', 'Etapas do cadastro'],
    ['1. Datos personales', '1. Personal details', '1. Dados pessoais'],
    ['2. Domicilio', '2. Address', '2. Endereço'],
    ['3. Confirmacion', '3. Confirmation', '3. Confirmação'],
    ['Datos personales', 'Personal details', 'Dados pessoais'],
    ['Primer nombre', 'First Name', 'Nome'],
    ['Apellido', 'Last Name', 'Sobrenome'],
    ['PIN (4 digitos)', 'PIN (4 digits)', 'PIN (4 dígitos)'],
    ['Detalles del domicilio', 'Address Details', 'Dados do endereço'],
    ['Ciudad', 'City', 'Cidade'],
    ['Provincia / Estado', 'Province / State', 'Província / Estado'],
    ['Calle', 'Street', 'Rua'],
    ['Numero de calle', 'Street number', 'Número da rua'],
    ['Distrito', 'District', 'Bairro'],
    ['Codigo postal', 'Postal code', 'Código postal'],
    ['Referencia del domicilio', 'Address reference', 'Referência do endereço'],
    ['Confirmacion de datos', 'Confirm your details', 'Confirmação dos dados'],
    ['Revisa la informacion antes de crear tu cuenta.', 'Review your information before creating your account.', 'Revise suas informações antes de criar sua conta.'],
    ['Tu PIN se utilizara para iniciar sesion. No se muestra en este resumen.', 'Your PIN will be used to sign in. It is not shown in this summary.', 'Seu PIN será usado para entrar. Ele não é exibido neste resumo.'],
    ['Confirmacion', 'Confirmation', 'Confirmação'],
    ['Domicilio', 'Address', 'Endereço'],
    ['Editar domicilio', 'Edit address', 'Editar endereço'],
    ['Editar datos personales', 'Edit personal details', 'Editar dados pessoais'],
    ['Confirmar y registrar', 'Confirm and register', 'Confirmar e cadastrar'],
    ['Atras', 'Back', 'Voltar'],
    ['Cuenta creada correctamente', 'Account created successfully', 'Conta criada com sucesso'],
    ['Tu numero de cuenta es', 'Your account number is', 'Seu número de conta é'],
    ['El numero ya esta escrito en el formulario de ingreso.', 'The number is already entered in the sign-in form.', 'O número já está preenchido no formulário de acesso.'],
    ['Continuar al login', 'Continue to sign in', 'Continuar para o login'],
    ['First name', 'First name', 'Nome'],
    ['Last name', 'Last name', 'Sobrenome'],
    ['PIN 4 digitos', '4-digit PIN', 'PIN de 4 dígitos'],
    ['Ocultar PIN', 'Hide PIN', 'Ocultar PIN'],
    ['Registrar', 'Register', 'Cadastrar'],
    ['Status:', 'Status:', 'Status:'],
    ['Listo para autenticar.', 'Ready to authenticate.', 'Pronto para autenticar.'],
    ['AutoPlay page', 'AutoPlay page', 'Página AutoPlay'],
    ['AutoPlay', 'AutoPlay', 'AutoPlay'],
    ['Demo Web Shop', 'Demo Web Shop', 'Demo Web Shop'],
    ['Abrir Web Shop', 'Open Web Shop', 'Abrir Web Shop'],
    ['Ir al Demo Web Shop', 'Go to Demo Web Shop', 'Ir para Demo Web Shop'],
    ['Catalogo de Endpoints API v1', 'API v1 endpoint catalog', 'Catálogo de endpoints da API v1'],
    ['Ruta publica:', 'Public path:', 'Caminho público:'],
    ['Base URL recomendada para pruebas locales:', 'Recommended base URL for local testing:', 'URL base recomendada para testes locais:'],
    ['Buscar por ruta, descripcion o payload...', 'Search by path, description, or payload...', 'Buscar por caminho, descrição ou payload...'],
    ['Todos los metodos', 'All methods', 'Todos os métodos'],
    ['Todo acceso', 'All access', 'Todos os acessos'],
    ['Publico', 'Public', 'Público'],
    ['Publico: sin Authorization', 'Public: no Authorization required', 'Público: sem Authorization'],
    ['Multipart: usar form-data (archivo)', 'Multipart: use form-data (file)', 'Multipart: use form-data (arquivo)'],
    ['Metodo', 'Method', 'Método'],
    ['Ruta', 'Path', 'Caminho'],
    ['Auth', 'Auth', 'Autenticação'],
    ['Descripcion', 'Description', 'Descrição'],
    ['Query / Body minimo', 'Minimum query / body', 'Query / body mínimo'],
    ['Ejemplo rapido', 'Quick example', 'Exemplo rápido'],
    ['Headers base sugeridos', 'Suggested base headers', 'Cabeçalhos básicos sugeridos'],
    ['Notas para Postman/Insomnia', 'Postman/Insomnia notes', 'Notas para Postman/Insomnia'],
    ['Documento generado desde rutas activas del proyecto para pruebas funcionales.', 'Document generated from active project routes for functional testing.', 'Documento gerado a partir das rotas ativas do projeto para testes funcionais.'],
    ['Sin resultados para el filtro actual.', 'No results for the current filter.', 'Nenhum resultado para o filtro atual.'],
    ['Ver ejemplo completo (opcional)', 'View full example (optional)', 'Ver exemplo completo (opcional)'],
    ['REQUEST', 'REQUEST', 'SOLICITAÇÃO'],
    ['BODY EJEMPLO', 'EXAMPLE BODY', 'CORPO DE EXEMPLO'],
    ['RESPUESTA EJEMPLO', 'EXAMPLE RESPONSE', 'RESPOSTA DE EXEMPLO'],
    ['Volver al login', 'Back to sign in', 'Voltar ao login'],
    ['AngelFire Research Lab', 'AngelFire Research Lab', 'Laboratório de pesquisa AngelFire'],
    ['Encuesta de Experiencia Bancaria', 'Banking Experience Survey', 'Pesquisa de experiência bancária'],
    ['Este formulario incluye varios elementos web interactivos para pruebas de automatizacion y UX.', 'This form includes interactive web elements for automation and UX testing.', 'Este formulário inclui elementos web interativos para testes de automação e UX.'],
    ['Abrir Test Automation Practice', 'Open Test Automation Practice', 'Abrir Test Automation Practice'],
    ['Ir a Test Automation Practice', 'Go to Test Automation Practice', 'Ir para Test Automation Practice'],
    ['Perfil del cliente', 'Customer profile', 'Perfil do cliente'],
    ['Nombre completo (text input)', 'Full name (text input)', 'Nome completo (campo de texto)'],
    ['Ej: Ana Lopez', 'E.g. Ana Lopez', 'Ex.: Ana Lopez'],
    ['Telefono', 'Phone', 'Telefone'],
    ['Fecha de nacimiento', 'Date of Birth', 'Data de nascimento'],
    ['Fecha de apertura de cuenta', 'Account opening date', 'Data de abertura da conta'],
    ['País', 'Country', 'País'],
    ['Selecciona una opcion', 'Select an option', 'Selecione uma opção'],
    ['Mexico', 'Mexico', 'México'],
    ['Espana', 'Spain', 'Espanha'],
    ['Rango de edad (dropdown)', 'Age range (dropdown)', 'Faixa etária (lista)'],
    ['Tipo de cuenta principal (dropdown)', 'Primary account type (dropdown)', 'Tipo de conta principal (lista)'],
    ['Cuenta de ahorros', 'Savings account', 'Conta poupança'],
    ['Cuenta corriente', 'Checking account', 'Conta corrente'],
    ['Cuenta digital', 'Digital account', 'Conta digital'],
    ['Cuenta premium', 'Premium account', 'Conta premium'],
    ['Producto principal usado (autocomplete)', 'Main product used (autocomplete)', 'Principal produto utilizado (preenchimento automático)'],
    ['Credito personal', 'Personal loan', 'Crédito pessoal'],
    ['Tarjeta de debito', 'Debit card', 'Cartão de débito'],
    ['Billetera digital', 'Digital wallet', 'Carteira digital'],
    ['Uso de servicios', 'Service usage', 'Uso de serviços'],
    ['Canal preferido (radio button)', 'Preferred channel (radio button)', 'Canal preferido (opção única)'],
    ['App movil', 'Mobile app', 'Aplicativo móvel'],
    ['Web', 'Web', 'Web'],
    ['Agencia fisica', 'Branch', 'Agência física'],
    ['Cajero (ATM)', 'ATM', 'Caixa eletrônico (ATM)'],
    ['Operaciones frecuentes (checkbox)', 'Frequent transactions (checkbox)', 'Operações frequentes (caixa de seleção)'],
    ['Prestamos', 'Loans', 'Empréstimos'],
    ['Productos usados (multi-select dropdown)', 'Products used (multi-select dropdown)', 'Produtos utilizados (lista de seleção múltipla)'],
    ['Tarjeta de credito', 'Credit card', 'Cartão de crédito'],
    ['Credito hipotecario', 'Mortgage', 'Crédito imobiliário'],
    ['Frecuencia de uso de canales digitales (dropdown)', 'Digital channel usage frequency (dropdown)', 'Frequência de uso dos canais digitais (lista)'],
    ['Diario', 'Daily', 'Diariamente'],
    ['semanal', 'weekly', 'semanal'],
    ['Quincenal', 'Biweekly', 'A cada quinze dias'],
    ['mensual', 'monthly', 'mensual'],
    ['Esporadico', 'Occasional', 'Ocasional'],
    ['Seccion de dropdown estatico', 'Static dropdown section', 'Seção de lista estática'],
    ['Country (static dropdown con select)', 'Country (static dropdown)', 'País (lista estática)'],
    ['Seccion de hidden dropdown', 'Hidden dropdown section', 'Seção de lista oculta'],
    ['Este dropdown se carga de forma diferida: sus opciones se crean cuando decides mostrarlo.', 'This dropdown loads on demand: its options are created when you choose to show it.', 'Esta lista é carregada sob demanda: as opções são criadas quando você decide exibi-la.'],
    ['Mostrar hidden dropdown', 'Show hidden dropdown', 'Mostrar lista oculta'],
    ['Ocultar hidden dropdown', 'Hide hidden dropdown', 'Ocultar lista oculta'],
    ['Perfil de riesgo (hidden dropdown)', 'Risk profile (hidden dropdown)', 'Perfil de risco (lista oculta)'],
    ['Nivel de satisfaccion:', 'Satisfaction level:', 'Nível de satisfação:'],
    ['Probabilidad de recomendarnos (%)', 'Likelihood to recommend us (%)', 'Probabilidade de nos recomendar (%)'],
    ['Fecha ideal para contacto', 'Preferred contact date', 'Data ideal para contato'],
    ['Hora ideal para contacto', 'Preferred contact time', 'Horário ideal para contato'],
    ['Color favorito para el dashboard', 'Favorite dashboard color', 'Cor favorita para o painel'],
    ['Subir imagen de perfil (file input)', 'Upload profile image (file input)', 'Enviar imagem de perfil (arquivo)'],
    ['Sitio bancario de referencia (url)', 'Reference banking website (URL)', 'Site bancário de referência (URL)'],
    ['Comentarios (textarea)', 'Comments (text area)', 'Comentários (campo de texto)'],
    ['Comparte tu experiencia', 'Share your experience', 'Compartilhe sua experiência'],
    ['Acepto ser contactado para mejorar servicios', 'I agree to be contacted to improve services', 'Aceito ser contatado para melhorar os serviços'],
    ['Indice de experiencia detectado', 'Detected experience score', 'Índice de experiência detectado'],
    ['Ayuda para completar la encuesta', 'Survey completion help', 'Ajuda para preencher a pesquisa'],
    ['Selecciona al menos un canal, una operacion frecuente y completa los datos requeridos.', 'Select at least one channel, one frequent transaction, and complete the required fields.', 'Selecione pelo menos um canal e uma operação frequente e preencha os campos obrigatórios.'],
    ['Enviar encuesta', 'Submit survey', 'Enviar pesquisa'],
    ['Limpiar formulario', 'Clear form', 'Limpar formulário'],
    ['Salida de la encuesta', 'Survey output', 'Resultado da pesquisa'],
    ['Status: listo para enviar', 'Status: ready to submit', 'Status: pronto para enviar'],
    ['Sin respuestas aun.', 'No responses yet.', 'Nenhuma resposta ainda.'],
    ['Status: formulario reiniciado', 'Status: form reset', 'Status: formulário redefinido'],
    ['Status: corrige los campos en rojo', 'Status: fix the fields marked in red', 'Status: corrija os campos em vermelho'],
    ['El formulario tiene errores de validacion.', 'The form has validation errors.', 'O formulário contém erros de validação.'],
    ['Status: encuesta enviada', 'Status: survey submitted', 'Status: pesquisa enviada'],
    ['Habilitado', 'Enabled', 'Ativado'],
    ['Activo | Pendiente:', 'Active | Pending:', 'Ativo | Pendente:'],
    ['Sin prestamo activo', 'No active loan', 'Nenhum empréstimo ativo'],
    ['Cuota mensual:', 'Monthly installment:', 'Parcela mensal:'],
    ['Plazo:', 'Term:', 'Prazo:'],
    ['meses', 'months', 'meses'],
    ['Sin prestamos', 'No loans', 'Nenhum empréstimo'],
    ['Sin movimientos', 'No transactions', 'Nenhuma movimentação'],
    ['Selecciona una cuenta para ver archivos', 'Select an account to view files', 'Selecione uma conta para ver os arquivos'],
    ['Disponible', 'Available', 'Disponível'],
    ['Para acceder al área privada, haz clic en', 'To access the private area, click', 'Para acessar a área privada, clique em'],
    ['o visita desde la página principal usando el enlace "Login".', 'or use the "Login" link on the home page.', 'ou use o link "Login" na página inicial.'],
    ['Cotizacion de monedas extranjeras', 'Foreign currency exchange rates', 'Cotações de moedas estrangeiras'],
    ['TABLA DE COTIZACIONES DEL 1 DE AGOSTO DE 2026', 'EXCHANGE RATE TABLE FOR AUGUST 1, 2026', 'TABELA DE COTAÇÕES DE 1º DE AGOSTO DE 2026'],
    ['COTIZACION DE MONEDAS', 'CURRENCY EXCHANGE RATES', 'COTAÇÃO DE MOEDAS'],
    ['COREA DEL SUR', 'SOUTH KOREA', 'COREIA DO SUL'],
    ['UNIDAD DE FOMENTO DE VIVIENDA', 'HOUSING DEVELOPMENT UNIT (UFV)', 'UNIDADE DE FOMENTO HABITACIONAL (UFV)'],
    ['Account ID o numero de cuenta *', 'Account ID or account number *', 'ID ou número da conta *'],
    ['con valor', 'with value', 'com o valor'],
    ['Para endpoints de manager usa token de usuario con rol', 'For manager endpoints, use a user token with role', 'Para endpoints de gerente, use um token de usuário com perfil'],
    ['Para subir archivo usa', 'To upload a file, use', 'Para enviar um arquivo, use'],
    ['y campo', 'and the field', 'e o campo'],
    ['Descarga de plan de pagos devuelve CSV en', 'Downloading a payment schedule returns CSV in', 'O download do cronograma retorna CSV em'],
    ['Rol', 'Role', 'Perfil'],
    ['Crear nueva cuenta del usuario', 'Create a new account for the user', 'Criar nova conta do usuário'],
    ['Saldo de cuenta', 'Account balance', 'Saldo da conta'],
    ['Movimientos paginados (filtros)', 'Paginated transactions (filters)', 'Movimentações paginadas (filtros)'],
    ['Crear prestamo (si habilitado)', 'Create loan (if enabled)', 'Criar empréstimo (se habilitado)'],
    ['Crear destinatario', 'Create recipient', 'Criar destinatário'],
    ['Eliminar destinatario', 'Delete recipient', 'Excluir destinatário'],
    ['Buscar destinatarios', 'Search recipients', 'Buscar destinatários'],
    ['Saldo ATM', 'ATM balance', 'Saldo do caixa eletrônico'],
    ['Perfil del usuario', 'User profile', 'Perfil do usuário'],
    ['Crear/actualizar direccion', 'Create/update address', 'Criar/atualizar endereço'],
    ['Eliminar archivo', 'Delete file', 'Excluir arquivo'],
    ['Usuarios paginados', 'Paginated users', 'Usuários paginados'],
    ['Descargar plan de pagos CSV', 'Download payment schedule CSV', 'Baixar cronograma de pagamentos CSV'],
    ['Bitacora de operaciones', 'Operations log', 'Registro de operações'],
    ['Consulta depositos, debitos y pagos por dia, semana o mes desde la fecha indicada.', 'Look up deposits, debits and payments by day, week or month from the given date.', 'Consulte depósitos, débitos e pagamentos por dia, semana ou mês a partir da data indicada.'],
    ['Periodo', 'Period', 'Período'],
    ['Dia', 'Day', 'Dia'],
    ['Semana', 'Week', 'Semana'],
    ['Mes', 'Month', 'Mês'],
    ['Fecha de consulta', 'Query date', 'Data da consulta'],
    ['Tipo de operacion', 'Operation type', 'Tipo de operação'],
    ['Todas', 'All', 'Todas'],
    ['Deposito ATM', 'ATM deposit', 'Depósito em caixa eletrônico'],
    ['Retiro ATM', 'ATM withdrawal', 'Saque em caixa eletrônico'],
    ['Debitos (todas las salidas)', 'Debits (all outgoing)', 'Débitos (todas as saídas)'],
    ['Descargar archivo', 'Download file', 'Baixar arquivo'],
    ['Sin operaciones registradas.', 'No operations recorded.', 'Nenhuma operação registrada.'],
    ['Sin operaciones', 'No operations', 'Nenhuma operação'],
    ['Operaciones:', 'Operations:', 'Operações:'],
    ['Monto total:', 'Total amount:', 'Valor total:'],
    ['Rango:', 'Range:', 'Intervalo:'],
    ['No se pudo descargar la bitacora de operaciones.', 'The operations log could not be downloaded.', 'Não foi possível baixar o registro de operações.'],
    ['Consulta bitacora de operaciones', 'Operations log query', 'Consulta de registro de operações'],
    ['Bitacora de operaciones descargada', 'Operations log downloaded', 'Registro de operações baixado'],
    ['Bitacora de operaciones por dia, semana o mes', 'Operations log by day, week or month', 'Registro de operações por dia, semana ou mês'],
    ['Descargar bitacora de operaciones en CSV', 'Download the operations log as CSV', 'Baixar o registro de operações em CSV'],
    ['Descargar reporte de accesos en CSV', 'Download sign-in report as CSV', 'Baixar relatório de acessos em CSV'],
    ['Reporte de inicios de sesion', 'Login report', 'Relatório de acessos'],
    ['Consulta los accesos exitosos, fallidos o bloqueados por dia, semana o mes.', 'Review successful, failed or blocked sign-ins by day, week or month.', 'Consulte os acessos bem-sucedidos, com falha ou bloqueados por dia, semana ou mês.'],
    ['Resultado', 'Result', 'Resultado'],
    ['Exitoso', 'Successful', 'Bem-sucedido'],
    ['Fallido', 'Failed', 'Com falha'],
    ['Inicios:', 'Sign-ins:', 'Acessos:'],
    ['Exitosos:', 'Successful:', 'Bem-sucedidos:'],
    ['Fallidos:', 'Failed:', 'Com falha:'],
    ['Bloqueados:', 'Blocked:', 'Bloqueados:'],
    ['success', 'Successful', 'Bem-sucedido'],
    ['failure', 'Failed', 'Falha'],
    ['blocked', 'Blocked', 'Bloqueado'],
    ['ID usuario', 'User ID', 'ID do usuário'],
    ['Sin inicios de sesion registrados.', 'No sign-ins recorded.', 'Nenhum acesso registrado.'],
    ['Sin accesos registrados', 'No access events recorded', 'Nenhum acesso registrado'],
    ['No se pudo descargar el reporte de accesos.', 'The sign-in report could not be downloaded.', 'Não foi possível baixar o relatório de acessos.'],
    ['Consulta de accesos', 'Sign-in report query', 'Consulta de acessos'],
    ['La vista admin requiere autenticacion manager.', 'The admin view requires manager authentication.', 'A visão administrativa requer autenticação de gerente.'],
    ['Se bloqueara el usuario indicado. Deseas continuar?', 'The selected user will be blocked. Do you want to continue?', 'O usuário selecionado será bloqueado. Deseja continuar?'],
    ['Bloqueo de usuario por manager', 'User blocked by manager', 'Usuário bloqueado pelo gerente'],
    ['Se desbloqueara el usuario indicado. Deseas continuar?', 'The selected user will be unblocked. Do you want to continue?', 'O usuário selecionado será desbloqueado. Deseja continuar?'],
    ['Desbloqueo de usuario por manager', 'User unblocked by manager', 'Usuário desbloqueado pelo gerente'],
    ['Se desactivara el usuario indicado. Deseas continuar?', 'The selected user will be deactivated. Do you want to continue?', 'O usuário selecionado será desativado. Deseja continuar?'],
    ['Desactivacion de usuario por manager', 'User deactivated by manager', 'Usuário desativado pelo gerente'],
    ['Activacion de usuario por manager', 'User activated by manager', 'Usuário ativado pelo gerente'],
    ['Se eliminara el usuario indicado. Deseas continuar?', 'The selected user will be deleted. Do you want to continue?', 'O usuário selecionado será excluído. Deseja continuar?'],
    ['Eliminacion de usuario por manager', 'User deleted by manager', 'Usuário excluído pelo gerente'],
    ['Accion de usuario no soportada.', 'Unsupported user action.', 'Ação de usuário não suportada.'],
    ['La cuenta no tiene prestamo asignado.', 'The account has no assigned loan.', 'A conta não possui empréstimo associado.'],
    ['Debes consultar cuenta y seleccionar un prestamo.', 'You must look up an account and select a loan.', 'Você deve consultar uma conta e selecionar um empréstimo.'],
    ['No se pudo descargar el plan de pagos.', 'The payment schedule could not be downloaded.', 'Não foi possível baixar o cronograma de pagamentos.'],
    ['Debes iniciar sesion para subir archivos.', 'You must sign in to upload files.', 'Você deve entrar para enviar arquivos.'],
    ['Debes seleccionar un archivo.', 'You must select a file.', 'Você deve selecionar um arquivo.'],
    ['No se pudo subir el archivo', 'The file could not be uploaded', 'Não foi possível enviar o arquivo'],
    ['Consulta de usuarios manager total=', 'Manager users query total=', 'Consulta de usuários do gerente total='],
    ['Consulta reporte de actividad de cuentas (30 dias)', 'Account activity report query (30 days)', 'Consulta de relatório de atividade de contas (30 dias)'],
    ['Previsualizacion exportada en CSV.', 'Preview exported as CSV.', 'Pré-visualização exportada em CSV.'],
    ['Debes ingresar como manager para abrir la vista admin.', 'You must sign in as manager to open the admin view.', 'Você deve entrar como gerente para abrir a visão administrativa.'],
    ['Se aplicara un deposito. Deseas continuar?', 'A deposit will be applied. Do you want to continue?', 'Um depósito será aplicado. Deseja continuar?'],
    ['Se aplicara un retiro. Deseas continuar?', 'A withdrawal will be applied. Do you want to continue?', 'Um saque será aplicado. Deseja continuar?'],
    ['Se aplicara el pago del servicio. Deseas continuar?', 'The bill payment will be applied. Do you want to continue?', 'O pagamento do serviço será aplicado. Deseja continuar?'],
    ['Se subira el archivo seleccionado. Deseas continuar?', 'The selected file will be uploaded. Do you want to continue?', 'O arquivo selecionado será enviado. Deseja continuar?'],
    ['No hay prestamo activo para calcular cuotas.', 'There is no active loan to calculate installments.', 'Não há empréstimo ativo para calcular parcelas.'],
    ['No hay prestamo activo para pagar.', 'There is no active loan to pay.', 'Não há empréstimo ativo para pagar.'],
    ['Se aplicara el pago del prestamo. Deseas continuar?', 'The loan payment will be applied. Do you want to continue?', 'O pagamento do empréstimo será aplicado. Deseja continuar?'],
    ['Debes iniciar sesion para actualizar tus datos.', 'You must sign in to update your details.', 'Você deve entrar para atualizar seus dados.'],
    ['Se actualizaran tus datos de perfil. Deseas continuar?', 'Your profile details will be updated. Do you want to continue?', 'Seus dados de perfil serão atualizados. Deseja continuar?'],
    ['Debes iniciar sesion para cambiar PIN.', 'You must sign in to change the PIN.', 'Você deve entrar para alterar o PIN.'],
    ['Se actualizara tu PIN. Deseas continuar?', 'Your PIN will be updated. Do you want to continue?', 'Seu PIN será atualizado. Deseja continuar?'],
    ['Se creara un nuevo usuario. Deseas continuar?', 'A new user will be created. Do you want to continue?', 'Um novo usuário será criado. Deseja continuar?'],
    ['Creacion de usuario por manager', 'User created by manager', 'Usuário criado pelo gerente'],
    ['Debes indicar un account ID o numero de cuenta valido.', 'You must provide a valid account ID or account number.', 'Você deve informar um ID ou número de conta válido.'],
    ['Debes indicar account ID o numero de cuenta.', 'You must provide an account ID or account number.', 'Você deve informar um ID ou número de conta.'],
    ['Consulta de cuenta admin lookup=', 'Admin account lookup=', 'Consulta de conta administrativa lookup='],
    ['Plan de pagos descargado correctamente.', 'Payment schedule downloaded successfully.', 'Cronograma de pagamentos baixado com sucesso.'],
    ['Previsualizacion de prestamo manager', 'Manager loan preview', 'Pré-visualização de empréstimo do gerente'],
    ['Se creara el prestamo para la cuenta indicada. Deseas continuar?', 'The loan will be created for the specified account. Do you want to continue?', 'O empréstimo será criado para a conta indicada. Deseja continuar?'],
    ['Creacion de prestamo por gerente', 'Loan created by manager', 'Empréstimo criado pelo gerente'],
    ['Se depositara saldo en la cuenta objetivo. Deseas continuar?', 'Funds will be deposited into the target account. Do you want to continue?', 'Saldo será depositado na conta de destino. Deseja continuar?'],
    ['Deposito por gerente sobre', 'Deposit by manager on', 'Depósito pelo gerente em'],
    ['Se retirara saldo de la cuenta objetivo. Deseas continuar?', 'Funds will be withdrawn from the target account. Do you want to continue?', 'Saldo será retirado da conta de destino. Deseja continuar?'],
    ['Retiro por gerente sobre', 'Withdrawal by manager on', 'Saque pelo gerente em'],
    ['Se aplicara el pago del prestamo objetivo. Deseas continuar?', 'The target loan payment will be applied. Do you want to continue?', 'O pagamento do empréstimo de destino será aplicado. Deseja continuar?'],
    ['Debes indicar loan_id para pago de prestamo.', 'You must provide a loan_id for the loan payment.', 'Você deve informar um loan_id para o pagamento do empréstimo.'],
    ['Pago de prestamo por gerente', 'Loan payment by manager', 'Pagamento de empréstimo pelo gerente'],
    ['Listo para iniciar sesion y operar.', 'Ready to sign in and start operating.', 'Pronto para entrar e operar.'],
    ['datos de respaldo', 'fallback data', 'dados alternativos'],
    ['sin fecha', 'no date', 'sem data'],
    ['Este usuario no tiene rol manager/admin.', 'This user does not have the manager/admin role.', 'Este usuário não tem o perfil manager/admin.'],
    ['Usuario registrado correctamente. Usa este account_number para hacer login.', 'User registered successfully. Use this account_number to sign in.', 'Usuário cadastrado com sucesso. Use este account_number para entrar.'],
    ['Operaciones de personal autorizado', 'Authorized staff operations', 'Operações da equipe autorizada'],
    ['Ingresa la cuenta destino para transferir saldo.', 'Enter the destination account to transfer funds.', 'Informe a conta de destino para transferir saldo.'],
    ['Cuenta destino', 'Destination account', 'Conta de destino'],
    ['Numero de cuenta o account ID', 'Account number or account ID', 'Número de conta ou account ID'],
    ['Transferir', 'Transfer funds', 'Transferir'],
    ['Servicio (solo para pagar servicio)', 'Service (bill payment only)', 'Serviço (apenas para pagamento de serviço)'],
    ['Pagar servicio', 'Pay bill', 'Pagar serviço'],
    ['No hay cuenta de origen disponible.', 'No source account is available.', 'Não há conta de origem disponível.'],
    ['Debes indicar la cuenta destino.', 'You must provide the destination account.', 'Você deve informar a conta de destino.'],
    ['No puedes transferir a tu propia cuenta.', 'You cannot transfer to your own account.', 'Você não pode transferir para sua própria conta.'],
    ['Se transferira', 'Transfer of', 'Será transferido'],
    ['a la cuenta', 'to account', 'para a conta'],
    ['Transferencia aplicada a la cuenta', 'Transfer applied to account', 'Transferência aplicada à conta'],
    ['No se pudo completar la transferencia.', 'The transfer could not be completed.', 'Não foi possível concluir a transferência.'],
    ['Se aplicara el pago del servicio en la cuenta objetivo. Deseas continuar?', 'The bill payment will be applied to the target account. Do you want to continue?', 'O pagamento do serviço será aplicado na conta de destino. Deseja continuar?'],
    ['Pago de servicio por ', 'Bill payment by ', 'Pagamento de serviço por '],
    ['Debes seleccionar un servicio.', 'You must select a service.', 'Você deve selecionar um serviço.'],
    ['La vista de operaciones requiere un rol Admin, Manager o Cashier.', 'The operations view requires an Admin, Manager, or Cashier role.', 'A visão de operações requer um perfil Admin, Manager ou Cashier.'],
    ['La gestion de usuarios esta restringida al rol Admin.', 'User management is restricted to the Admin role.', 'A gestão de usuários é restrita ao perfil Admin.'],
    ['La creacion de usuarios esta restringida al rol Admin.', 'User creation is restricted to the Admin role.', 'A criação de usuários é restrita ao perfil Admin.'],
    ['Las transferencias estan disponibles para el rol customer.', 'Transfers are available for the customer role.', 'As transferências estão disponíveis para o perfil customer.'],
    ['Tu rol no tiene permitida esa operacion.', 'Your role is not allowed to perform that operation.', 'Seu perfil não tem permissão para essa operação.'],
    ['Operacion restringida a personal autorizado.', 'Operation restricted to authorized staff.', 'Operação restrita à equipe autorizada.'],
    ['Este usuario no tiene rol Admin o Manager.', 'This user does not have the Admin or Manager role.', 'Este usuário não tem o perfil Admin ou Manager.']
  ];

  const phraseMaps = Object.fromEntries(languages.map((language) => [language, new Map()]));
  phrases.forEach((phrase) => {
    languages.forEach((sourceLanguage, sourceIndex) => {
      languages.forEach((targetLanguage, targetIndex) => {
        phraseMaps[targetLanguage].set(phrase[sourceIndex], phrase[targetIndex]);
      });
    });
  });

  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let currentLanguage = 'es';

  // Longest-first, word-boundary aware matching so phrases translate wherever they
  // appear inside a string (including composite messages built with interpolations)
  // without matching inside unrelated words such as "Ver" -> "Verificar".
  const patterns = Object.fromEntries(
    languages.map((language) => {
      const keys = [...phraseMaps[language].keys()]
        .filter((key) => key.trim().length > 1)
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp);
      return [language, new RegExp(`(?<![\\p{L}\\p{N}])(?:${keys.join('|')})(?![\\p{L}\\p{N}])`, 'gu')];
    })
  );

  function translateValue(value) {
    if (!value || !/\p{L}/u.test(value)) {
      return value;
    }

    const normalized = normalize(value);
    const exact = phraseMaps[currentLanguage].get(normalized);
    if (exact) {
      return exact;
    }

    const translated = normalized.replace(
      patterns[currentLanguage],
      (match) => phraseMaps[currentLanguage].get(match) ?? match
    );
    if (translated === normalized) {
      return value;
    }

    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    return `${leading}${translated}${trailing}`;
  }

  // Raw payload blocks and elements opted out of translation are skipped entirely.
  const SKIP_SELECTOR = 'script, style, [data-i18n-skip]';
  // These keep their attributes translated (for example a textarea placeholder)
  // but their contents are left untouched: pre/code hold raw payloads and
  // textarea holds what the user typed.
  const SKIP_CONTENT = 'pre, code, textarea';
  const ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'];

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const current = node.nodeValue;
      const translated = translateValue(current);
      if (translated === current) {
        return;
      }

      const leading = current.match(/^\s*/)?.[0] || '';
      const trailing = current.match(/\s*$/)?.[0] || '';
      const next = `${leading}${translated.trim()}${trailing}`;

      // Comparing the composed value is essential: assigning the very same
      // string to nodeValue still emits a characterData record, which would make
      // the MutationObserver re-translate this node forever and freeze the page.
      if (next !== current) {
        node.nodeValue = next;
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (node.matches(SKIP_SELECTOR)) {
      return;
    }

    ATTRIBUTES.forEach((attribute) => {
      if (!node.hasAttribute(attribute)) {
        return;
      }
      const value = node.getAttribute(attribute);
      const translated = translateValue(value);
      if (translated !== value) {
        node.setAttribute(attribute, translated);
      }
    });

    // Only form controls explicitly marked as translatable have their value
    // rewritten, so option values such as "semanal" are never corrupted.
    if (node.matches('input[data-i18n-value]')) {
      const value = node.getAttribute('value');
      const translated = translateValue(value);
      if (translated !== value) {
        node.setAttribute('value', translated);
      }
    }

    if (node.matches(SKIP_CONTENT)) {
      return;
    }

    node.childNodes.forEach(translateNode);
  }

  function setLanguage(language) {
    currentLanguage = languages.includes(language) ? language : 'es';
    try {
      localStorage.setItem(storageKey, currentLanguage);
    } catch (_error) {
      // The language still works for the current page when storage is unavailable.
    }

    document.documentElement.lang = currentLanguage;
    document.title = translateValue(document.title);
    translateNode(document.body);
    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = currentLanguage;
    });
    window.dispatchEvent(new CustomEvent('angelfire:languagechange', { detail: { language: currentLanguage } }));
  }

  function createLanguageSelect(container) {
    if (!container || container.querySelector('[data-language-select]')) {
      return;
    }

    const label = document.createElement('label');
    label.className = 'language-control';
    label.innerHTML = '<span class="language-control-label">Idioma</span><select data-language-select aria-label="Idioma" data-i18n-skip><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></select>';
    container.append(label);
  }

  const style = document.createElement('style');
  style.textContent = '.language-control{display:inline-flex;align-items:center;gap:.45rem;margin:0;color:inherit;font:inherit}.language-control-label{font-size:.78rem;font-weight:700}.language-control select{min-width:8.3rem;padding:.45rem .6rem;border:1px solid currentColor;border-radius:6px;background:#fff;color:#172b36;font:inherit}.site-nav .language-control{margin-left:.5rem}.topbar .language-control{align-self:flex-end}.hero .language-control{margin-top:.8rem}@media(max-width:640px){.language-control-label{display:none}.site-nav .language-control{margin-left:0}.language-control select{min-width:7.5rem}}';
  document.head.append(style);

  if (!document.querySelector('[data-language-select]')) {
    createLanguageSelect(document.querySelector('.site-nav .nav-actions'));
    createLanguageSelect(document.querySelector('.topbar'));
    createLanguageSelect(document.querySelector('.hero'));
    if (!document.querySelector('[data-language-select]')) {
      const fallback = document.createElement('div');
      fallback.className = 'language-fallback';
      fallback.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:10000';
      document.body.prepend(fallback);
      createLanguageSelect(fallback);
    }
  }

  document.querySelectorAll('[data-language-select]').forEach((select) => {
    select.addEventListener('change', () => setLanguage(select.value));
  });

  let observerPasses = 0;
  let lastPassAt = 0;
  const observer = new MutationObserver((records) => {
    // Safety valve: a rapid burst of callbacks means re-translation is feeding
    // back on itself, so the observer turns itself off instead of freezing the page.
    const now = Date.now();
    if (now - lastPassAt > 200) {
      observerPasses = 0;
    }
    lastPassAt = now;
    observerPasses += 1;
    if (observerPasses > 2000) {
      observer.disconnect();
      return;
    }

    records.forEach((record) => {
      if (record.type === 'characterData') {
        translateNode(record.target);
      } else {
        record.addedNodes.forEach(translateNode);
      }
    });
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });

  let storedLanguage = 'es';
  try {
    storedLanguage = localStorage.getItem(storageKey) || 'es';
  } catch (_error) {
    storedLanguage = 'es';
  }
  setLanguage(storedLanguage);

  window.AngelFireI18n = {
    // Build marker: if this is undefined in the console, the page is running a
    // cached copy of this script and translations will not match the current code.
    build: '20261002-1',
    storageKey,
    get language() {
      return currentLanguage;
    },
    localeTag() {
      return { es: 'es-BO', en: 'en-US', pt: 'pt-BR' }[currentLanguage];
    },
    setLanguage
  };
})();