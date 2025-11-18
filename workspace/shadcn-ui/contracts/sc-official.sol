// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * @title AmigosDeTronFinal - Versión con Upgrade de Planes (V9.1)
 * @dev Contrato con lógica de pago diferencial para upgrades de planes.
 * El usuario paga la diferencia entre planes y se ajustan las comisiones.
 * Se asegura que solo haya una posición en la matriz por wallet.
 */
contract AmigosDeTronFinal {
    
    // ============================================
    // CONSTANTES
    // ============================================
    
    // Costos de Planes (en SUN, donde 1 TRX = 1,000,000 SUN)
    uint256 public constant PLAN_BASIC = 35_000_000;      // 35 TRX
    uint256 public constant PLAN_MASTER = 100_000_000;    // 100 TRX
    uint256 public constant PLAN_PREMIUM = 250_000_000;   // 250 TRX
    
    // Comisiones por Plan (en SUN)
    uint256 public constant MASTER_COMMISSION = 25_000_000;  // 25 TRX para Master
    uint256 public constant PREMIUM_COMMISSION = 75_000_000; // 75 TRX para Premium

    uint256 public constant SYSTEM_ACCOUNT_COST = 25_000_000; 

    // Distribución por ciclo (USER CYCLE - 50 TRX)
    uint256 public constant CYCLE_POOL = 50_000_000;               
    uint256 public constant CYCLE_USER_PAYMENT = 10_000_000;       
    uint256 public constant CYCLE_SPONSOR_BONUS = 2_500_000;       
    uint256 public constant CYCLE_REINVESTMENT = 5_000_000;        
    uint256 public constant CYCLE_BURN = 5_500_000;                
    uint256 public constant CYCLE_GAS_RESERVE = 2_000_000;         
    uint256 public constant CYCLE_REPOSITION = 25_000_000;         
    
    // Distribución por ciclo (SYSTEM BOT CYCLE - 50 TRX)
    uint256 public constant SYSTEM_GAS_SHARE = 25_000_000;         
    uint256 public constant SYSTEM_NEW_ACCOUNT_SHARE = 25_000_000; 
    uint256 public constant BOT_DIVIDEND_CONTRIBUTION = 10_000_000; 
    
    // Otros límites
    uint256 public constant PRE_LAUNCH_DURATION = 90 days;
    uint256 public constant REINVESTMENT_THRESHOLD = 25_000_000;   
    uint256 public constant MAX_GAS_RESERVE = 2_000_000_000;       
    uint256 public constant MIN_DIVIDEND_POOL_SUN = 1000_000_000;  
    
    // Direcciones especiales
    address public constant BURN_ADDRESS = address(0x000000000000000000000000000000000000dEaD);
    address public constant COMPANY_FUND_ADDRESS = address(0x42f275e7293b5444e2624388e364861F3472C619);
    
    // Tipos de Plan para la función `activatePlan`
    enum PlanType { NONE, BASIC, MASTER, PREMIUM }
    
    // ============================================
    // VARIABLES DE ESTADO
    // ============================================
    
    address public owner; 
    uint256 public totalUsers;
    uint256 public totalBurned;
    uint256 public nextReferralCode = 100000;
    uint256 public basicPlanCount;
    uint256 public masterPlanCount;
    uint256 public premiumPlanCount;
    uint256 public matrixQueueIndex;
    uint256 public matrixPositionCounter;
    uint256 public accumulatedDividendPool; 
    uint256 public totalQualifiedUsers;      

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

        bool isQualifiedForDividends; 
        uint256 claimedDividendFactor; 
        uint256 commissionPaid; // ⭐ NUEVO: Comisión pagada a la empresa para upgrades
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
    }
    
    // ============================================
    // MAPPINGS Y ARRAYS
    // ============================================
    
    mapping(address => User) public users;
    mapping(uint256 => address) public referralCodeToAddress;
    mapping(address => bool) public isSystemAccount; 
    
    mapping(address => address[]) public referrals;
    
    address[] public matrixQueue;
    
    ReinvestmentFund public reinvestmentFund;
    
    // ============================================
    // EVENTOS
    // ============================================
    
    event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode);
    event PlanActivated(address indexed user, uint256 planCost, string planName);
    event PlanUpgraded(address indexed user, uint256 oldCost, uint256 newCost, uint256 differencePaid, string planName); // ⭐ NUEVO EVENTO
    event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 positionId);
    event MatrixCycleCompleted(address indexed user, uint256 cycleNumber, uint256 earnings);
    event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType);
    event ReinvestmentAccountCreated(address indexed account, uint256 cost);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event PlanRenewed(address indexed user, string planName, uint256 renewalFee);
    event TRXReceived(address indexed from, uint256 amount);
    event SystemCycleDistribution(address indexed user, uint256 gasAdded, uint256 reinvestmentAdded, uint256 burnedAmount, uint256 toDividendPool);
    event DividendsClaimed(address indexed user, uint256 amount);
    event UserQualified(address indexed user);
    
    // ============================================
    // MODIFICADORES
    // ============================================
    
    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrancia detectada");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyRegistered() {
        require(users[msg.sender].isActive, "Usuario no registrado");
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor() {
        owner = msg.sender;
        _status = _NOT_ENTERED;
        
        // Crear primer usuario (owner)
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].sponsor = address(0);
        users[msg.sender].referralCode = 100000;
        users[msg.sender].isActive = true;
        users[msg.sender].registrationTime = block.timestamp;
        users[msg.sender].preLaunchActive = true;
        users[msg.sender].preLaunchEndTime = block.timestamp + PRE_LAUNCH_DURATION;
        
        referralCodeToAddress[100000] = msg.sender;
        nextReferralCode = 100001;
        totalUsers = 1;
        
        // El contrato actúa como su propia cuenta de sistema (Bot)
        isSystemAccount[address(this)] = true;
        users[address(this)].isActive = true;
        
        emit UserRegistered(msg.sender, address(0), 100000);
    }
    
    // ============================================
    // FUNCIONES HELPER INTERNAS
    // ============================================
    
    function _safeTransfer(address _to, uint256 _amount) internal {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer failed");
    }
    
    function _checkGasReserveLimit() internal returns (uint256 burnedAmount) {
        if (reinvestmentFund.gasReserve > MAX_GAS_RESERVE) {
            burnedAmount = reinvestmentFund.gasReserve - MAX_GAS_RESERVE;
            reinvestmentFund.gasReserve = MAX_GAS_RESERVE;
            
            _safeTransfer(BURN_ADDRESS, burnedAmount);
            totalBurned += burnedAmount;
            emit TRXBurned(burnedAmount, totalBurned);
        }
    }
    
    function _checkReinvestmentThreshold() internal {
        address systemAccount = address(this);
        
        while (reinvestmentFund.balance >= SYSTEM_ACCOUNT_COST) {
            reinvestmentFund.balance -= SYSTEM_ACCOUNT_COST;
            
            // Asigna la nueva posición al Bot
            _assignMatrixPosition(systemAccount);
            
            reinvestmentFund.accountsCreated++;
            reinvestmentFund.totalReinvested += SYSTEM_ACCOUNT_COST;
            
            emit ReinvestmentAccountCreated(systemAccount, SYSTEM_ACCOUNT_COST);
        }
    }

    function _checkDividendQualification(address _user) internal {
        User storage user = users[_user];
        
        if (user.isQualifiedForDividends) return;

        // Se verifica la validez del pre-launch basado en el tiempo
        user.preLaunchActive = block.timestamp <= user.preLaunchEndTime;
        
        bool isPreLaunchActive = user.preLaunchActive; 
        
        bool qualifiedByPlan = user.masterActive || user.premiumActive;
        bool qualifiedByReferrals = user.totalReferrals >= 3;

        if (isPreLaunchActive && (qualifiedByPlan || qualifiedByReferrals)) {
            
            user.isQualifiedForDividends = true;
            totalQualifiedUsers++;
            
            user.preLaunchActive = false; 
            
            emit UserQualified(_user);
        }
    }
    
    // ⭐ FUNCIONES HELPER PARA UPGRADE
    
    function _getPlanCostAndCommission(PlanType _planType) internal pure returns (uint256 planCost, uint256 commission) {
        if (_planType == PlanType.BASIC) {
            return (PLAN_BASIC, 0);
        } else if (_planType == PlanType.MASTER) {
            return (PLAN_MASTER, MASTER_COMMISSION);
        } else if (_planType == PlanType.PREMIUM) {
            return (PLAN_PREMIUM, PREMIUM_COMMISSION);
        } else {
            revert("Tipo de plan invalido");
        }
    }

    function _getCurrentPlanInfo(User memory user) internal view returns (PlanType currentType, uint256 currentCost, uint256 currentCommission) {
        if (user.premiumActive) {
            return (PlanType.PREMIUM, PLAN_PREMIUM, PREMIUM_COMMISSION);
        } else if (user.masterActive) {
            return (PlanType.MASTER, PLAN_MASTER, MASTER_COMMISSION);
        } else if (user.basicActive) {
            return (PlanType.BASIC, PLAN_BASIC, 0);
        } else {
            return (PlanType.NONE, 0, 0);
        }
    }

    // ============================================
    // FUNCIÓN RECEIVE
    // ============================================
    
    receive() external payable {
        require(msg.value > 0, "Debe enviar TRX");
        
        reinvestmentFund.balance += msg.value;
        emit TRXReceived(msg.sender, msg.value);
        
        _checkReinvestmentThreshold();
    }
    
    // ============================================
    // FUNCIONES PÚBLICAS - REGISTRO Y PLANES
    // ============================================
    
    function register(uint256 _sponsorCode) public { 
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
        
        _checkDividendQualification(sponsor); 

        totalUsers++;
        
        emit UserRegistered(msg.sender, sponsor, users[msg.sender].referralCode);
    }
    
    // ⭐ NUEVA FUNCIÓN CONSOLIDADA PARA ACTIVACIÓN Y UPGRADE
    function activatePlan(uint256 _referralCode, PlanType _planType) external payable nonReentrant {
        require(_planType != PlanType.NONE, "Debe seleccionar un plan valido");
        
        User storage user = users[msg.sender];
        
        (PlanType currentType, uint256 currentCost, uint256 currentCommission) = _getCurrentPlanInfo(user);
        (uint256 targetCost, uint256 targetCommission) = _getPlanCostAndCommission(_planType);
        
        // 1. Verificar si es UPGRADE o ACTIVACIÓN INICIAL
        if (currentType != PlanType.NONE) {
            // Es un upgrade: debe ser a un plan de mayor costo
            require(targetCost > currentCost, "El nuevo plan no es un upgrade o ya esta activo");
        }
        // Si no está activo (currentType == NONE), es una activación inicial.
        
        // 2. Calcular el pago requerido (solo la diferencia)
        uint256 requiredPayment = targetCost - currentCost;
        require(msg.value == requiredPayment, "Monto incorrecto. Debe pagar la diferencia.");
        
        // 3. Registrar usuario (solo si no está activo)
        if (!user.isActive) {
            // Se registra y se le asigna la primera posición de matriz
            register(_referralCode);
            _assignMatrixPosition(msg.sender);
        }
        
        // 4. Procesar Comisión (solo la diferencia de comisión)
        uint256 commissionDue = targetCommission > currentCommission ? targetCommission - currentCommission : 0;
        
        if (commissionDue > 0) {
            _safeTransfer(COMPANY_FUND_ADDRESS, commissionDue); 
            user.commissionPaid += commissionDue;
            emit CommissionPaid(msg.sender, COMPANY_FUND_ADDRESS, commissionDue, "Plan/Upgrade Commission");
        }
        
        // 5. Actualizar el estado de los planes
        user.basicActive = (_planType == PlanType.BASIC);
        user.masterActive = (_planType == PlanType.MASTER || _planType == PlanType.PREMIUM);
        user.premiumActive = (_planType == PlanType.PREMIUM);
        
        // 6. Actualizar contadores globales y calificación
        if (_planType == PlanType.BASIC) basicPlanCount++;
        if (currentType == PlanType.NONE && _planType == PlanType.MASTER) masterPlanCount++;
        if (currentType == PlanType.MASTER && _planType == PlanType.PREMIUM) { premiumPlanCount++; masterPlanCount--; }
        else if (currentType == PlanType.NONE && _planType == PlanType.PREMIUM) premiumPlanCount++;
        
        _checkDividendQualification(msg.sender); 

        if (currentType == PlanType.NONE) {
            emit PlanActivated(msg.sender, targetCost, _planType == PlanType.BASIC ? "Basic" : _planType == PlanType.MASTER ? "Master" : "Premium");
        } else {
            emit PlanUpgraded(msg.sender, currentCost, targetCost, requiredPayment, _planType == PlanType.MASTER ? "Master" : "Premium");
        }
        
        // El resto del pago (la mayor parte, targetCost - targetCommission) va al fondo de reinversión
        uint256 contributionToReinvestment = requiredPayment - commissionDue;
        reinvestmentFund.balance += contributionToReinvestment;
        _checkReinvestmentThreshold();
    }
    
    // ============================================
    // LÓGICA DE MATRIZ Y CICLOS
    // ============================================
    
    function _assignMatrixPosition(address _user) internal {
        
        // Esta función ahora solo se llama en la activación inicial, no en el upgrade
        require(!users[_user].matrixPosition.isActive, "Solo la primera activacion asigna posicion"); 

        if (totalUsers == 1 || isSystemAccount[_user]) { 
            users[_user].matrixPosition.positionId = matrixPositionCounter;
            users[_user].matrixPosition.isActive = true;
            matrixQueue.push(_user);
        } else {
            address upline = _findNextAvailablePosition();
            users[_user].matrixPosition.positionId = matrixPositionCounter;
            users[_user].matrixPosition.upline = upline;
            users[_user].matrixPosition.isActive = true;
            users[upline].matrixPosition.children.push(_user);
            
            if (users[upline].matrixPosition.children.length == 2) {
                _processCycle(upline, CYCLE_POOL, false); 
            }
            matrixQueue.push(_user);
            emit MatrixPositionAssigned(_user, upline, users[_user].matrixPosition.positionId);
        }
        matrixPositionCounter++;
    }
    
    function _findNextAvailablePosition() internal view returns (address) {
        require(matrixQueueIndex < matrixQueue.length, "Matrix queue is empty or index is out of bounds");
        
        return matrixQueue[matrixQueueIndex]; 
    }
    
    function _processCycle(address _user, uint256 _cycleAmount, bool isRenewalCycle) internal nonReentrant {
        User storage user = users[_user];
        
        // 1. Quema Directa (5.5 TRX)
        _safeTransfer(BURN_ADDRESS, CYCLE_BURN);
        totalBurned += CYCLE_BURN;
        emit TRXBurned(CYCLE_BURN, totalBurned);
        
        // 2. Bono a Sponsor (2.5 TRX)
        if (user.sponsor != address(0)) {
            _safeTransfer(user.sponsor, CYCLE_SPONSOR_BONUS);
            users[user.sponsor].totalEarned += CYCLE_SPONSOR_BONUS;
            emit CommissionPaid(_user, user.sponsor, CYCLE_SPONSOR_BONUS, "Sponsor Bonus");
        }
        
        // 3. Fondo de Reinversión de Bots (5 TRX)
        reinvestmentFund.balance += CYCLE_REINVESTMENT;
        _checkReinvestmentThreshold();
        
        // 4. Pago de usuario/Renovación (10 TRX)
        if (isRenewalCycle) {
            reinvestmentFund.balance += CYCLE_USER_PAYMENT; 
            emit PlanRenewed(_user, "Renewal", CYCLE_USER_PAYMENT);
        } else {
            _safeTransfer(_user, CYCLE_USER_PAYMENT);
            user.totalEarned += CYCLE_USER_PAYMENT;
            emit CommissionPaid(address(this), _user, CYCLE_USER_PAYMENT, "Cycle Payment");
        }
        
        // 5. Reserva de Gas (2 TRX)
        reinvestmentFund.gasReserve += CYCLE_GAS_RESERVE;
        uint256 burnedAmountFromGasReserve = _checkGasReserveLimit(); 
        
        // 6. Reposicionamiento (25 TRX)
        // El usuario mantiene su ID de posición, pero sus hijos se reinician.
        user.matrixPosition.children = new address[](0);
        user.matrixPosition.cycles++;
        _assignMatrixPositionReposition(user.userAddress); // Reposicionamiento en la matriz
        
        // 7. Avance en la cola (O(1))
        matrixQueueIndex++;
        
        if (isSystemAccount[_user]) {
            _processSystemCycle(_user, burnedAmountFromGasReserve);
        }
        
        emit MatrixCycleCompleted(_user, user.matrixPosition.cycles, CYCLE_POOL);
    }
    
    // ⭐ Función interna para reposicionamiento post-ciclo
    function _assignMatrixPositionReposition(address _user) internal {
        // Asignación de una NUEVA ubicación para el usuario existente
        address upline = _findNextAvailablePosition();
        users[_user].matrixPosition.upline = upline;
        users[upline].matrixPosition.children.push(_user);
        
        if (users[upline].matrixPosition.children.length == 2) {
            _processCycle(upline, CYCLE_POOL, false); 
        }
        emit MatrixPositionAssigned(_user, upline, users[_user].matrixPosition.positionId);
    }
    
    function _processSystemCycle(address _systemAccount, uint256 _burnedFromUserCycle) internal {
        
        uint256 gasShare = SYSTEM_GAS_SHARE;
        uint256 burnedAmount = _burnedFromUserCycle; 
        uint256 gasAdded = 0;
        
        // 1. Share de Gas/Quema (25 TRX)
        if (reinvestmentFund.gasReserve >= MAX_GAS_RESERVE) {
            _safeTransfer(BURN_ADDRESS, gasShare); 
            burnedAmount += gasShare;
            totalBurned += gasShare;
            emit TRXBurned(gasShare, totalBurned);
        } else {
            reinvestmentFund.gasReserve += gasShare;
            uint256 excessBurned = _checkGasReserveLimit(); 
            gasAdded = gasShare - excessBurned;
            burnedAmount += excessBurned;
        }
        
        // 2. Share de Reinversión (25 TRX)
        reinvestmentFund.balance += SYSTEM_NEW_ACCOUNT_SHARE;
        _checkReinvestmentThreshold();
        
        // 3. Aporte al Pool de Dividendos (10 TRX)
        uint256 dividendContribution = 0;
        if (totalQualifiedUsers > 0) {
            accumulatedDividendPool += BOT_DIVIDEND_CONTRIBUTION;
            dividendContribution = BOT_DIVIDEND_CONTRIBUTION;
        }
        
        emit SystemCycleDistribution(
            _systemAccount, 
            gasAdded, 
            SYSTEM_NEW_ACCOUNT_SHARE, 
            burnedAmount, 
            dividendContribution
        );
    }

    // ============================================
    // FUNCIONES PÚBLICAS - DIVIDENDOS
    // ============================================
    
    function getPendingDividends(address _user) public view returns (uint256) {
        User storage user = users[_user];
        if (!user.isQualifiedForDividends || totalQualifiedUsers == 0) {
            return 0;
        }
        
        uint256 currentFactor = accumulatedDividendPool / totalQualifiedUsers;
        
        if (currentFactor <= user.claimedDividendFactor) {
            return 0;
        }
        
        uint256 factorDifference = currentFactor - user.claimedDividendFactor;
        
        return factorDifference;
    }
    
    function claimDividends() external nonReentrant {
        uint256 amount = getPendingDividends(msg.sender);
        require(amount >= MIN_DIVIDEND_POOL_SUN, "Debe acumular al menos 1000 TRX para reclamar");
        
        // Verifica que el balance del contrato tenga suficiente TRX
        require(address(this).balance >= amount, "Saldo insuficiente en el contrato para pagar el dividendo.");
        
        // Actualizar el factor del usuario
        users[msg.sender].claimedDividendFactor = accumulatedDividendPool / totalQualifiedUsers;
        
        // Transferir los dividendos
        _safeTransfer(msg.sender, amount);
        users[msg.sender].totalEarned += amount;
        
        emit DividendsClaimed(msg.sender, amount);
    }

    // ============================================
    // FUNCIONES PÚBLICAS - VISTAS
    // ============================================

    function getGlobalStats() external view returns (uint256 _totalUsers, uint256 _totalBurned, uint256 _reinvestmentBalance, uint256 _gasReserve, uint256 _totalQualifiedUsers, uint256 _accumulatedDividendPool) {
        return (
            totalUsers,
            totalBurned,
            reinvestmentFund.balance,
            reinvestmentFund.gasReserve,
            totalQualifiedUsers,
            accumulatedDividendPool
        );
    }
    
    // ⭐ VISTA ADICIONAL PARA ESTADO DE PLAN
    function getUserPlanInfo(address _user) external view returns (string memory planName, uint256 planCost, uint256 commissionPaid) {
        User memory user = users[_user];
        (PlanType currentType, uint256 currentCost, uint256 currentCommission) = _getCurrentPlanInfo(user);
        
        string memory name;
        if (currentType == PlanType.PREMIUM) {
            name = "PREMIUM";
        } else if (currentType == PlanType.MASTER) {
            name = "MASTER";
        } else if (currentType == PlanType.BASIC) {
            name = "BASIC";
        } else {
            name = "NONE";
        }
        
        return (name, currentCost, user.commissionPaid);
    }
}