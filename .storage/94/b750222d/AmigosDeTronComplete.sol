// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AmigosDeTron - Sistema Completo
 * @dev Smart Contract con matriz 1x2, tres planes, reinversión automática y quema de TRX
 * 
 * CARACTERÍSTICAS:
 * - Matriz 1x2 global con ciclos automáticos
 * - 3 planes independientes: Básico (35 TRX), Master (100 TRX), Premium (250 TRX)
 * - Fondo de reinversión con creación automática de cuentas
 * - Pre-Launch de 90 días con publicidad gratuita
 * - Quema directa e indirecta de TRX
 * - Sin control del owner después del deployment
 */
contract AmigosDeTronComplete {
    // Constantes de planes (en SUN - 1 TRX = 1,000,000 SUN)
    uint256 public constant PLAN_BASIC = 35000000;      // 35 TRX
    uint256 public constant PLAN_MASTER = 100000000;    // 100 TRX
    uint256 public constant PLAN_PREMIUM = 250000000;   // 250 TRX
    
    // Dirección de quema
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Dirección de empresa de servicios (debe configurarse en constructor)
    address public immutable serviceCompanyAddress;
    
    // Contador de Pre-Launch (90 días en segundos)
    uint256 public constant PRE_LAUNCH_DURATION = 90 days;
    
    // Threshold para creación de cuentas desde fondo de reinversión
    uint256 public constant REINVESTMENT_THRESHOLD_LOW = 2000000000;  // 2000 TRX
    
    // Estructura de usuario
    struct User {
        address userAddress;
        address sponsor;
        uint256 referralCode;
        uint256 registrationTime;
        bool isActive;
        uint256 totalEarned;
        uint256 totalReferrals;
        
        // Matrices por plan
        MatrixPosition basicMatrix;
        MatrixPosition masterMatrix;
        MatrixPosition premiumMatrix;
        
        // Pre-Launch
        bool preLaunchActive;
        uint256 preLaunchEndTime;
    }
    
    // Estructura de posición en matriz
    struct MatrixPosition {
        uint256 positionId;
        address upline;
        address[] children;  // Máximo 2 hijos
        uint256 cycles;
        bool isActive;
    }
    
    // Fondo de reinversión
    struct ReinvestmentFund {
        uint256 balance;
        uint256 accountsCreated;
        uint256 totalReinvested;
    }
    
    // Mapeos
    mapping(address => User) public users;
    mapping(uint256 => address) public referralCodeToAddress;
    mapping(address => bool) public isSystemAccount;  // Cuentas creadas por reinversión
    
    // Contadores globales por plan
    uint256 public basicMatrixPositionCounter;
    uint256 public masterMatrixPositionCounter;
    uint256 public premiumMatrixPositionCounter;
    
    // Colas de matrices (para asignación automática)
    address[] public basicMatrixQueue;
    address[] public masterMatrixQueue;
    address[] public premiumMatrixQueue;
    
    // Índices de cola
    uint256 public basicQueueIndex;
    uint256 public masterQueueIndex;
    uint256 public premiumQueueIndex;
    
    // Variables globales
    uint256 public totalUsers;
    uint256 public totalBurned;
    uint256 public nextReferralCode = 100000;
    
    // Fondo de reinversión
    ReinvestmentFund public reinvestmentFund;
    
    // Eventos
    event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode);
    event PlanActivated(address indexed user, uint256 plan, string planName);
    event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 plan, uint256 positionId);
    event MatrixCycleCompleted(address indexed user, uint256 plan, uint256 cycleNumber, uint256 earnings);
    event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType);
    event ReinvestmentAccountCreated(address indexed account, uint256 plan);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event PreLaunchActivated(address indexed user, uint256 endTime);
    
    constructor(address _serviceCompanyAddress) {
        require(_serviceCompanyAddress != address(0), "Direccion de servicio invalida");
        serviceCompanyAddress = _serviceCompanyAddress;
        
        // Crear primer usuario (owner) con código 100000
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
    
    /**
     * @dev Registra un nuevo usuario con código de sponsor
     */
    function register(uint256 _sponsorCode) external {
        require(!users[msg.sender].isActive, "Usuario ya registrado");
        require(_sponsorCode >= 100000, "Codigo de referido invalido");
        
        address sponsor = referralCodeToAddress[_sponsorCode];
        require(sponsor != address(0), "Sponsor no existe");
        require(sponsor != msg.sender, "No puedes ser tu propio sponsor");
        
        // Crear usuario
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].sponsor = sponsor;
        users[msg.sender].referralCode = nextReferralCode;
        users[msg.sender].isActive = true;
        users[msg.sender].registrationTime = block.timestamp;
        
        // Activar Pre-Launch de 90 días
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
     * @dev Activa el Plan Básico (35 TRX)
     * Distribución: 10 TRX sponsor + 25 TRX matriz
     */
    function activateBasicPlan() external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
        require(msg.value == PLAN_BASIC, "Monto incorrecto");
        require(!users[msg.sender].basicMatrix.isActive, "Plan ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // Pagar 10 TRX al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(10000000);
            users[sponsor].totalEarned += 10000000;
            emit CommissionPaid(msg.sender, sponsor, 10000000, "sponsor_basic");
        }
        
        // 25 TRX van a la matriz
        _assignToMatrix(msg.sender, 1); // 1 = Plan Básico
        
        users[msg.sender].basicMatrix.isActive = true;
        
        emit PlanActivated(msg.sender, PLAN_BASIC, "Basic");
    }
    
    /**
     * @dev Activa el Plan Master (100 TRX)
     * Distribución: 25 TRX matriz + 25 TRX sponsor + 25 TRX empresa + 25 TRX reinversión
     */
    function activateMasterPlan() external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
        require(msg.value == PLAN_MASTER, "Monto incorrecto");
        require(!users[msg.sender].masterMatrix.isActive, "Plan ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 25 TRX al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(25000000);
            users[sponsor].totalEarned += 25000000;
            emit CommissionPaid(msg.sender, sponsor, 25000000, "sponsor_master");
        }
        
        // 25 TRX a empresa de servicios
        payable(serviceCompanyAddress).transfer(25000000);
        
        // 25 TRX al fondo de reinversión
        reinvestmentFund.balance += 25000000;
        
        // 25 TRX a la matriz
        _assignToMatrix(msg.sender, 2); // 2 = Plan Master
        
        users[msg.sender].masterMatrix.isActive = true;
        
        // Verificar si hay fondos suficientes para crear cuentas
        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_MASTER, "Master");
    }
    
    /**
     * @dev Activa el Plan Premium (250 TRX)
     * Distribución: 25 TRX matriz + 100 TRX sponsor + 75 TRX empresa + 50 TRX reinversión
     */
    function activatePremiumPlan() external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
        require(msg.value == PLAN_PREMIUM, "Monto incorrecto");
        require(!users[msg.sender].premiumMatrix.isActive, "Plan ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 100 TRX al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(100000000);
            users[sponsor].totalEarned += 100000000;
            emit CommissionPaid(msg.sender, sponsor, 100000000, "sponsor_premium");
        }
        
        // 75 TRX a empresa de servicios
        payable(serviceCompanyAddress).transfer(75000000);
        
        // 50 TRX al fondo de reinversión
        reinvestmentFund.balance += 50000000;
        
        // 25 TRX a la matriz
        _assignToMatrix(msg.sender, 3); // 3 = Plan Premium
        
        users[msg.sender].premiumMatrix.isActive = true;
        
        // Verificar si hay fondos suficientes para crear cuentas
        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_PREMIUM, "Premium");
    }
    
    /**
     * @dev Asigna un usuario a la matriz correspondiente
     */
    function _assignToMatrix(address _user, uint256 _plan) private {
        address upline;
        uint256 positionId;
        
        if (_plan == 1) { // Plan Básico
            upline = _findNextAvailablePosition(basicMatrixQueue, basicQueueIndex);
            positionId = basicMatrixPositionCounter++;
            users[_user].basicMatrix.positionId = positionId;
            users[_user].basicMatrix.upline = upline;
            basicMatrixQueue.push(_user);
            
            if (upline != address(0)) {
                users[upline].basicMatrix.children.push(_user);
                
                // Verificar si completó el ciclo (2 hijos)
                if (users[upline].basicMatrix.children.length == 2) {
                    _processBasicCycle(upline);
                }
            }
            
        } else if (_plan == 2) { // Plan Master
            upline = _findNextAvailablePosition(masterMatrixQueue, masterQueueIndex);
            positionId = masterMatrixPositionCounter++;
            users[_user].masterMatrix.positionId = positionId;
            users[_user].masterMatrix.upline = upline;
            masterMatrixQueue.push(_user);
            
            if (upline != address(0)) {
                users[upline].masterMatrix.children.push(_user);
                
                if (users[upline].masterMatrix.children.length == 2) {
                    _processMasterCycle(upline);
                }
            }
            
        } else if (_plan == 3) { // Plan Premium
            upline = _findNextAvailablePosition(premiumMatrixQueue, premiumQueueIndex);
            positionId = premiumMatrixPositionCounter++;
            users[_user].premiumMatrix.positionId = positionId;
            users[_user].premiumMatrix.upline = upline;
            premiumMatrixQueue.push(_user);
            
            if (upline != address(0)) {
                users[upline].premiumMatrix.children.push(_user);
                
                if (users[upline].premiumMatrix.children.length == 2) {
                    _processPremiumCycle(upline);
                }
            }
        }
        
        emit MatrixPositionAssigned(_user, upline, _plan, positionId);
    }
    
    /**
     * @dev Encuentra la siguiente posición disponible en la matriz
     */
    function _findNextAvailablePosition(address[] storage queue, uint256 queueIndex) private view returns (address) {
        if (queue.length == 0) {
            return address(0);
        }
        
        // Buscar el primer usuario con menos de 2 hijos
        for (uint256 i = queueIndex; i < queue.length; i++) {
            address candidate = queue[i];
            
            // Verificar según el plan
            if (queue == basicMatrixQueue && users[candidate].basicMatrix.children.length < 2) {
                return candidate;
            } else if (queue == masterMatrixQueue && users[candidate].masterMatrix.children.length < 2) {
                return candidate;
            } else if (queue == premiumMatrixQueue && users[candidate].premiumMatrix.children.length < 2) {
                return candidate;
            }
        }
        
        return address(0);
    }
    
    /**
     * @dev Procesa el ciclo del Plan Básico
     * Pago: 10 TRX al usuario + 2.5 TRX al sponsor
     */
    function _processBasicCycle(address _user) private {
        users[_user].basicMatrix.cycles++;
        
        // Pagar 10 TRX al usuario que cicla
        payable(_user).transfer(10000000);
        users[_user].totalEarned += 10000000;
        
        // Pagar 2.5 TRX al sponsor del usuario
        address sponsor = users[_user].sponsor;
        if (sponsor != address(0)) {
            payable(sponsor).transfer(2500000);
            users[sponsor].totalEarned += 2500000;
            emit CommissionPaid(_user, sponsor, 2500000, "cycle_bonus_basic");
        }
        
        // Quemar 12.5 TRX restantes
        payable(BURN_ADDRESS).transfer(12500000);
        totalBurned += 12500000;
        emit TRXBurned(12500000, totalBurned);
        
        emit MatrixCycleCompleted(_user, 1, users[_user].basicMatrix.cycles, 10000000);
        
        // Reposicionar en la matriz
        delete users[_user].basicMatrix.children;
        _assignToMatrix(_user, 1);
    }
    
    /**
     * @dev Procesa el ciclo del Plan Master
     */
    function _processMasterCycle(address _user) private {
        users[_user].masterMatrix.cycles++;
        
        // Lógica similar al básico pero con valores del Master
        // Pagar comisiones proporcionales
        payable(_user).transfer(15000000); // Ejemplo: 15 TRX
        users[_user].totalEarned += 15000000;
        
        address sponsor = users[_user].sponsor;
        if (sponsor != address(0)) {
            payable(sponsor).transfer(5000000);
            users[sponsor].totalEarned += 5000000;
            emit CommissionPaid(_user, sponsor, 5000000, "cycle_bonus_master");
        }
        
        // Quemar restante
        payable(BURN_ADDRESS).transfer(5000000);
        totalBurned += 5000000;
        emit TRXBurned(5000000, totalBurned);
        
        emit MatrixCycleCompleted(_user, 2, users[_user].masterMatrix.cycles, 15000000);
        
        // Reposicionar
        delete users[_user].masterMatrix.children;
        _assignToMatrix(_user, 2);
    }
    
    /**
     * @dev Procesa el ciclo del Plan Premium
     */
    function _processPremiumCycle(address _user) private {
        users[_user].premiumMatrix.cycles++;
        
        // Pagar comisiones proporcionales
        payable(_user).transfer(20000000); // Ejemplo: 20 TRX
        users[_user].totalEarned += 20000000;
        
        address sponsor = users[_user].sponsor;
        if (sponsor != address(0)) {
            payable(sponsor).transfer(5000000);
            users[sponsor].totalEarned += 5000000;
            emit CommissionPaid(_user, sponsor, 5000000, "cycle_bonus_premium");
        }
        
        emit MatrixCycleCompleted(_user, 3, users[_user].premiumMatrix.cycles, 20000000);
        
        // Reposicionar
        delete users[_user].premiumMatrix.children;
        _assignToMatrix(_user, 3);
    }
    
    /**
     * @dev Verifica el threshold de reinversión y crea cuentas automáticamente
     */
    function _checkReinvestmentThreshold() private {
        if (reinvestmentFund.balance >= REINVESTMENT_THRESHOLD_LOW) {
            uint256 accountsToCreate = reinvestmentFund.balance >= REINVESTMENT_THRESHOLD_LOW * 2 ? 2 : 1;
            
            for (uint256 i = 0; i < accountsToCreate; i++) {
                _createReinvestmentAccount();
            }
        }
    }
    
    /**
     * @dev Crea una cuenta automática desde el fondo de reinversión
     */
    function _createReinvestmentAccount() private {
        // Crear dirección determinística
        address newAccount = address(uint160(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            reinvestmentFund.accountsCreated,
            msg.sender
        )))));
        
        // Marcar como cuenta del sistema
        isSystemAccount[newAccount] = true;
        
        // Registrar como usuario con sponsor = contrato
        users[newAccount].userAddress = newAccount;
        users[newAccount].sponsor = address(this);
        users[newAccount].referralCode = nextReferralCode;
        users[newAccount].isActive = true;
        users[newAccount].registrationTime = block.timestamp;
        
        referralCodeToAddress[nextReferralCode] = newAccount;
        nextReferralCode++;
        totalUsers++;
        
        // Activar en Plan Básico automáticamente
        reinvestmentFund.balance -= PLAN_BASIC;
        reinvestmentFund.totalReinvested += PLAN_BASIC;
        reinvestmentFund.accountsCreated++;
        
        _assignToMatrix(newAccount, 1);
        users[newAccount].basicMatrix.isActive = true;
        
        emit ReinvestmentAccountCreated(newAccount, 1);
    }
    
    /**
     * @dev Quema TRX directamente (función pública)
     */
    function burnTRX() external payable {
        require(msg.value > 0, "Debe enviar TRX para quemar");
        
        payable(BURN_ADDRESS).transfer(msg.value);
        totalBurned += msg.value;
        
        emit TRXBurned(msg.value, totalBurned);
    }
    
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
            user.preLaunchActive,
            user.preLaunchEndTime
        );
    }
    
    /**
     * @dev Obtiene información de matriz del usuario
     */
    function getUserMatrixInfo(address _user, uint256 _plan) external view returns (
        uint256 positionId,
        address upline,
        address[] memory children,
        uint256 cycles,
        bool isActive
    ) {
        MatrixPosition memory matrix;
        
        if (_plan == 1) {
            matrix = users[_user].basicMatrix;
        } else if (_plan == 2) {
            matrix = users[_user].masterMatrix;
        } else if (_plan == 3) {
            matrix = users[_user].premiumMatrix;
        }
        
        return (
            matrix.positionId,
            matrix.upline,
            matrix.children,
            matrix.cycles,
            matrix.isActive
        );
    }
    
    /**
     * @dev Obtiene estadísticas globales
     */
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalBurned,
        uint256 _reinvestmentBalance,
        uint256 _accountsCreated,
        uint256 _basicPositions,
        uint256 _masterPositions,
        uint256 _premiumPositions
    ) {
        return (
            totalUsers,
            totalBurned,
            reinvestmentFund.balance,
            reinvestmentFund.accountsCreated,
            basicMatrixPositionCounter,
            masterMatrixPositionCounter,
            premiumMatrixPositionCounter
        );
    }
}