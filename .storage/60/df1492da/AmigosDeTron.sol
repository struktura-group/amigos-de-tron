// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AmigosDeTron
 * @dev Sistema matricial 1x2 descentralizado con quema automática de TRX
 * @notice Este contrato NO tiene puertas traseras. El ownership se renuncia después del deploy.
 * @notice Objetivo: Quemar el 25% del suministro global de TRX mediante crowdfunding descentralizado
 */
contract AmigosDeTron {
    // Dirección de quema de TRX (dirección sin clave privada conocida)
    address public constant BURN_ADDRESS = address(0x000000000000000000000000000000000000dEaD);
    
    // Planes disponibles (en TRX con 6 decimales)
    uint256 public constant PLAN_50 = 50 * 10**6;   // 50 TRX
    uint256 public constant PLAN_100 = 100 * 10**6; // 100 TRX
    uint256 public constant PLAN_500 = 500 * 10**6; // 500 TRX
    
    // Porcentajes de distribución (base 100)
    uint256 public constant SPONSOR_PERCENT = 50;  // 50% al patrocinador
    uint256 public constant UPLINE_PERCENT = 25;   // 25% al upline
    uint256 public constant BURN_PERCENT = 25;     // 25% a quemar
    
    // Estructura de usuario
    struct User {
        address userAddress;
        address sponsor;
        address upline;
        uint256 referralCode;
        uint256 totalInvested;
        uint256 totalEarned;
        uint256 totalReferrals;
        uint256 matrixLevel;
        bool isActive;
        uint256 registrationTime;
    }
    
    // Estructura de transacción
    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
        string transactionType; // "purchase", "commission", "burn"
        address relatedAddress;
    }
    
    // Mapeos
    mapping(address => User) public users;
    mapping(uint256 => address) public referralCodeToAddress;
    mapping(address => Transaction[]) public userTransactions;
    mapping(address => address[]) public userReferrals;
    
    // Contadores
    uint256 public totalUsers;
    uint256 public totalInvested;
    uint256 public totalBurned;
    uint256 private nextReferralCode = 100000;
    
    // Lista de todas las transacciones (para historial global)
    Transaction[] public allTransactions;
    
    // Eventos
    event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode);
    event PlanPurchased(address indexed user, uint256 amount, uint256 plan);
    event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 level);
    
    /**
     * @dev Constructor - Registra al creador del contrato como usuario raíz
     * @notice Después del deploy, el owner debe renunciar al ownership llamando a renounceOwnership()
     */
    constructor() {
        // Registrar dirección raíz (sin sponsor)
        _registerUser(msg.sender, address(0));
    }
    
    /**
     * @dev Registra un nuevo usuario con código de referido
     * @param _sponsorCode Código de referido del patrocinador
     */
    function register(uint256 _sponsorCode) external {
        require(!users[msg.sender].isActive, "Usuario ya registrado");
        require(_sponsorCode >= 100000, "Codigo de referido invalido");
        
        address sponsor = referralCodeToAddress[_sponsorCode];
        require(sponsor != address(0), "Patrocinador no existe");
        require(sponsor != msg.sender, "No puedes ser tu propio patrocinador");
        
        _registerUser(msg.sender, sponsor);
    }
    
    /**
     * @dev Función interna para registrar usuario
     */
    function _registerUser(address _user, address _sponsor) private {
        uint256 newReferralCode = nextReferralCode++;
        
        users[_user] = User({
            userAddress: _user,
            sponsor: _sponsor,
            upline: address(0), // Se asignará al comprar plan
            referralCode: newReferralCode,
            totalInvested: 0,
            totalEarned: 0,
            totalReferrals: 0,
            matrixLevel: 0,
            isActive: true,
            registrationTime: block.timestamp
        });
        
        referralCodeToAddress[newReferralCode] = _user;
        totalUsers++;
        
        if (_sponsor != address(0)) {
            userReferrals[_sponsor].push(_user);
            users[_sponsor].totalReferrals++;
        }
        
        emit UserRegistered(_user, _sponsor, newReferralCode);
    }
    
    /**
     * @dev Compra un plan y distribuye comisiones automáticamente
     * @param _plan Monto del plan (50, 100, o 500 TRX)
     */
    function purchasePlan(uint256 _plan) external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
        require(
            _plan == PLAN_50 || _plan == PLAN_100 || _plan == PLAN_500,
            "Plan invalido"
        );
        require(msg.value == _plan, "Monto incorrecto");
        
        User storage user = users[msg.sender];
        user.totalInvested += msg.value;
        totalInvested += msg.value;
        
        // Asignar posición en matriz si es primera compra
        if (user.upline == address(0) && user.sponsor != address(0)) {
            _assignMatrixPosition(msg.sender);
        }
        
        // Distribuir comisiones
        _distributeCommissions(msg.sender, msg.value);
        
        // Registrar transacción
        _recordTransaction(msg.sender, msg.value, "purchase", address(0));
        
        emit PlanPurchased(msg.sender, msg.value, _plan);
    }
    
    /**
     * @dev Asigna posición en la matriz 1x2
     */
    function _assignMatrixPosition(address _user) private {
        address sponsor = users[_user].sponsor;
        
        // Buscar upline disponible en la matriz
        address upline = _findAvailableUpline(sponsor);
        users[_user].upline = upline;
        users[_user].matrixLevel = users[upline].matrixLevel + 1;
        
        emit MatrixPositionAssigned(_user, upline, users[_user].matrixLevel);
    }
    
    /**
     * @dev Encuentra un upline disponible en la matriz 1x2
     */
    function _findAvailableUpline(address _start) private view returns (address) {
        // Implementación simplificada: retorna el sponsor
        // En producción, implementar búsqueda de posición libre en matriz
        return _start;
    }
    
    /**
     * @dev Distribuye comisiones automáticamente
     * 50% al patrocinador, 25% al upline, 25% a quemar
     */
    function _distributeCommissions(address _user, uint256 _amount) private {
        User storage user = users[_user];
        
        // 50% al patrocinador
        if (user.sponsor != address(0)) {
            uint256 sponsorCommission = (_amount * SPONSOR_PERCENT) / 100;
            payable(user.sponsor).transfer(sponsorCommission);
            users[user.sponsor].totalEarned += sponsorCommission;
            
            _recordTransaction(user.sponsor, sponsorCommission, "commission", _user);
            emit CommissionPaid(_user, user.sponsor, sponsorCommission, "sponsor");
        }
        
        // 25% al upline
        if (user.upline != address(0)) {
            uint256 uplineCommission = (_amount * UPLINE_PERCENT) / 100;
            payable(user.upline).transfer(uplineCommission);
            users[user.upline].totalEarned += uplineCommission;
            
            _recordTransaction(user.upline, uplineCommission, "commission", _user);
            emit CommissionPaid(_user, user.upline, uplineCommission, "upline");
        }
        
        // 25% a quemar
        uint256 burnAmount = (_amount * BURN_PERCENT) / 100;
        payable(BURN_ADDRESS).transfer(burnAmount);
        totalBurned += burnAmount;
        
        _recordTransaction(BURN_ADDRESS, burnAmount, "burn", _user);
        emit TRXBurned(burnAmount, totalBurned);
    }
    
    /**
     * @dev Registra una transacción
     */
    function _recordTransaction(
        address _user,
        uint256 _amount,
        string memory _type,
        address _related
    ) private {
        Transaction memory txn = Transaction({
            user: _user,
            amount: _amount,
            timestamp: block.timestamp,
            transactionType: _type,
            relatedAddress: _related
        });
        
        userTransactions[_user].push(txn);
        allTransactions.push(txn);
    }
    
    /**
     * @dev Obtiene información del usuario
     */
    function getUserInfo(address _user) external view returns (
        address userAddress,
        address sponsor,
        address upline,
        uint256 referralCode,
        uint256 totalInvested,
        uint256 totalEarned,
        uint256 totalReferrals,
        uint256 matrixLevel,
        bool isActive
    ) {
        User memory user = users[_user];
        return (
            user.userAddress,
            user.sponsor,
            user.upline,
            user.referralCode,
            user.totalInvested,
            user.totalEarned,
            user.totalReferrals,
            user.matrixLevel,
            user.isActive
        );
    }
    
    /**
     * @dev Obtiene transacciones del usuario
     */
    function getUserTransactions(address _user) external view returns (Transaction[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Obtiene referidos del usuario
     */
    function getUserReferrals(address _user) external view returns (address[] memory) {
        return userReferrals[_user];
    }
    
    /**
     * @dev Obtiene estadísticas globales
     */
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalInvested,
        uint256 _totalBurned,
        uint256 _burnPercentage
    ) {
        uint256 burnPercentage = totalInvested > 0 
            ? (totalBurned * 100) / totalInvested 
            : 0;
            
        return (totalUsers, totalInvested, totalBurned, burnPercentage);
    }
    
    /**
     * @dev Verifica si una dirección está registrada
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return users[_user].isActive;
    }
    
    /**
     * @dev Obtiene dirección por código de referido
     */
    function getAddressByReferralCode(uint256 _code) external view returns (address) {
        return referralCodeToAddress[_code];
    }
    
    /**
     * @notice NO HAY FUNCIONES DE RETIRO DEL OWNER
     * @notice NO HAY FUNCIONES PARA PAUSAR EL CONTRATO
     * @notice NO HAY FUNCIONES PARA CAMBIAR PORCENTAJES
     * @notice EL CONTRATO ES COMPLETAMENTE DESCENTRALIZADO
     */
}