// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AmigosDeTron - Sistema Correcto
 * @dev UNA SOLA matriz 1x2 que se alimenta de los 3 planes
 * Todos los ciclos pagan 25 TRX (mismo pago para todos)
 */
contract AmigosDeTronFixed {
    // Constantes de planes (en SUN - 1 TRX = 1,000,000 SUN)
    uint256 public constant PLAN_BASIC = 35000000;      // 35 TRX
    uint256 public constant PLAN_MASTER = 100000000;    // 100 TRX
    uint256 public constant PLAN_PREMIUM = 250000000;   // 250 TRX
    
    // Pago de ciclo único para todos los planes
    uint256 public constant CYCLE_PAYMENT = 25000000;   // 25 TRX
    
    // Dirección de quema
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Dirección de empresa de servicios (configurable por owner)
    address public serviceCompanyAddress;
    address public immutable owner;
    
    // Contador de Pre-Launch (90 días en segundos)
    uint256 public constant PRE_LAUNCH_DURATION = 90 days;
    
    // Threshold para creación de cuentas desde fondo de reinversión
    uint256 public constant REINVESTMENT_THRESHOLD = 2000000000;  // 2000 TRX
    
    // Estructura de usuario
    struct User {
        address userAddress;
        address sponsor;
        uint256 referralCode;
        uint256 registrationTime;
        bool isActive;
        uint256 totalEarned;
        uint256 totalReferrals;
        
        // UNA SOLA posición en la matriz global
        MatrixPosition matrixPosition;
        
        // Planes activos
        bool basicActive;
        bool masterActive;
        bool premiumActive;
        
        // Pre-Launch
        bool preLaunchActive;
        uint256 preLaunchEndTime;
    }
    
    // Estructura de posición en la ÚNICA matriz
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
    mapping(address => bool) public isSystemAccount;
    
    // Cola de la ÚNICA matriz global
    address[] public matrixQueue;
    uint256 public matrixQueueIndex;
    uint256 public matrixPositionCounter;
    
    // Variables globales
    uint256 public totalUsers;
    uint256 public totalBurned;
    uint256 public nextReferralCode = 100000;
    
    // Contadores de planes
    uint256 public basicPlanCount;
    uint256 public masterPlanCount;
    uint256 public premiumPlanCount;
    
    // Fondo de reinversión
    ReinvestmentFund public reinvestmentFund;
    
    // Eventos
    event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode);
    event PlanActivated(address indexed user, uint256 planCost, string planName);
    event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 positionId);
    event MatrixCycleCompleted(address indexed user, uint256 cycleNumber, uint256 earnings);
    event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType);
    event ReinvestmentAccountCreated(address indexed account);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event PreLaunchActivated(address indexed user, uint256 endTime);
    event ServiceAddressUpdated(address indexed newAddress);
    
    constructor(address _serviceCompanyAddress) {
        require(_serviceCompanyAddress != address(0), "Direccion invalida");
        serviceCompanyAddress = _serviceCompanyAddress;
        owner = msg.sender;
        
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
     * @dev Solo el owner puede actualizar la dirección de la empresa
     */
    function updateServiceAddress(address _newAddress) external {
        require(msg.sender == owner, "Solo el owner");
        require(_newAddress != address(0), "Direccion invalida");
        serviceCompanyAddress = _newAddress;
        emit ServiceAddressUpdated(_newAddress);
    }
    
    /**
     * @dev Registra un nuevo usuario
     */
    function register(uint256 _sponsorCode) external {
        require(!users[msg.sender].isActive, "Usuario ya registrado");
        require(_sponsorCode >= 100000, "Codigo invalido");
        
        address sponsor = referralCodeToAddress[_sponsorCode];
        require(sponsor != address(0), "Sponsor no existe");
        require(sponsor != msg.sender, "No puedes ser tu propio sponsor");
        
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].sponsor = sponsor;
        users[msg.sender].referralCode = nextReferralCode;
        users[msg.sender].isActive = true;
        users[msg.sender].registrationTime = block.timestamp;
        
        // Pre-Launch de 90 días
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
     * 10 TRX sponsor + 25 TRX matriz
     */
    function activateBasicPlan() external payable {
        require(users[msg.sender].isActive, "No registrado");
        require(msg.value == PLAN_BASIC, "Monto incorrecto");
        require(!users[msg.sender].basicActive, "Plan ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 10 TRX al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(10000000);
            users[sponsor].totalEarned += 10000000;
            emit CommissionPaid(msg.sender, sponsor, 10000000, "sponsor_basic");
        }
        
        // 25 TRX a la matriz
        _assignToMatrix(msg.sender);
        
        users[msg.sender].basicActive = true;
        basicPlanCount++;
        
        emit PlanActivated(msg.sender, PLAN_BASIC, "Basic");
    }
    
    /**
     * @dev Activa Plan Master (100 TRX)
     * 25 TRX sponsor + 25 TRX empresa + 25 TRX reinversión + 25 TRX matriz
     */
    function activateMasterPlan() external payable {
        require(users[msg.sender].isActive, "No registrado");
        require(msg.value == PLAN_MASTER, "Monto incorrecto");
        require(!users[msg.sender].masterActive, "Plan ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 25 TRX al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(25000000);
            users[sponsor].totalEarned += 25000000;
            emit CommissionPaid(msg.sender, sponsor, 25000000, "sponsor_master");
        }
        
        // 25 TRX a empresa
        payable(serviceCompanyAddress).transfer(25000000);
        
        // 25 TRX a reinversión
        reinvestmentFund.balance += 25000000;
        
        // 25 TRX a la matriz
        _assignToMatrix(msg.sender);
        
        users[msg.sender].masterActive = true;
        masterPlanCount++;
        
        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_MASTER, "Master");
    }
    
    /**
     * @dev Activa Plan Premium (250 TRX)
     * 100 TRX sponsor + 75 TRX empresa + 50 TRX reinversión + 25 TRX matriz
     */
    function activatePremiumPlan() external payable {
        require(users[msg.sender].isActive, "No registrado");
        require(msg.value == PLAN_PREMIUM, "Monto incorrecto");
        require(!users[msg.sender].premiumActive, "Plan ya activo");
        
        address sponsor = users[msg.sender].sponsor;
        
        // 100 TRX al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(100000000);
            users[sponsor].totalEarned += 100000000;
            emit CommissionPaid(msg.sender, sponsor, 100000000, "sponsor_premium");
        }
        
        // 75 TRX a empresa
        payable(serviceCompanyAddress).transfer(75000000);
        
        // 50 TRX a reinversión
        reinvestmentFund.balance += 50000000;
        
        // 25 TRX a la matriz
        _assignToMatrix(msg.sender);
        
        users[msg.sender].premiumActive = true;
        premiumPlanCount++;
        
        _checkReinvestmentThreshold();
        
        emit PlanActivated(msg.sender, PLAN_PREMIUM, "Premium");
    }
    
    /**
     * @dev Asigna usuario a la ÚNICA matriz global
     */
    function _assignToMatrix(address _user) private {
        // Si el usuario ya está en la matriz, no hacer nada
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
            
            // Verificar si completó el ciclo (2 hijos)
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
     * @dev Procesa ciclo - MISMO PAGO PARA TODOS (25 TRX)
     * 12.5 TRX al usuario + 12.5 TRX quemados
     */
    function _processCycle(address _user) private {
        users[_user].matrixPosition.cycles++;
        
        // 12.5 TRX al usuario
        payable(_user).transfer(12500000);
        users[_user].totalEarned += 12500000;
        
        // 12.5 TRX quemados
        payable(BURN_ADDRESS).transfer(12500000);
        totalBurned += 12500000;
        emit TRXBurned(12500000, totalBurned);
        
        emit MatrixCycleCompleted(_user, users[_user].matrixPosition.cycles, 12500000);
        
        // Reposicionar
        delete users[_user].matrixPosition.children;
        users[_user].matrixPosition.isActive = false;
        _assignToMatrix(_user);
    }
    
    /**
     * @dev Verifica threshold de reinversión
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
        
        // Activar en Plan Básico
        reinvestmentFund.balance -= PLAN_BASIC;
        reinvestmentFund.totalReinvested += PLAN_BASIC;
        reinvestmentFund.accountsCreated++;
        
        _assignToMatrix(newAccount);
        users[newAccount].basicActive = true;
        basicPlanCount++;
        
        emit ReinvestmentAccountCreated(newAccount);
    }
    
    /**
     * @dev Quema TRX directamente
     */
    function burnTRX() external payable {
        require(msg.value > 0, "Debe enviar TRX");
        payable(BURN_ADDRESS).transfer(msg.value);
        totalBurned += msg.value;
        emit TRXBurned(msg.value, totalBurned);
    }
    
    /**
     * @dev Obtiene info del usuario
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
     * @dev Obtiene info de matriz del usuario
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
     * @dev Obtiene estadísticas globales
     */
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalBurned,
        uint256 _reinvestmentBalance,
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
            reinvestmentFund.accountsCreated,
            basicPlanCount,
            masterPlanCount,
            premiumPlanCount,
            matrixPositionCounter
        );
    }
    
    /**
     * @dev Obtiene lista de referidos de un usuario
     */
    function getUserReferrals(address _user) external view returns (address[] memory) {
        uint256 count = users[_user].totalReferrals;
        address[] memory referrals = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 100001; i < nextReferralCode && index < count; i++) {
            address refAddress = referralCodeToAddress[i];
            if (users[refAddress].sponsor == _user) {
                referrals[index] = refAddress;
                index++;
            }
        }
        
        return referrals;
    }
}