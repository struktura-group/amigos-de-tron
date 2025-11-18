// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * @title AmigosDeTron - Optimizado para TRON Network
 * @dev Smart contract optimizado con todas las correcciones de seguridad
 * 
 * CARACTERÍSTICAS:
 * - Sistema de matriz 1x2 única alimentada por 3 planes
 * - Renovación automática (Básico: cada 5 ciclos, Master/Premium: cada 10 ciclos)
 * - Distribución exacta de fondos por ciclo
 * - Funciones de administración seguras
 * - Optimizado para TRON Network
 * 
 * DISTRIBUCIÓN POR CICLO (50 TRX):
 * - 10 TRX al usuario (excepto en renovación)
 * - 2.5 TRX al sponsor
 * - 5 TRX a reinversión
 * - 5.5 TRX quemados
 * - 2 TRX reserva de gas
 * - 25 TRX reposicionamiento
 */
contract AmigosDeTronOptimized {
    
    // ============================================
    // CONSTANTES
    // ============================================
    
    // Precios de planes (en SUN - 1 TRX = 1,000,000 SUN)
    uint256 public constant PLAN_BASIC = 35_000_000;      // 35 TRX
    uint256 public constant PLAN_MASTER = 100_000_000;    // 100 TRX
    uint256 public constant PLAN_PREMIUM = 250_000_000;   // 250 TRX
    
    // Distribución por ciclo
    uint256 public constant CYCLE_POOL = 50_000_000;           // 50 TRX total
    uint256 public constant CYCLE_USER_PAYMENT = 10_000_000;   // 10 TRX
    uint256 public constant CYCLE_SPONSOR_BONUS = 2_500_000;   // 2.5 TRX
    uint256 public constant CYCLE_REINVESTMENT = 5_000_000;    // 5 TRX
    uint256 public constant CYCLE_BURN = 5_500_000;            // 5.5 TRX
    uint256 public constant CYCLE_GAS_RESERVE = 2_000_000;     // 2 TRX
    uint256 public constant CYCLE_REPOSITION = 25_000_000;     // 25 TRX
    
    // Renovación
    uint256 public constant RENEWAL_FEE = 10_000_000;          // 10 TRX
    uint256 public constant BASIC_RENEWAL_CYCLES = 5;
    uint256 public constant PREMIUM_RENEWAL_CYCLES = 10;
    
    // Otros
    uint256 public constant PRE_LAUNCH_DURATION = 90 days;
    uint256 public constant REINVESTMENT_THRESHOLD = 25_000_000; // 25 TRX
    
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
    
    uint256 public matrixQueueIndex;
    uint256 public matrixPositionCounter;
    
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
    }
    
    struct MatrixPosition {
        uint256 positionId;
        address upline;
        address[] children;
        uint256 cycles;
        bool isActive;
    }
    
    struct ReinvestmentFund {
        uint256 balance;
        uint256 gasReserve;
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
    event ReinvestmentAccountCreated(address indexed account);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event PreLaunchActivated(address indexed user, uint256 endTime);
    event ServiceAddressUpdated(address indexed oldAddress, address indexed newAddress);
    event PlanRenewed(address indexed user, string planName, uint256 renewalFee);
    event CycleDistribution(
        address indexed user,
        uint256 userPayment,
        uint256 sponsorBonus,
        uint256 reinvestment,
        uint256 burned,
        uint256 gasReserve
    );
    event FundsWithdrawn(address indexed to, uint256 amount, string fundType);
    
    // ============================================
    // MODIFICADORES
    // ============================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar");
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor(address _serviceCompanyAddress) {
        require(_serviceCompanyAddress != address(0), "Direccion de servicio invalida");
        
        owner = msg.sender;
        serviceCompanyAddress = _serviceCompanyAddress;
        
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
    // FUNCIONES DE ADMINISTRACIÓN
    // ============================================
    
    /**
     * @dev Actualiza la dirección de la empresa de servicios
     */
    function updateServiceAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Direccion invalida");
        require(_newAddress != serviceCompanyAddress, "Misma direccion");
        
        address oldAddress = serviceCompanyAddress;
        serviceCompanyAddress = _newAddress;
        
        emit ServiceAddressUpdated(oldAddress, _newAddress);
    }
    
    /**
     * @dev Retira fondos de renovación acumulados
     */
    function withdrawRenewalFees(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Monto debe ser mayor a 0");
        require(_amount <= reinvestmentFund.renewalFees, "Fondos insuficientes");
        
        reinvestmentFund.renewalFees -= _amount;
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Transferencia fallida");
        
        emit FundsWithdrawn(owner, _amount, "renewal_fees");
    }
    
    /**
     * @dev Retira fondos de la reserva de gas
     */
    function withdrawGasReserve(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Monto debe ser mayor a 0");
        require(_amount <= reinvestmentFund.gasReserve, "Fondos insuficientes");
        
        reinvestmentFund.gasReserve -= _amount;
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Transferencia fallida");
        
        emit FundsWithdrawn(owner, _amount, "gas_reserve");
    }
    
    /**
     * @dev Transferencia de ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Nuevo owner invalido");
        require(_newOwner != owner, "Mismo owner");
        
        owner = _newOwner;
    }
    
    // ============================================
    // FUNCIONES PÚBLICAS - REGISTRO Y PLANES
    // ============================================
    
    /**
     * @dev Registra un nuevo usuario
     */
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
        totalUsers++;
        
        emit UserRegistered(msg.sender, sponsor, users[msg.sender].referralCode);
        emit PreLaunchActivated(msg.sender, users[msg.sender].preLaunchEndTime);
    }
    
    /**
     * @dev Activa Plan Básico (35 TRX)
     */
    function activateBasicPlan() external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
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
    
    /**
     * @dev Activa Plan Master (100 TRX)
     */
    function activateMasterPlan() external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
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
        
        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_MASTER, "Master");
    }
    
    /**
     * @dev Activa Plan Premium (250 TRX)
     */
    function activatePremiumPlan() external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
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
        
        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_PREMIUM, "Premium");
    }
    
    // ============================================
    // FUNCIONES INTERNAS - MATRIZ
    // ============================================
    
    /**
     * @dev Asigna usuario a la matriz global
     */
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
            
            if (users[upline].matrixPosition.children.length == 2) {
                _processCycle(upline);
            }
        }
        
        emit MatrixPositionAssigned(_user, upline, positionId);
    }
    
    /**
     * @dev Encuentra la siguiente posición disponible
     */
    function _findNextAvailablePosition() private view returns (address) {
        if (matrixQueue.length == 0) {
            return address(0);
        }
        
        for (uint256 i = matrixQueueIndex; i < matrixQueue.length; i++) {
            address candidate = matrixQueue[i];
            if (users[candidate].matrixPosition.children.length < 2) {
                return candidate;
            }
        }
        
        return address(0);
    }
    
    /**
     * @dev Procesa un ciclo completo con distribución exacta
     */
    function _processCycle(address _user) private {
        users[_user].matrixPosition.cycles++;
        uint256 currentCycle = users[_user].matrixPosition.cycles;
        
        address sponsor = users[_user].sponsor;
        bool isRenewalCycle = false;
        string memory renewalPlan = "";
        
        // Determinar si es ciclo de renovación
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
        
        // 2. Pagar 2.5 TRX al sponsor
        if (sponsor != address(0) && !isSystemAccount[_user]) {
            _safeTransfer(sponsor, CYCLE_SPONSOR_BONUS);
            users[sponsor].totalEarned += CYCLE_SPONSOR_BONUS;
            emit CommissionPaid(_user, sponsor, CYCLE_SPONSOR_BONUS, "cycle_sponsor_bonus");
        } else {
            reinvestmentFund.balance += CYCLE_SPONSOR_BONUS;
        }
        
        // 3. Agregar 5 TRX a reinversión
        reinvestmentFund.balance += CYCLE_REINVESTMENT;
        
        // 4. Quemar 5.5 TRX
        _safeTransfer(BURN_ADDRESS, CYCLE_BURN);
        totalBurned += CYCLE_BURN;
        emit TRXBurned(CYCLE_BURN, totalBurned);
        
        // 5. Agregar 2 TRX a reserva de gas
        reinvestmentFund.gasReserve += CYCLE_GAS_RESERVE;
        
        emit CycleDistribution(
            _user,
            isRenewalCycle ? 0 : CYCLE_USER_PAYMENT,
            CYCLE_SPONSOR_BONUS,
            CYCLE_REINVESTMENT,
            CYCLE_BURN,
            CYCLE_GAS_RESERVE
        );
        
        emit MatrixCycleCompleted(_user, currentCycle, isRenewalCycle ? 0 : CYCLE_USER_PAYMENT);
        
        // 6. Reposicionar (25 TRX ya están en el contrato)
        delete users[_user].matrixPosition.children;
        users[_user].matrixPosition.isActive = false;
        _assignToMatrix(_user);
        
        _checkReinvestmentThreshold();
    }
    
    /**
     * @dev Verifica si hay fondos suficientes para crear cuentas
     */
    function _checkReinvestmentThreshold() private {
        while (reinvestmentFund.balance >= REINVESTMENT_THRESHOLD) {
            _createReinvestmentAccount();
        }
    }
    
    /**
     * @dev Crea cuenta desde fondo de reinversión
     */
    function _createReinvestmentAccount() private {
        if (reinvestmentFund.balance < PLAN_BASIC) {
            return;
        }
        
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
        
        reinvestmentFund.balance -= PLAN_BASIC;
        reinvestmentFund.totalReinvested += PLAN_BASIC;
        reinvestmentFund.accountsCreated++;
        
        _assignToMatrix(newAccount);
        users[newAccount].basicActive = true;
        basicPlanCount++;
        
        emit ReinvestmentAccountCreated(newAccount);
    }
    
    /**
     * @dev Transferencia segura usando call
     */
    function _safeTransfer(address _to, uint256 _amount) private {
        require(_to != address(0), "Direccion invalida");
        require(_amount > 0, "Monto debe ser mayor a 0");
        
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transferencia fallida");
    }
    
    // ============================================
    // FUNCIONES DE CONSULTA
    // ============================================
    
    /**
     * @dev Obtiene información del usuario
     */
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
        uint256 preLaunchEndTime
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
            user.preLaunchEndTime
        );
    }
    
    /**
     * @dev Obtiene información de matriz del usuario
     */
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
    
    /**
     * @dev Obtiene información de renovación del usuario
     */
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
    
    /**
     * @dev Obtiene estadísticas globales
     */
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
        uint256 _matrixPositions
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
            matrixPositionCounter
        );
    }
    
    /**
     * @dev Obtiene lista de referidos con paginación
     * @param _user Dirección del usuario
     * @param _offset Índice de inicio
     * @param _limit Cantidad máxima de resultados
     */
    function getUserReferralsPaginated(
        address _user,
        uint256 _offset,
        uint256 _limit
    ) external view returns (
        address[] memory referrals,
        uint256 total,
        bool hasMore
    ) {
        uint256 totalRefs = users[_user].totalReferrals;
        
        if (_offset >= totalRefs) {
            return (new address[](0), totalRefs, false);
        }
        
        uint256 remaining = totalRefs - _offset;
        uint256 size = remaining < _limit ? remaining : _limit;
        
        address[] memory result = new address[](size);
        uint256 found = 0;
        uint256 scanned = 0;
        
        for (uint256 i = 100001; i < nextReferralCode && found < size; i++) {
            address refAddress = referralCodeToAddress[i];
            if (users[refAddress].sponsor == _user) {
                if (scanned >= _offset) {
                    result[found] = refAddress;
                    found++;
                }
                scanned++;
            }
        }
        
        return (result, totalRefs, _offset + size < totalRefs);
    }
    
    /**
     * @dev Función de quema directa de TRX
     */
    function burnTRX() external payable {
        require(msg.value > 0, "Debe enviar TRX para quemar");
        
        _safeTransfer(BURN_ADDRESS, msg.value);
        totalBurned += msg.value;
        
        emit TRXBurned(msg.value, totalBurned);
    }
    
    /**
     * @dev Obtiene el balance del contrato
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}