// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AmigosDeTron
 * @dev Smart Contract para sistema matricial 1x2 con quema automática de TRX
 * 
 * CARACTERÍSTICAS DE SEGURIDAD:
 * - NO hay funciones de retiro del owner
 * - NO hay funciones para pausar el contrato
 * - NO hay funciones para cambiar porcentajes
 * - Distribución automática e inmutable: 50% sponsor, 25% upline, 25% quema
 * - Código 100% auditable y open source
 */
contract AmigosDeTron {
    // Planes disponibles (en SUN - 1 TRX = 1,000,000 SUN)
    uint256 public constant PLAN_35 = 35000000;   // 35 TRX
    uint256 public constant PLAN_100 = 100000000;  // 100 TRX
    uint256 public constant PLAN_250 = 250000000;  // 250 TRX
    
    // Dirección de quema (sin clave privada conocida)
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Estructura de usuario
    struct User {
        address userAddress;
        address sponsor;        // Quien lo refirió
        address upline;         // Posición superior en la matriz
        uint256 referralCode;   // Código único de referido
        uint256 totalInvested;  // Total invertido
        uint256 totalEarned;    // Total ganado en comisiones
        uint256 totalReferrals; // Total de referidos directos
        uint256 matrixLevel;    // Nivel en la matriz
        bool isActive;          // Si está activo
        address[] referrals;    // Lista de referidos
    }
    
    // Estructura de transacción
    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
        string transactionType; // "purchase", "commission", "burn"
        address relatedAddress; // Dirección relacionada (sponsor, upline, etc.)
    }
    
    // Mapeos
    mapping(address => User) public users;
    mapping(uint256 => address) public referralCodeToAddress;
    mapping(address => Transaction[]) public userTransactions;
    
    // Variables globales
    uint256 public totalUsers;
    uint256 public totalInvested;
    uint256 public totalBurned;
    uint256 public nextReferralCode = 100000; // Códigos empiezan en 100000
    
    // Eventos
    event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode);
    event PlanPurchased(address indexed user, uint256 amount, uint256 plan);
    event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType);
    event TRXBurned(uint256 amount, uint256 totalBurned);
    event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 level);
    
    /**
     * @dev Registra un nuevo usuario con código de sponsor
     * @param _sponsorCode Código de referido del sponsor
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
        
        // Asignar código de referido
        referralCodeToAddress[nextReferralCode] = msg.sender;
        nextReferralCode++;
        
        // Agregar a lista de referidos del sponsor
        users[sponsor].referrals.push(msg.sender);
        users[sponsor].totalReferrals++;
        
        // Asignar posición en matriz (simplificado)
        _assignMatrixPosition(msg.sender, sponsor);
        
        totalUsers++;
        
        emit UserRegistered(msg.sender, sponsor, users[msg.sender].referralCode);
    }
    
    /**
     * @dev Compra un plan
     * @param _plan Monto del plan (35, 100 o 250 TRX en SUN)
     */
    function purchasePlan(uint256 _plan) external payable {
        require(users[msg.sender].isActive, "Usuario no registrado");
        require(
            _plan == PLAN_35 || _plan == PLAN_100 || _plan == PLAN_250,
            "Plan invalido"
        );
        require(msg.value == _plan, "Monto incorrecto");
        
        address sponsor = users[msg.sender].sponsor;
        address upline = users[msg.sender].upline;
        
        // Actualizar estadísticas del usuario
        users[msg.sender].totalInvested += msg.value;
        totalInvested += msg.value;
        
        // Registrar transacción de compra
        userTransactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            transactionType: "purchase",
            relatedAddress: address(0)
        }));
        
        // Distribución automática e inmutable:
        // 50% al sponsor (referido directo)
        uint256 sponsorCommission = (msg.value * 50) / 100;
        
        // 25% al upline (posición superior en matriz)
        uint256 uplineCommission = (msg.value * 25) / 100;
        
        // 25% a quema
        uint256 burnAmount = (msg.value * 25) / 100;
        
        // Pagar comisión al sponsor
        if (sponsor != address(0)) {
            payable(sponsor).transfer(sponsorCommission);
            users[sponsor].totalEarned += sponsorCommission;
            
            userTransactions[sponsor].push(Transaction({
                user: sponsor,
                amount: sponsorCommission,
                timestamp: block.timestamp,
                transactionType: "commission",
                relatedAddress: msg.sender
            }));
            
            emit CommissionPaid(msg.sender, sponsor, sponsorCommission, "sponsor");
        }
        
        // Pagar comisión al upline
        if (upline != address(0)) {
            payable(upline).transfer(uplineCommission);
            users[upline].totalEarned += uplineCommission;
            
            userTransactions[upline].push(Transaction({
                user: upline,
                amount: uplineCommission,
                timestamp: block.timestamp,
                transactionType: "commission",
                relatedAddress: msg.sender
            }));
            
            emit CommissionPaid(msg.sender, upline, uplineCommission, "upline");
        }
        
        // Quemar TRX (enviar a dirección sin clave privada)
        payable(BURN_ADDRESS).transfer(burnAmount);
        totalBurned += burnAmount;
        
        userTransactions[msg.sender].push(Transaction({
            user: msg.sender,
            amount: burnAmount,
            timestamp: block.timestamp,
            transactionType: "burn",
            relatedAddress: BURN_ADDRESS
        }));
        
        emit TRXBurned(burnAmount, totalBurned);
        emit PlanPurchased(msg.sender, msg.value, _plan);
    }
    
    /**
     * @dev Asigna posición en la matriz 1x2
     * @param _user Usuario a posicionar
     * @param _sponsor Sponsor del usuario
     */
    function _assignMatrixPosition(address _user, address _sponsor) private {
        // Implementación simplificada de matriz 1x2
        // En una implementación completa, buscaría la primera posición disponible
        users[_user].upline = _sponsor;
        users[_user].matrixLevel = users[_sponsor].matrixLevel + 1;
        
        emit MatrixPositionAssigned(_user, _sponsor, users[_user].matrixLevel);
    }
    
    /**
     * @dev Obtiene información completa del usuario
     * @param _user Dirección del usuario
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
     * @param _user Dirección del usuario
     */
    function getUserTransactions(address _user) external view returns (Transaction[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Obtiene lista de referidos del usuario
     * @param _user Dirección del usuario
     */
    function getUserReferrals(address _user) external view returns (address[] memory) {
        return users[_user].referrals;
    }
    
    /**
     * @dev Obtiene estadísticas globales del proyecto
     */
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalInvested,
        uint256 _totalBurned,
        uint256 _burnPercentage
    ) {
        uint256 burnPercentage = 0;
        if (totalInvested > 0) {
            burnPercentage = (totalBurned * 100) / totalInvested;
        }
        return (totalUsers, totalInvested, totalBurned, burnPercentage);
    }
    
    /**
     * @dev Verifica si un usuario está registrado
     * @param _user Dirección del usuario
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return users[_user].isActive;
    }
    
    /**
     * @dev Obtiene dirección por código de referido
     * @param _code Código de referido
     */
    function getAddressByReferralCode(uint256 _code) external view returns (address) {
        return referralCodeToAddress[_code];
    }
    
    /**
     * @dev Inicializa el contrato con el primer usuario (owner)
     * El owner NO tiene privilegios especiales, solo es el primer usuario
     */
    constructor() {
        // Crear primer usuario (owner) con código 100000
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].sponsor = address(0);
        users[msg.sender].upline = address(0);
        users[msg.sender].referralCode = 100000;
        users[msg.sender].isActive = true;
        users[msg.sender].matrixLevel = 0;
        
        referralCodeToAddress[100000] = msg.sender;
        nextReferralCode = 100001;
        totalUsers = 1;
        
        emit UserRegistered(msg.sender, address(0), 100000);
    }
}