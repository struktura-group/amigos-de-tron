// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITRC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract TRXMatrix {
    address public owner;
    address public constant BURN_ADDRESS = address(0x000000000000000000000000000000000000dEaD);
    
    uint256 public constant PRE_LAUNCH_DURATION = 90 days;
    uint256 public launchTime;
    
    // Supply total de TRX (aproximado)
    uint256 public constant TOTAL_TRX_SUPPLY = 100_000_000_000 * 1e6; // 100 mil millones TRX
    uint256 public constant BURN_GOAL = TOTAL_TRX_SUPPLY * 25 / 100; // 25% del supply
    
    bool public projectActive = true;
    bool public paused = false;
    
    struct User {
        address sponsor;
        uint256 registrationTime;
        uint8 plan;
        bool isActive;
        uint256 matrixPosition;
        uint256 directCommissions;
        uint256 cycleCommissions;
        uint256 adsPosted;
        uint256 totalEarnings;
        uint256 pendingWithdrawal;
    }
    
    struct Ad {
        address advertiser;
        string title;
        string description;
        string bannerUrl;
        string targetUrl;
        uint256 timestamp;
        bool approved;
        bool featured;
    }
    
    mapping(address => User) public users;
    mapping(uint256 => Ad) public ads;
    mapping(address => uint256[]) public userAds;
    mapping(uint256 => address) public matrixPositions;
    mapping(uint256 => address[]) public matrixDownlines;
    
    uint256 public totalUsers;
    uint256 public totalAds;
    uint256 public totalTRXBurned;
    uint256 public currentMatrixPosition;
    uint256 public reinvestmentFund;
    uint256 public serviceFund;
    
    uint256 public constant BURN_PERCENTAGE = 25; // 25% para quema
    uint256 public constant SERVICE_FEE = 25; // 25% fee de servicio
    
    event UserRegistered(address indexed user, address indexed sponsor, uint256 timestamp);
    event PlanActivated(address indexed user, uint8 plan, uint256 amount);
    event MatrixCycled(address indexed user, uint256 cycleEarnings, uint256 sponsorBonus);
    event AdPosted(address indexed advertiser, uint256 adId, uint256 timestamp);
    event AdApproved(uint256 indexed adId, uint256 timestamp);
    event TRXBurned(uint256 amount, uint256 totalBurned, uint256 timestamp);
    event Reinvestment(address indexed user, uint256 amount, uint256 newPositions);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event ProjectClosed(uint256 totalBurned, uint256 timestamp);
    event ContractPaused(uint256 timestamp);
    event ContractUnpaused(uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isActive, "User not registered");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier whenActive() {
        require(projectActive, "Project has reached burn goal and closed");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        launchTime = block.timestamp + PRE_LAUNCH_DURATION;
        
        // Registrar al owner como primer usuario
        users[owner] = User({
            sponsor: address(0),
            registrationTime: block.timestamp,
            plan: 3, // Elite
            isActive: true,
            matrixPosition: 1,
            directCommissions: 0,
            cycleCommissions: 0,
            adsPosted: 0,
            totalEarnings: 0,
            pendingWithdrawal: 0
        });
        
        matrixPositions[1] = owner;
        matrixDownlines[1] = new address[](0);
        totalUsers = 1;
        currentMatrixPosition = 1;
    }
    
    function register(address sponsor) external payable whenNotPaused whenActive {
        require(!users[msg.sender].isActive, "User already registered");
        require(users[sponsor].isActive, "Invalid sponsor");
        require(msg.value == 35 trx, "Registration fee must be 35 TRX");
        
        // Distribución de 35 TRX
        uint256 directCommission = 10 trx;
        uint256 matrixEntry = 25 trx;
        
        // Comisión directa al sponsor (acumular para retiro)
        users[sponsor].directCommissions += directCommission;
        users[sponsor].pendingWithdrawal += directCommission;
        users[sponsor].totalEarnings += directCommission;
        
        // Entrada a la matriz
        currentMatrixPosition++;
        matrixPositions[currentMatrixPosition] = msg.sender;
        matrixDownlines[currentMatrixPosition] = new address[](0);
        
        // Registrar usuario
        users[msg.sender] = User({
            sponsor: sponsor,
            registrationTime: block.timestamp,
            plan: 1, // Plan Básico
            isActive: true,
            matrixPosition: currentMatrixPosition,
            directCommissions: 0,
            cycleCommissions: 0,
            adsPosted: 0,
            totalEarnings: 0,
            pendingWithdrawal: 0
        });
        
        totalUsers++;
        
        // Colocar en matriz y verificar ciclos
        _placeInMatrix(msg.sender, matrixEntry);
        
        emit UserRegistered(msg.sender, sponsor, block.timestamp);
    }
    
    function _placeInMatrix(address user, uint256 amount) internal {
        uint256 position = users[user].matrixPosition;
        
        // Encontrar padre en matriz 1x2
        uint256 parentPosition = (position - 1) / 2;
        if (parentPosition > 0 && parentPosition <= currentMatrixPosition) {
            matrixDownlines[parentPosition].push(user);
            _checkMatrixCycle(parentPosition, amount);
        }
    }
    
    function _checkMatrixCycle(uint256 position, uint256 entryAmount) internal {
        address user = matrixPositions[position];
        
        if (matrixDownlines[position].length >= 2) {
            // CICLO COMPLETADO - Distribuir 25 TRX
            uint256 userEarnings = 10 trx;        // 40% al usuario
            uint256 sponsorBonus = 2.5 trx;       // 10% al sponsor
            uint256 burnAmount = 6.25 trx;        // 25% quema
            uint256 serviceFee = 6.25 trx;        // 25% servicio
            
            // Acumular ganancias del usuario
            users[user].cycleCommissions += userEarnings;
            users[user].pendingWithdrawal += userEarnings;
            users[user].totalEarnings += userEarnings;
            
            // Bono al sponsor
            address sponsor = users[user].sponsor;
            if (sponsor != address(0)) {
                users[sponsor].directCommissions += sponsorBonus;
                users[sponsor].pendingWithdrawal += sponsorBonus;
                users[sponsor].totalEarnings += sponsorBonus;
            }
            
            // Quemar TRX
            _burnTRX(burnAmount);
            
            // Fee de servicio
            serviceFund += serviceFee;
            
            emit MatrixCycled(user, userEarnings, sponsorBonus);
            
            // Reiniciar matriz del usuario - crear nueva posición
            currentMatrixPosition++;
            matrixPositions[currentMatrixPosition] = user;
            matrixDownlines[currentMatrixPosition] = new address[](0);
            users[user].matrixPosition = currentMatrixPosition;
            
            // Limpiar downlines anteriores
            delete matrixDownlines[position];
        }
    }
    
    function activatePlan(uint8 plan) external payable onlyRegistered whenNotPaused whenActive {
        require(block.timestamp >= launchTime, "Pre-launch period active");
        require(plan >= 1 && plan <= 3, "Invalid plan");
        require(plan > users[msg.sender].plan, "Cannot downgrade plan");
        
        uint256 requiredAmount;
        if (plan == 1) requiredAmount = 35 trx;
        else if (plan == 2) requiredAmount = 100 trx;
        else requiredAmount = 250 trx;
        
        require(msg.value == requiredAmount, "Incorrect amount for selected plan");
        
        users[msg.sender].plan = plan;
        
        // Distribución según plan
        _distributePlanFunds(plan, msg.value);
        
        emit PlanActivated(msg.sender, plan, msg.value);
    }
    
    function _distributePlanFunds(uint8 plan, uint256 amount) internal {
        address sponsor = users[msg.sender].sponsor;
        
        if (plan == 1) {
            // Plan Básico: 10 TRX comisión, 25 TRX matriz
            if (sponsor != address(0)) {
                users[sponsor].directCommissions += 10 trx;
                users[sponsor].pendingWithdrawal += 10 trx;
                users[sponsor].totalEarnings += 10 trx;
            }
            _placeInMatrix(msg.sender, 25 trx);
            
        } else if (plan == 2) {
            // Plan Master: 25 TRX comisión, 25 TRX matriz, 25 TRX reinversión, 25 TRX servicio
            if (sponsor != address(0)) {
                users[sponsor].directCommissions += 25 trx;
                users[sponsor].pendingWithdrawal += 25 trx;
                users[sponsor].totalEarnings += 25 trx;
            }
            _placeInMatrix(msg.sender, 25 trx);
            reinvestmentFund += 25 trx;
            serviceFund += 25 trx;
            
        } else {
            // Plan Elite: 100 TRX comisión, 25 TRX matriz, 75 TRX reinversión, 50 TRX servicio
            if (sponsor != address(0)) {
                users[sponsor].directCommissions += 100 trx;
                users[sponsor].pendingWithdrawal += 100 trx;
                users[sponsor].totalEarnings += 100 trx;
            }
            _placeInMatrix(msg.sender, 25 trx);
            reinvestmentFund += 75 trx;
            serviceFund += 50 trx;
        }
        
        // Ejecutar reinversión automática si hay fondos suficientes
        _executeReinvestment();
    }
    
    function _executeReinvestment() internal {
        // Crear posiciones internas cuando hay suficiente fondo
        while (reinvestmentFund >= 35 trx) {
            reinvestmentFund -= 35 trx;
            
            // Crear posición interna (sin usuario real)
            currentMatrixPosition++;
            address internalPosition = address(uint160(uint256(keccak256(abi.encodePacked(currentMatrixPosition, block.timestamp)))));
            matrixPositions[currentMatrixPosition] = internalPosition;
            matrixDownlines[currentMatrixPosition] = new address[](0);
            
            // Colocar en matriz
            uint256 parentPosition = (currentMatrixPosition - 1) / 2;
            if (parentPosition > 0) {
                matrixDownlines[parentPosition].push(internalPosition);
                _checkMatrixCycle(parentPosition, 25 trx);
            }
            
            emit Reinvestment(internalPosition, 35 trx, 1);
        }
    }
    
    function withdraw() external onlyRegistered whenNotPaused {
        uint256 amount = users[msg.sender].pendingWithdrawal;
        require(amount > 0, "No funds to withdraw");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        users[msg.sender].pendingWithdrawal = 0;
        payable(msg.sender).transfer(amount);
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    function postAd(
        string memory title,
        string memory description,
        string memory bannerUrl,
        string memory targetUrl,
        bool featured
    ) external payable onlyRegistered whenNotPaused whenActive {
        uint256 minFee = featured ? 10 trx : 1 trx;
        require(msg.value >= minFee, "Insufficient ad fee");
        
        uint256 adId = totalAds++;
        ads[adId] = Ad({
            advertiser: msg.sender,
            title: title,
            description: description,
            bannerUrl: bannerUrl,
            targetUrl: targetUrl,
            timestamp: block.timestamp,
            approved: false,
            featured: featured
        });
        
        userAds[msg.sender].push(adId);
        users[msg.sender].adsPosted++;
        
        // Distribución del fee de publicidad
        uint256 burnAmount = msg.value * BURN_PERCENTAGE / 100;
        uint256 serviceAmount = msg.value - burnAmount;
        
        _burnTRX(burnAmount);
        serviceFund += serviceAmount;
        
        emit AdPosted(msg.sender, adId, block.timestamp);
    }
    
    function approveAd(uint256 adId) external onlyOwner {
        require(adId < totalAds, "Invalid ad ID");
        require(!ads[adId].approved, "Ad already approved");
        
        ads[adId].approved = true;
        emit AdApproved(adId, block.timestamp);
    }
    
    function _burnTRX(uint256 amount) internal {
        if (amount > 0) {
            payable(BURN_ADDRESS).transfer(amount);
            totalTRXBurned += amount;
            
            emit TRXBurned(amount, totalTRXBurned, block.timestamp);
            
            // Verificar si se alcanzó el objetivo del 25%
            if (totalTRXBurned >= BURN_GOAL && projectActive) {
                projectActive = false;
                emit ProjectClosed(totalTRXBurned, block.timestamp);
            }
        }
    }
    
    function withdrawServiceFunds() external onlyOwner {
        require(serviceFund > 0, "No service funds available");
        uint256 amount = serviceFund;
        serviceFund = 0;
        payable(owner).transfer(amount);
    }
    
    function pauseContract() external onlyOwner {
        paused = true;
        emit ContractPaused(block.timestamp);
    }
    
    function unpauseContract() external onlyOwner {
        paused = false;
        emit ContractUnpaused(block.timestamp);
    }
    
    function getPreLaunchTimeLeft() public view returns (uint256) {
        if (block.timestamp >= launchTime) return 0;
        return launchTime - block.timestamp;
    }
    
    function getBurnProgress() public view returns (uint256 percentage) {
        return (totalTRXBurned * 100) / BURN_GOAL;
    }
    
    function getUserStats(address user) public view returns (
        uint256 registrationTime,
        uint8 plan,
        uint256 matrixPosition,
        uint256 directCommissions,
        uint256 cycleCommissions,
        uint256 totalEarnings,
        uint256 pendingWithdrawal,
        uint256 adsPosted,
        uint256 preLaunchTimeLeft
    ) {
        User storage u = users[user];
        return (
            u.registrationTime,
            u.plan,
            u.matrixPosition,
            u.directCommissions,
            u.cycleCommissions,
            u.totalEarnings,
            u.pendingWithdrawal,
            u.adsPosted,
            getPreLaunchTimeLeft()
        );
    }
    
    function getContractStats() public view returns (
        uint256 _totalUsers,
        uint256 _totalTRXBurned,
        uint256 _burnProgress,
        uint256 _reinvestmentFund,
        uint256 _serviceFund,
        uint256 _preLaunchTimeLeft,
        bool _projectActive,
        bool _paused
    ) {
        return (
            totalUsers,
            totalTRXBurned,
            getBurnProgress(),
            reinvestmentFund,
            serviceFund,
            getPreLaunchTimeLeft(),
            projectActive,
            paused
        );
    }
    
    function getMatrixDownlines(uint256 position) public view returns (address[] memory) {
        return matrixDownlines[position];
    }
    
    function getUserAds(address user) public view returns (uint256[] memory) {
        return userAds[user];
    }
    
    function getAd(uint256 adId) public view returns (
        address advertiser,
        string memory title,
        string memory description,
        string memory bannerUrl,
        string memory targetUrl,
        uint256 timestamp,
        bool approved,
        bool featured
    ) {
        require(adId < totalAds, "Invalid ad ID");
        Ad storage ad = ads[adId];
        return (
            ad.advertiser,
            ad.title,
            ad.description,
            ad.bannerUrl,
            ad.targetUrl,
            ad.timestamp,
            ad.approved,
            ad.featured
        );
    }
    
    receive() external payable {}
}