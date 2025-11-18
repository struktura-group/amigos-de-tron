// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * @title AmigosDeTron - Versión Final Optimizada (v4.0)
 * @dev Contrato con Matriz 1x2, Reinversión de Bots, Quema Directa y
 * Lógica de Distribución de Dividendos O(1) (Pool Global).
 */
contract AmigosDeTronFinal {
    
    // ============================================
    // CONSTANTES
    // ============================================
    
    // ... (CONSTANTES DE PLANES Y DISTRIBUCIÓN EXISTENTES) ...
    
    // Precios de planes (en SUN - 1 TRX = 1,000,000 SUN)
    uint256 public constant PLAN_BASIC = 35_000_000;       // 35 TRX
    uint256 public constant PLAN_MASTER = 100_000_000;    // 100 TRX
    uint256 public constant PLAN_PREMIUM = 250_000_000;   // 250 TRX
    
    // Costo de Activación/Reposicionamiento de cuenta de sistema (Bot)
    uint256 public constant SYSTEM_ACCOUNT_COST = 25_000_000; // 25 TRX

    // Distribución por ciclo (USER CYCLE)
    uint256 public constant CYCLE_POOL = 50_000_000;              // 50 TRX total
    uint256 public constant CYCLE_USER_PAYMENT = 10_000_000;      // 10 TRX
    uint256 public constant CYCLE_SPONSOR_BONUS = 2_500_000;      // 2.5 TRX
    uint256 public constant CYCLE_REINVESTMENT = 5_000_000;       // 5 TRX
    uint256 public constant CYCLE_BURN = 5_500_000;               // 5.5 TRX
    uint256 public constant CYCLE_GAS_RESERVE = 2_000_000;        // 2 TRX
    uint256 public constant CYCLE_REPOSITION = 25_000_000;        // 25 TRX
    
    // Distribución por ciclo (SYSTEM BOT CYCLE)
    uint256 public constant SYSTEM_GAS_SHARE = 25_000_000;        // 25 TRX para Reserva/Quema
    uint256 public constant SYSTEM_NEW_ACCOUNT_SHARE = 25_000_000; // 25 TRX para Reinversión de Bot
    
    // Monto de Dividendo que añade el BOT por ciclo al pool
    uint256 public constant BOT_DIVIDEND_CONTRIBUTION = 10_000_000; // 10 TRX al pool de dividendos
    
    // Renovación
    uint256 public constant BASIC_RENEWAL_CYCLES = 5;
    uint256 public constant PREMIUM_RENEWAL_CYCLES = 10;
    
    // Otros
    uint256 public constant PRE_LAUNCH_DURATION = 90 days;
    uint256 public constant REINVESTMENT_THRESHOLD = 25_000_000; // 25 TRX
    uint256 public constant MAX_GAS_RESERVE = 2_000_000_000;      // Límite de 2000 TRX para la Reserva de Gas
    uint256 public constant MIN_DIVIDEND_POOL_SUN = 1000_000_000; // 1000 TRX para poder reclamar
    
    // Dirección de quema (TRON dead address)
    address public constant BURN_ADDRESS = address(0x000000000000000000000000000000000000dEaD);
    
    // ============================================
    // VARIABLES DE ESTADO
    // ============================================
    
    address public owner;
    address public serviceCompanyAddress;
    
    uint256 public totalUsers;
    uint256 public totalBurned;
    uint256 public nextReferralCode = 100000;
    
    uint256 public basicPlanCount;
    uint256 public masterPlanCount;
    uint256 public premiumPlanCount;
    
    // Índice de la cola de matriz (usado para optimizar la búsqueda)
    uint256 public matrixQueueIndex;
    uint256 public matrixPositionCounter;
    
    // 💰 VARIABLES DE DIVIDENDOS O(1) 💰
    uint256 public accumulatedDividendPool; // Pool global de dividendos (actúa como factor)
    uint256 public totalQualifiedUsers;     // Número total de usuarios calificados (Master/Premium)

    // Protección contra reentrancia
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    
    // ============================================
    // ESTRUCTURAS
    // ============================================
    
    struct User {
        address userAddress;
        address sponsor;
        uint256 referralCode;
        uint256 registrationTime;
        bool isActive;
        uint256 totalEarned;
        uint256 totalReferrals;
        
        MatrixPosition matrixPosition;
        
        bool basicActive;
        bool masterActive;
        bool premiumActive;
        
        uint256 basicCycles;
        uint256 masterCycles;
        uint256 premiumCycles;
        
        bool preLaunchActive;
        uint256 preLaunchEndTime;

        // Nuevos campos para la lógica de dividendos O(1)
        bool isQualifiedForDividends; 
        uint256 claimedDividendFactor; // El valor del pool en el último reclamo/calificación
    }
    
    struct MatrixPosition {
        uint256 positionId;
        address upline;
        address[] children;
        uint256 cycles;
        bool isActive;
    }
    
    struct ReinvestmentFund {
        uint256 balance;         // Acumulación para nuevas cuentas Bot
        uint256 gasReserve;      // Reserva de Gas (Limitada a MAX_GAS_RESERVE)
        uint256 accountsCreated;
        uint256 totalReinvested;
        uint256 renewalFees;
    }
    
    // ============================================
    // MAPPINGS Y ARRAYS
    // ============================================
    
    mapping(address => User) public users;
    mapping(uint256 => address) public referralCodeToAddress;
    mapping(address => bool) public isSystemAccount;
    
    // OPTIMIZACIÓN: Acceso directo a referidos (O(1))
    mapping(address => address[]) public referrals;
    
    address[] public matrixQueue;
    
    ReinvestmentFund public reinvestmentFund;
    
    // ============================================
    // EVENTOS
    // ============================================
    
    event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode);
    event PlanActivated(address indexed user, uint256 planCost, string planName);
    event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 positionId);
    event MatrixCycleCompleted(address indexed user, uint256 cycleNumber, uint256 earnings);
    event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType);
    event ReinvestmentAccountCreated(address indexed account, uint256 cost);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event ServiceAddressUpdated(address indexed oldAddress, address indexed newAddress);
    event PlanRenewed(address indexed user, string planName, uint256 renewalFee);
    event TRXReceived(address indexed from, uint256 amount);
    event SystemCycleDistribution(address indexed user, uint256 toGasReserve, uint256 toNewAccountFund, uint256 burnedAmount, uint256 toDividendPool);
    
    // 💰 NUEVOS EVENTOS DE DIVIDENDOS 💰
    event DividendsClaimed(address indexed user, uint256 amount);
    event UserQualified(address indexed user);
    
    // ============================================
    // MODIFICADORES
    // ============================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar");
        _;
    }
    
    /**
     * @dev Previene ataques de reentrancia
     */
    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrancia detectada");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Requiere que el caller esté registrado.
     */
    modifier onlyRegistered() {
        require(users[msg.sender].isActive, "Usuario no registrado");
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor(address _serviceCompanyAddress) {
        require(_serviceCompanyAddress != address(0), "Direccion de servicio invalida");
        
        owner = msg.sender;
        serviceCompanyAddress = _serviceCompanyAddress;
        _status = _NOT_ENTERED;
        
        // Crear primer usuario (owner)
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].sponsor = address(0);
        users[msg.sender].referralCode = 100000;
        users[msg.sender].isActive = true;
        users[msg.sender].registrationTime = block.timestamp;
        
        referralCodeToAddress[100000] = msg.sender;
        nextReferralCode = 100001;
        totalUsers = 1;
        
        emit UserRegistered(msg.sender, address(0), 100000);
    }
    
    // ============================================
    // FUNCIÓN RECEIVE - CAPTURA TRX DIRECTOS
    // ============================================
    
    receive() external payable {
        require(msg.value > 0, "Debe enviar TRX");
        
        reinvestmentFund.balance += msg.value;
        emit TRXReceived(msg.sender, msg.value);
        
        _checkReinvestmentThreshold();
    }
    
    // ============================================
    // FUNCIONES DE ADMINISTRACIÓN
    // ============================================
    
    // ... (FUNCIONES DE ADMINISTRACIÓN EXISTENTES: updateServiceAddress, withdrawRenewalFees, withdrawGasReserve, transferOwnership) ...
    
    function updateServiceAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Direccion invalida");
        require(_newAddress != serviceCompanyAddress, "Misma direccion");
        
        address oldAddress = serviceCompanyAddress;
        serviceCompanyAddress = _newAddress;
        
        emit ServiceAddressUpdated(oldAddress, _newAddress);
    }
    
    function withdrawRenewalFees(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Monto debe ser mayor a 0");
        require(_amount <= reinvestmentFund.renewalFees, "Fondos insuficientes");
        
        reinvestmentFund.renewalFees -= _amount;
        
        _safeTransfer(owner, _amount);
    }
    
    function withdrawGasReserve(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Monto debe ser mayor a 0");
        require(_amount <= reinvestmentFund.gasReserve, "Fondos insuficientes");
        
        reinvestmentFund.gasReserve -= _amount;
        
        _safeTransfer(owner, _amount);
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Nuevo owner invalido");
        require(_newOwner != owner, "Mismo owner");
        
        owner = _newOwner;
    }
    
    // ============================================
    // FUNCIONES PÚBLICAS - REGISTRO Y PLANES
    // ============================================
    
    // ... (FUNCIÓN REGISTER EXISTENTE) ...
    
    function register(uint256 _sponsorCode) external {
        require(!users[msg.sender].isActive, "Usuario ya registrado");
        require(_sponsorCode >= 100000, "Codigo de sponsor invalido");
        
        address sponsor = referralCodeToAddress[_sponsorCode];
        require(sponsor != address(0), "Sponsor no existe");
        require(sponsor != msg.sender, "No puedes ser tu propio sponsor");
        
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].sponsor = sponsor;
        users[msg.sender].referralCode = nextReferralCode;
        users[msg.sender].isActive = true;
        users[msg.sender].registrationTime = block.timestamp;
        users[msg.sender].preLaunchActive = true;
        users[msg.sender].preLaunchEndTime = block.timestamp + PRE_LAUNCH_DURATION;
        
        referralCodeToAddress[nextReferralCode] = msg.sender;
        nextReferralCode++;
        
        users[sponsor].totalReferrals++;
        referrals[sponsor].push(msg.sender);
        
        totalUsers++;
        
        emit UserRegistered(msg.sender, sponsor, users[msg.sender].referralCode);
    }
    
    function activateBasicPlan() external payable onlyRegistered nonReentrant {
        require(msg.value == PLAN_BASIC, "Monto incorrecto - debe ser 35 TRX");
        require(!users[msg.sender].basicActive, "Plan Basico ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 10 TRX al sponsor
        if (sponsor != address(0)) {
            _safeTransfer(sponsor, 10_000_000);
            users[sponsor].totalEarned += 10_000_000;
            emit CommissionPaid(msg.sender, sponsor, 10_000_000, "sponsor_basic");
        }
        
        // 25 TRX quedan en el contrato para la matriz
        _assignToMatrix(msg.sender);
        
        users[msg.sender].basicActive = true;
        basicPlanCount++;
        
        emit PlanActivated(msg.sender, PLAN_BASIC, "Basic");
    }
    
    function activateMasterPlan() external payable onlyRegistered nonReentrant {
        require(msg.value == PLAN_MASTER, "Monto incorrecto - debe ser 100 TRX");
        require(!users[msg.sender].masterActive, "Plan Master ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 25 TRX al sponsor
        if (sponsor != address(0)) {
            _safeTransfer(sponsor, 25_000_000);
            users[sponsor].totalEarned += 25_000_000;
            emit CommissionPaid(msg.sender, sponsor, 25_000_000, "sponsor_master");
        }
        
        // 25 TRX a empresa
        _safeTransfer(serviceCompanyAddress, 25_000_000);
        
        // 25 TRX a reinversión
        reinvestmentFund.balance += 25_000_000;
        
        // 25 TRX a matriz
        _assignToMatrix(msg.sender);
        
        users[msg.sender].masterActive = true;
        masterPlanCount++;
        
        // ⭐ Lógica de Calificación para Dividendos (Master/Premium) ⭐
        _checkAndQualifyForDividends(msg.sender);

        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_MASTER, "Master");
    }
    
    function activatePremiumPlan() external payable onlyRegistered nonReentrant {
        require(msg.value == PLAN_PREMIUM, "Monto incorrecto - debe ser 250 TRX");
        require(!users[msg.sender].premiumActive, "Plan Premium ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 100 TRX al sponsor
        if (sponsor != address(0)) {
            _safeTransfer(sponsor, 100_000_000);
            users[sponsor].totalEarned += 100_000_000;
            emit CommissionPaid(msg.sender, sponsor, 100_000_000, "sponsor_premium");
        }
        
        // 75 TRX a empresa
        _safeTransfer(serviceCompanyAddress, 75_000_000);
        
        // 50 TRX a reinversión
        reinvestmentFund.balance += 50_000_000;
        
        // 25 TRX a matriz
        _assignToMatrix(msg.sender);
        
        users[msg.sender].premiumActive = true;
        premiumPlanCount++;
        
        // ⭐ Lógica de Calificación para Dividendos (Master/Premium) ⭐
        _checkAndQualifyForDividends(msg.sender);

        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_PREMIUM, "Premium");
    }

    // ============================================
    // FUNCIONES DE DIVIDENDOS O(1)
    // ============================================

    /**
     * @dev Lógica de calificación (Master/Premium) para el pool de dividendos.
     * Si califica por primera vez, el 'claimedDividendFactor' se establece en el 'accumulatedDividendPool' actual.
     */
    function _checkAndQualifyForDividends(address _user) private {
        User storage user = users[_user];
        
        // Solo se califica una vez
        if (!user.isQualifiedForDividends) {
            user.isQualifiedForDividends = true;
            
            // CLAVE O(1): El factor de reclamo inicial es el pool actual.
            // Esto significa que el usuario SOLO acumulará dividendos a partir de este momento.
            user.claimedDividendFactor = accumulatedDividendPool; 
            
            totalQualifiedUsers++; 
            emit UserQualified(_user);
        }
    }

    /**
     * @dev Calcula los dividendos pendientes del usuario (O(1)).
     */
    function getPendingDividends(address _user) public view returns (uint256 pending) {
        User memory user = users[_user];
        
        if (!user.isQualifiedForDividends || totalQualifiedUsers == 0) {
            return 0;
        }
        
        // Diferencia entre el pool total actual y lo último que el usuario ha reclamado/calificado.
        uint256 dividendFactorDifference = accumulatedDividendPool - user.claimedDividendFactor;

        // La porción pendiente es la diferencia dividida equitativamente entre los usuarios calificados.
        pending = dividendFactorDifference / totalQualifiedUsers;
    }

    /**
     * @dev Permite al usuario reclamar sus dividendos pendientes (O(1)).
     */
    function claimDividends() external onlyRegistered nonReentrant {
        User storage user = users[msg.sender];
        
        uint256 pendingDividends = getPendingDividends(msg.sender);

        require(pendingDividends > 0, "No hay dividendos pendientes para reclamar");
        require(user.isQualifiedForDividends, "El usuario no esta calificado para dividendos");
        require(accumulatedDividendPool >= MIN_DIVIDEND_POOL_SUN, "El pool debe ser >= 1000 TRX para reclamar");
        
        // 1. Actualizar el factor de reclamo al pool actual ANTES de la transferencia.
        user.claimedDividendFactor = accumulatedDividendPool; 

        // 2. Enviar los fondos
        _safeTransfer(msg.sender, pendingDividends);

        // 3. Registrar evento
        user.totalEarned += pendingDividends; // Sumar a las ganancias totales
        emit DividendsClaimed(msg.sender, pendingDividends);
    }
    
    // ============================================
    // FUNCIONES INTERNAS - MATRIZ
    // ============================================
    
    // ... (FUNCIONES DE MATRIZ EXISTENTES: _assignToMatrix, _findNextAvailablePosition, _processCycle) ...
    
    function _assignToMatrix(address _user) private {
        if (users[_user].matrixPosition.isActive) {
            return;
        }
        
        address upline = _findNextAvailablePosition();
        uint256 positionId = matrixPositionCounter++;
        
        users[_user].matrixPosition.positionId = positionId;
        users[_user].matrixPosition.upline = upline;
        users[_user].matrixPosition.isActive = true;
        matrixQueue.push(_user);
        
        if (upline != address(0)) {
            users[upline].matrixPosition.children.push(_user);
            
            // Si el upline llena su matriz 1x2, procesar ciclo
            if (users[upline].matrixPosition.children.length == 2) {
                _processCycle(upline);
            }
        }
        
        emit MatrixPositionAssigned(_user, upline, positionId);
    }
    
    /**
     * @dev Encuentra la siguiente posición disponible usando un índice de optimización (matrixQueueIndex).
     * Asegura la actualización de 'matrixQueueIndex' en AMBOS loops.
     */
    function _findNextAvailablePosition() private returns (address) {
        if (matrixQueue.length == 0) {
            return address(0);
        }
        
        uint256 start = matrixQueueIndex;
        uint256 len = matrixQueue.length;
        
        // 1. Buscar desde el índice actual hasta el final
        for (uint256 i = start; i < len; i++) {
            address candidate = matrixQueue[i];
            if (users[candidate].matrixPosition.children.length < 2) {
                matrixQueueIndex = i; // Actualización 1
                return candidate;
            }
        }
        
        // 2. Wrap search desde el inicio hasta el índice actual 
        for (uint256 i = 0; i < start; i++) {
            address candidate = matrixQueue[i];
            if (users[candidate].matrixPosition.children.length < 2) {
                matrixQueueIndex = i; // Actualización 2 (FIX CRÍTICO)
                return candidate;
            }
        }
        
        return address(0);
    }
    
    /**
     * @dev Procesa un ciclo completo. Lógica diferente si es cuenta de sistema.
     */
    function _processCycle(address _user) private nonReentrant {
        
        // Lógica especial para cuentas de sistema (Bots)
        if (isSystemAccount[_user]) {
            _processSystemCycle(_user);
            return;
        }
        
        // Lógica para usuarios normales (Humanos)
        users[_user].matrixPosition.cycles++;
        uint256 currentCycle = users[_user].matrixPosition.cycles;
        
        address sponsor = users[_user].sponsor;
        bool isRenewalCycle = false;
        string memory renewalPlan = "";
        
        // Lógica de Renovación
        if (users[_user].basicActive && currentCycle % BASIC_RENEWAL_CYCLES == 0) {
            isRenewalCycle = true;
            renewalPlan = "Basic";
            users[_user].basicCycles++;
        } else if ((users[_user].masterActive || users[_user].premiumActive) && 
                      currentCycle % PREMIUM_RENEWAL_CYCLES == 0) {
            isRenewalCycle = true;
            renewalPlan = users[_user].masterActive ? "Master" : "Premium";
            if (users[_user].masterActive) {
                users[_user].masterCycles++;
            } else {
                users[_user].premiumCycles++;
            }
        }
        
        // 1. Pagar 10 TRX al usuario (excepto en renovación)
        if (isRenewalCycle) {
            reinvestmentFund.renewalFees += CYCLE_USER_PAYMENT;
            emit PlanRenewed(_user, renewalPlan, CYCLE_USER_PAYMENT);
        } else {
            _safeTransfer(_user, CYCLE_USER_PAYMENT);
            users[_user].totalEarned += CYCLE_USER_PAYMENT;
        }
        
        // 2. Pagar 2.5 TRX al sponsor (si es un humano)
        if (sponsor != address(0)) {
            _safeTransfer(sponsor, CYCLE_SPONSOR_BONUS);
            users[sponsor].totalEarned += CYCLE_SPONSOR_BONUS;
            emit CommissionPaid(_user, sponsor, CYCLE_SPONSOR_BONUS, "cycle_sponsor_bonus");
        } else {
            // Si el sponsor es address(0) (Owner/Genesis), va a reinversión
            reinvestmentFund.balance += CYCLE_SPONSOR_BONUS;
        }
        
        // 3. Agregar 5 TRX a reinversión
        reinvestmentFund.balance += CYCLE_REINVESTMENT;
        
        // 4. Quemar 5.5 TRX
        _safeTransfer(BURN_ADDRESS, CYCLE_BURN);
        totalBurned += CYCLE_BURN;
        emit TRXBurned(CYCLE_BURN, totalBurned);
        
        // 5. Agregar 2 TRX a reserva de gas y chequear límite
        reinvestmentFund.gasReserve += CYCLE_GAS_RESERVE;
        _checkGasReserveLimit(); 
        
        // 6. Reposicionar
        delete users[_user].matrixPosition.children;
        users[_user].matrixPosition.isActive = false;
        _assignToMatrix(_user);
        
        _checkReinvestmentThreshold();
    }
    
    /**
     * @dev Lógica de ciclo de matriz para cuentas de sistema (Bot). 
     * Implementa la lógica de QUEMA DIRECTA y DISTRIBUCIÓN O(1).
     */
    function _processSystemCycle(address _user) private {
        // La cuenta de Bot cicla.
        users[_user].matrixPosition.cycles++;
        
        uint256 gasShare = SYSTEM_GAS_SHARE; // 25 TRX
        uint256 newAccountShare = SYSTEM_NEW_ACCOUNT_SHARE; // 25 TRX
        uint256 dividendContribution = BOT_DIVIDEND_CONTRIBUTION; // 10 TRX
        uint256 burnedAmount = 0;
        
        // 1. Lógica de Recarga/Quema de Gas Reserve (25 TRX Share)
        if (reinvestmentFund.gasReserve >= MAX_GAS_RESERVE) {
            // Quema Directa
            _safeTransfer(BURN_ADDRESS, gasShare);
            totalBurned += gasShare;
            burnedAmount = gasShare;
            emit TRXBurned(gasShare, totalBurned);
        } else {
            // Recarga Automática
            reinvestmentFund.gasReserve += gasShare;
            burnedAmount = _checkGasReserveLimit(); // Quema el exceso si supera los 2000 TRX
        }
        
        // 2. 25 TRX (SYSTEM_NEW_ACCOUNT_SHARE) van al fondo de Reinversión de Bots
        reinvestmentFund.balance += newAccountShare;
        
        // 3. ⭐ DISTRIBUCIÓN DE DIVIDENDOS O(1) (10 TRX) ⭐
        if (totalQualifiedUsers > 0) {
            // Añadir los 10 TRX al pool. Esto es O(1)
            accumulatedDividendPool += dividendContribution;
        }

        // 4. Reposicionar la cuenta de sistema
        delete users[_user].matrixPosition.children;
        users[_user].matrixPosition.isActive = false;
        _assignToMatrix(_user);
        
        // 5. Emitir el evento de ciclo del sistema con el monto quemado y el aporte al pool
        emit SystemCycleDistribution(_user, gasShare, newAccountShare, burnedAmount, dividendContribution);
        
        _checkReinvestmentThreshold();
    }
    
    /**
     * @dev Verifica si la reserva de gas excedió MAX_GAS_RESERVE (2000 TRX) y QUEMA el excedente.
     */
    function _checkGasReserveLimit() private returns (uint256 amountBurned) {
        if (reinvestmentFund.gasReserve > MAX_GAS_RESERVE) {
            amountBurned = reinvestmentFund.gasReserve - MAX_GAS_RESERVE;
            reinvestmentFund.gasReserve = MAX_GAS_RESERVE;
            
            // 🔥 Envía el excedente a la dirección de quema
            _safeTransfer(BURN_ADDRESS, amountBurned);
            totalBurned += amountBurned;
            
            emit TRXBurned(amountBurned, totalBurned);
        }
        return amountBurned;
    }

    /**
     * @dev Verifica si hay fondos suficientes para crear cuentas
     */
    function _checkReinvestmentThreshold() private {
        // Usamos SYSTEM_ACCOUNT_COST (25 TRX) para crear cuentas de sistema.
        while (reinvestmentFund.balance >= REINVESTMENT_THRESHOLD && reinvestmentFund.balance >= SYSTEM_ACCOUNT_COST) {
            _createReinvestmentAccount();
        }
    }
    
    /**
     * @dev Crea cuenta desde fondo de reinversión (25 TRX)
     */
    function _createReinvestmentAccount() private {
        // Asegura que tengamos los 25 TRX necesarios
        uint256 cost = SYSTEM_ACCOUNT_COST;
        require(reinvestmentFund.balance >= cost, "Fondos insuficientes para Bot");
        
        // Generación de dirección pseudo-aleatoria (Identidad Virtual de Bot)
        address newAccount = address(uint160(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            reinvestmentFund.accountsCreated,
            msg.sender
        )))));
        
        isSystemAccount[newAccount] = true;
        
        users[newAccount].userAddress = newAccount;
        users[newAccount].sponsor = address(this);
        users[newAccount].referralCode = nextReferralCode;
        users[newAccount].isActive = true;
        users[newAccount].registrationTime = block.timestamp;
        
        referralCodeToAddress[nextReferralCode] = newAccount;
        nextReferralCode++;
        totalUsers++;
        
        // Gasto de 25 TRX y actualización de estadísticas
        reinvestmentFund.balance -= cost;
        reinvestmentFund.totalReinvested += cost;
        reinvestmentFund.accountsCreated++;
        
        _assignToMatrix(newAccount);
        users[newAccount].basicActive = true; 
        basicPlanCount++;
        
        emit ReinvestmentAccountCreated(newAccount, cost);
    }
    
    /**
     * @dev Transferencia segura usando call
     */
    function _safeTransfer(address _to, uint256 _amount) private {
        require(_to != address(0), "Direccion invalida");
        require(_amount > 0, "Monto debe ser mayor a 0");
        
        // En Solidity 0.8+, call es la forma recomendada, especialmente en TVM/TRON
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transferencia fallida");
    }
    
    // ============================================
    // FUNCIONES DE CONSULTA
    // ============================================
    
    // ... (FUNCIONES DE CONSULTA EXISTENTES: getUserInfo, getUserMatrixInfo, getUserRenewalInfo, getGlobalStats, getUserReferralsPaginated, getContractBalance) ...

    // NOTA: Se ha actualizado getUserInfo para devolver los nuevos campos de dividendos.

    function getUserInfo(address _user) external view returns (
        address userAddress,
        address sponsor,
        uint256 referralCode,
        uint256 registrationTime,
        bool isActive,
        uint256 totalEarned,
        uint256 totalReferrals,
        bool basicActive,
        bool masterActive,
        bool premiumActive,
        bool preLaunchActive,
        uint256 preLaunchEndTime,
        bool isQualifiedForDividends, // AÑADIDO
        uint256 pendingDividends      // AÑADIDO (Calculado)
    ) {
        User memory user = users[_user];
        return (
            user.userAddress,
            user.sponsor,
            user.referralCode,
            user.registrationTime,
            user.isActive,
            user.totalEarned,
            user.totalReferrals,
            user.basicActive,
            user.masterActive,
            user.premiumActive,
            user.preLaunchActive,
            user.preLaunchEndTime,
            user.isQualifiedForDividends,
            getPendingDividends(_user)
        );
    }
    
    function getUserMatrixInfo(address _user) external view returns (
        uint256 positionId,
        address upline,
        address[] memory children,
        uint256 cycles,
        bool isActive
    ) {
        MatrixPosition memory matrix = users[_user].matrixPosition;
        return (
            matrix.positionId,
            matrix.upline,
            matrix.children,
            matrix.cycles,
            matrix.isActive
        );
    }
    
    function getUserRenewalInfo(address _user) external view returns (
        uint256 basicCycles,
        uint256 masterCycles,
        uint256 premiumCycles,
        uint256 nextBasicRenewal,
        uint256 nextPremiumRenewal
    ) {
        User memory user = users[_user];
        uint256 currentCycle = user.matrixPosition.cycles;
        
        uint256 nextBasic = 0;
        uint256 nextPremium = 0;
        
        if (user.basicActive) {
            nextBasic = BASIC_RENEWAL_CYCLES - (currentCycle % BASIC_RENEWAL_CYCLES);
            if (nextBasic == BASIC_RENEWAL_CYCLES) nextBasic = 0;
        }
        
        if (user.masterActive || user.premiumActive) {
            nextPremium = PREMIUM_RENEWAL_CYCLES - (currentCycle % PREMIUM_RENEWAL_CYCLES);
            if (nextPremium == PREMIUM_RENEWAL_CYCLES) nextPremium = 0;
        }
        
        return (
            user.basicCycles,
            user.masterCycles,
            user.premiumCycles,
            nextBasic,
            nextPremium
        );
    }
    
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalBurned,
        uint256 _reinvestmentBalance,
        uint256 _gasReserve,
        uint256 _renewalFees,
        uint256 _accountsCreated,
        uint256 _basicCount,
        uint256 _masterCount,
        uint256 _premiumCount,
        uint256 _matrixPositions,
        uint256 _dividendPool,       // AÑADIDO
        uint256 _totalQualifiedUsers // AÑADIDO
    ) {
        return (
            totalUsers,
            totalBurned,
            reinvestmentFund.balance,
            reinvestmentFund.gasReserve,
            reinvestmentFund.renewalFees,
            reinvestmentFund.accountsCreated,
            basicPlanCount,
            masterPlanCount,
            premiumPlanCount,
            matrixPositionCounter,
            accumulatedDividendPool,
            totalQualifiedUsers
        );
    }
    
    function getUserReferralsPaginated(
        address _user,
        uint256 _offset,
        uint256 _limit
    ) external view returns (
        address[] memory referralList,
        uint256 total,
        bool hasMore
    ) {
        address[] memory userReferrals = referrals[_user];
        uint256 totalRefs = userReferrals.length;
        
        if (_offset >= totalRefs) {
            return (new address[](0), totalRefs, false);
        }
        
        uint256 remaining = totalRefs - _offset;
        uint256 size = remaining < _limit ? remaining : _limit;
        
        address[] memory result = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            result[i] = userReferrals[_offset + i];
        }
        
        return (result, totalRefs, _offset + size < totalRefs);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}