# 🧪 Ejemplos de Testing - AMIGOS DE TRON

## 📋 Tabla de Contenidos
1. [Tests Básicos](#tests-básicos)
2. [Tests de Planes](#tests-de-planes)
3. [Tests de Matriz](#tests-de-matriz)
4. [Tests de Renovación](#tests-de-renovación)
5. [Tests de Administración](#tests-de-administración)
6. [Casos de Prueba Completos](#casos-de-prueba-completos)

---

## 🔧 Tests Básicos

### Test 1: Deployment y Configuración Inicial

```javascript
const TronWeb = require('tronweb');

async function testDeployment() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    
    // Verificar owner
    const owner = await contract.owner().call();
    console.log('✅ Owner:', owner);
    
    // Verificar constantes
    const basicPlan = await contract.PLAN_BASIC().call();
    console.log('✅ Plan Básico:', basicPlan.toString(), 'SUN (35 TRX)');
    
    const masterPlan = await contract.PLAN_MASTER().call();
    console.log('✅ Plan Master:', masterPlan.toString(), 'SUN (100 TRX)');
    
    const premiumPlan = await contract.PLAN_PREMIUM().call();
    console.log('✅ Plan Premium:', premiumPlan.toString(), 'SUN (250 TRX)');
    
    // Verificar estadísticas iniciales
    const stats = await contract.getGlobalStats().call();
    console.log('✅ Total Usuarios:', stats._totalUsers.toString());
    console.log('✅ Total Quemado:', stats._totalBurned.toString());
}

testDeployment();
```

### Test 2: Registro de Usuario

```javascript
async function testUserRegistration() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    
    const userAddress = tronWeb.defaultAddress.base58;
    
    try {
        // Registrar con código de sponsor (owner = 100000)
        const tx = await contract.register(100000).send({
            shouldPollResponse: true
        });
        
        console.log('✅ Usuario registrado. TX:', tx);
        
        // Verificar información del usuario
        const userInfo = await contract.getUserInfo(userAddress).call();
        console.log('✅ Código de referido:', userInfo.referralCode.toString());
        console.log('✅ Sponsor:', userInfo.sponsor);
        console.log('✅ Pre-Launch activo:', userInfo.preLaunchActive);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testUserRegistration();
```

---

## 💰 Tests de Planes

### Test 3: Activar Plan Básico

```javascript
async function testBasicPlan() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    const userAddress = tronWeb.defaultAddress.base58;
    
    try {
        // Activar Plan Básico (35 TRX)
        const tx = await contract.activateBasicPlan().send({
            callValue: 35_000_000, // 35 TRX en SUN
            shouldPollResponse: true
        });
        
        console.log('✅ Plan Básico activado. TX:', tx);
        
        // Verificar activación
        const userInfo = await contract.getUserInfo(userAddress).call();
        console.log('✅ Plan Básico activo:', userInfo.basicActive);
        
        // Verificar posición en matriz
        const matrixInfo = await contract.getUserMatrixInfo(userAddress).call();
        console.log('✅ Posición en matriz:', matrixInfo.positionId.toString());
        console.log('✅ Upline:', matrixInfo.upline);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testBasicPlan();
```

### Test 4: Activar Plan Master

```javascript
async function testMasterPlan() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    const userAddress = tronWeb.defaultAddress.base58;
    
    try {
        // Activar Plan Master (100 TRX)
        const tx = await contract.activateMasterPlan().send({
            callValue: 100_000_000, // 100 TRX en SUN
            shouldPollResponse: true
        });
        
        console.log('✅ Plan Master activado. TX:', tx);
        
        // Verificar activación
        const userInfo = await contract.getUserInfo(userAddress).call();
        console.log('✅ Plan Master activo:', userInfo.masterActive);
        
        // Verificar fondos de reinversión
        const stats = await contract.getGlobalStats().call();
        console.log('✅ Balance de reinversión:', stats._reinvestmentBalance.toString());
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testMasterPlan();
```

### Test 5: Activar Plan Premium

```javascript
async function testPremiumPlan() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    const userAddress = tronWeb.defaultAddress.base58;
    
    try {
        // Activar Plan Premium (250 TRX)
        const tx = await contract.activatePremiumPlan().send({
            callValue: 250_000_000, // 250 TRX en SUN
            shouldPollResponse: true
        });
        
        console.log('✅ Plan Premium activado. TX:', tx);
        
        // Verificar activación
        const userInfo = await contract.getUserInfo(userAddress).call();
        console.log('✅ Plan Premium activo:', userInfo.premiumActive);
        
        // Verificar estadísticas
        const stats = await contract.getGlobalStats().call();
        console.log('✅ Total Premium:', stats._premiumCount.toString());
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPremiumPlan();
```

---

## 🔄 Tests de Matriz

### Test 6: Verificar Ciclo Completo

```javascript
async function testMatrixCycle() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    const userAddress = tronWeb.defaultAddress.base58;
    
    // Verificar información de matriz antes
    const matrixInfoBefore = await contract.getUserMatrixInfo(userAddress).call();
    console.log('📊 Ciclos antes:', matrixInfoBefore.cycles.toString());
    console.log('📊 Hijos antes:', matrixInfoBefore.children.length);
    
    // Simular que se completa un ciclo (necesitas 2 usuarios debajo)
    // Este test requiere que hayas registrado 2 usuarios debajo de ti
    
    // Verificar información después del ciclo
    const matrixInfoAfter = await contract.getUserMatrixInfo(userAddress).call();
    console.log('✅ Ciclos después:', matrixInfoAfter.cycles.toString());
    console.log('✅ Hijos después:', matrixInfoAfter.children.length);
    
    // Verificar ganancias
    const userInfo = await contract.getUserInfo(userAddress).call();
    console.log('✅ Total ganado:', userInfo.totalEarned.toString(), 'SUN');
}

testMatrixCycle();
```

---

## 🔄 Tests de Renovación

### Test 7: Verificar Renovación Automática

```javascript
async function testRenewal() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    const userAddress = tronWeb.defaultAddress.base58;
    
    // Obtener información de renovación
    const renewalInfo = await contract.getUserRenewalInfo(userAddress).call();
    
    console.log('📊 Ciclos de renovación Básico:', renewalInfo.basicCycles.toString());
    console.log('📊 Ciclos de renovación Master:', renewalInfo.masterCycles.toString());
    console.log('📊 Ciclos de renovación Premium:', renewalInfo.premiumCycles.toString());
    console.log('📊 Próxima renovación Básico en:', renewalInfo.nextBasicRenewal.toString(), 'ciclos');
    console.log('📊 Próxima renovación Premium en:', renewalInfo.nextPremiumRenewal.toString(), 'ciclos');
    
    // Verificar fondos de renovación acumulados
    const stats = await contract.getGlobalStats().call();
    console.log('✅ Fondos de renovación:', stats._renewalFees.toString(), 'SUN');
}

testRenewal();
```

---

## 👑 Tests de Administración

### Test 8: Funciones de Owner

```javascript
async function testOwnerFunctions() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY_DE_OWNER'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    
    try {
        // Test 1: Actualizar dirección de servicio
        const newServiceAddress = 'NUEVA_DIRECCION_AQUI';
        const tx1 = await contract.updateServiceAddress(newServiceAddress).send({
            shouldPollResponse: true
        });
        console.log('✅ Dirección de servicio actualizada. TX:', tx1);
        
        // Test 2: Retirar fondos de renovación
        const stats = await contract.getGlobalStats().call();
        const renewalFees = stats._renewalFees;
        
        if (renewalFees > 0) {
            const tx2 = await contract.withdrawRenewalFees(renewalFees).send({
                shouldPollResponse: true
            });
            console.log('✅ Fondos de renovación retirados. TX:', tx2);
        }
        
        // Test 3: Retirar reserva de gas
        const gasReserve = stats._gasReserve;
        
        if (gasReserve > 0) {
            const tx3 = await contract.withdrawGasReserve(gasReserve).send({
                shouldPollResponse: true
            });
            console.log('✅ Reserva de gas retirada. TX:', tx3);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testOwnerFunctions();
```

---

## 📊 Casos de Prueba Completos

### Caso de Prueba 1: Flujo Completo de Usuario

```javascript
async function testCompleteUserFlow() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    const userAddress = tronWeb.defaultAddress.base58;
    
    console.log('🚀 Iniciando flujo completo de usuario...\n');
    
    try {
        // Paso 1: Registro
        console.log('📝 Paso 1: Registrando usuario...');
        await contract.register(100000).send({ shouldPollResponse: true });
        console.log('✅ Usuario registrado\n');
        
        // Paso 2: Verificar registro
        console.log('🔍 Paso 2: Verificando registro...');
        const userInfo = await contract.getUserInfo(userAddress).call();
        console.log('✅ Código de referido:', userInfo.referralCode.toString());
        console.log('✅ Pre-Launch hasta:', new Date(userInfo.preLaunchEndTime * 1000).toLocaleString());
        console.log('');
        
        // Paso 3: Activar Plan Básico
        console.log('💰 Paso 3: Activando Plan Básico...');
        await contract.activateBasicPlan().send({
            callValue: 35_000_000,
            shouldPollResponse: true
        });
        console.log('✅ Plan Básico activado\n');
        
        // Paso 4: Verificar posición en matriz
        console.log('🔄 Paso 4: Verificando posición en matriz...');
        const matrixInfo = await contract.getUserMatrixInfo(userAddress).call();
        console.log('✅ Posición ID:', matrixInfo.positionId.toString());
        console.log('✅ Upline:', matrixInfo.upline);
        console.log('✅ Ciclos:', matrixInfo.cycles.toString());
        console.log('');
        
        // Paso 5: Ver estadísticas globales
        console.log('📊 Paso 5: Estadísticas globales...');
        const stats = await contract.getGlobalStats().call();
        console.log('✅ Total usuarios:', stats._totalUsers.toString());
        console.log('✅ Total quemado:', (stats._totalBurned / 1_000_000).toFixed(2), 'TRX');
        console.log('✅ Planes Básicos:', stats._basicCount.toString());
        console.log('');
        
        console.log('🎉 ¡Flujo completo exitoso!');
        
    } catch (error) {
        console.error('❌ Error en el flujo:', error.message);
    }
}

testCompleteUserFlow();
```

### Caso de Prueba 2: Simulación de Red de Referidos

```javascript
async function testReferralNetwork() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    
    // Necesitarás múltiples wallets para este test
    const wallets = [
        { privateKey: 'PRIVATE_KEY_1', address: 'ADDRESS_1' },
        { privateKey: 'PRIVATE_KEY_2', address: 'ADDRESS_2' },
        { privateKey: 'PRIVATE_KEY_3', address: 'ADDRESS_3' }
    ];
    
    console.log('🌐 Simulando red de referidos...\n');
    
    try {
        // Usuario 1 se registra bajo el owner (100000)
        console.log('👤 Registrando Usuario 1...');
        let tronWeb1 = new TronWeb({
            fullHost: 'https://api.shasta.trongrid.io',
            privateKey: wallets[0].privateKey
        });
        let contract1 = await tronWeb1.contract().at(contractAddress);
        await contract1.register(100000).send({ shouldPollResponse: true });
        
        const user1Info = await contract.getUserInfo(wallets[0].address).call();
        const user1Code = user1Info.referralCode.toString();
        console.log('✅ Usuario 1 código:', user1Code, '\n');
        
        // Usuario 2 se registra bajo Usuario 1
        console.log('👤 Registrando Usuario 2...');
        let tronWeb2 = new TronWeb({
            fullHost: 'https://api.shasta.trongrid.io',
            privateKey: wallets[1].privateKey
        });
        let contract2 = await tronWeb2.contract().at(contractAddress);
        await contract2.register(parseInt(user1Code)).send({ shouldPollResponse: true });
        
        const user2Info = await contract.getUserInfo(wallets[1].address).call();
        console.log('✅ Usuario 2 código:', user2Info.referralCode.toString());
        console.log('✅ Sponsor de Usuario 2:', user2Info.sponsor, '\n');
        
        // Usuario 3 se registra bajo Usuario 2
        console.log('👤 Registrando Usuario 3...');
        let tronWeb3 = new TronWeb({
            fullHost: 'https://api.shasta.trongrid.io',
            privateKey: wallets[2].privateKey
        });
        let contract3 = await tronWeb3.contract().at(contractAddress);
        await contract3.register(parseInt(user2Info.referralCode.toString())).send({ shouldPollResponse: true });
        
        console.log('✅ Usuario 3 registrado\n');
        
        // Verificar red de referidos del Usuario 1
        console.log('🔍 Verificando referidos de Usuario 1...');
        const referrals = await contract.getUserReferralsPaginated(wallets[0].address, 0, 10).call();
        console.log('✅ Total referidos directos:', referrals.total.toString());
        console.log('✅ Referidos:', referrals.referrals);
        
        console.log('\n🎉 Red de referidos creada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testReferralNetwork();
```

---

## 🔥 Test de Quema de TRX

```javascript
async function testBurnTRX() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    
    try {
        // Ver total quemado antes
        const statsBefore = await contract.getGlobalStats().call();
        console.log('🔥 Total quemado antes:', (statsBefore._totalBurned / 1_000_000).toFixed(2), 'TRX');
        
        // Quemar 10 TRX
        const tx = await contract.burnTRX().send({
            callValue: 10_000_000, // 10 TRX
            shouldPollResponse: true
        });
        console.log('✅ TRX quemados. TX:', tx);
        
        // Ver total quemado después
        const statsAfter = await contract.getGlobalStats().call();
        console.log('🔥 Total quemado después:', (statsAfter._totalBurned / 1_000_000).toFixed(2), 'TRX');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testBurnTRX();
```

---

## 📈 Monitor de Estadísticas en Tiempo Real

```javascript
async function monitorStats() {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: 'TU_PRIVATE_KEY'
    });
    
    const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
    const contract = await tronWeb.contract().at(contractAddress);
    
    console.log('📊 Monitor de Estadísticas - Actualización cada 30 segundos\n');
    
    setInterval(async () => {
        try {
            const stats = await contract.getGlobalStats().call();
            const balance = await contract.getContractBalance().call();
            
            console.clear();
            console.log('═══════════════════════════════════════════════');
            console.log('📊 ESTADÍSTICAS DEL CONTRATO');
            console.log('═══════════════════════════════════════════════');
            console.log('👥 Total Usuarios:', stats._totalUsers.toString());
            console.log('💰 Balance del Contrato:', (balance / 1_000_000).toFixed(2), 'TRX');
            console.log('🔥 Total Quemado:', (stats._totalBurned / 1_000_000).toFixed(2), 'TRX');
            console.log('💎 Fondo de Reinversión:', (stats._reinvestmentBalance / 1_000_000).toFixed(2), 'TRX');
            console.log('⛽ Reserva de Gas:', (stats._gasReserve / 1_000_000).toFixed(2), 'TRX');
            console.log('🔄 Fondos de Renovación:', (stats._renewalFees / 1_000_000).toFixed(2), 'TRX');
            console.log('🏭 Cuentas Creadas:', stats._accountsCreated.toString());
            console.log('───────────────────────────────────────────────');
            console.log('📦 Planes Activos:');
            console.log('  • Básico:', stats._basicCount.toString());
            console.log('  • Master:', stats._masterCount.toString());
            console.log('  • Premium:', stats._premiumCount.toString());
            console.log('───────────────────────────────────────────────');
            console.log('🔄 Posiciones en Matriz:', stats._matrixPositions.toString());
            console.log('═══════════════════════════════════════════════');
            console.log('Última actualización:', new Date().toLocaleString());
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }, 30000); // Actualizar cada 30 segundos
}

monitorStats();
```

---

## 🎯 Checklist de Testing

Antes de ir a mainnet, asegúrate de haber probado:

### Funcionalidad Básica
- [ ] Deployment exitoso
- [ ] Verificación del contrato en TronScan
- [ ] Owner configurado correctamente
- [ ] Dirección de empresa configurada

### Registro y Planes
- [ ] Registro de usuario con código válido
- [ ] Activación de Plan Básico (35 TRX)
- [ ] Activación de Plan Master (100 TRX)
- [ ] Activación de Plan Premium (250 TRX)
- [ ] Prevención de doble activación

### Matriz
- [ ] Asignación a matriz funciona
- [ ] Ciclos se completan correctamente
- [ ] Distribución de fondos es exacta
- [ ] Reposicionamiento automático

### Renovación
- [ ] Renovación automática en ciclo 5 (Básico)
- [ ] Renovación automática en ciclo 10 (Master/Premium)
- [ ] Fondos de renovación se acumulan

### Administración
- [ ] Actualización de dirección de empresa
- [ ] Retiro de fondos de renovación
- [ ] Retiro de reserva de gas
- [ ] Transferencia de ownership

### Seguridad
- [ ] Solo owner puede ejecutar funciones admin
- [ ] Transferencias usan call() correctamente
- [ ] Validaciones de direcciones funcionan
- [ ] Prevención de reentrancy

---

## 📝 Notas Finales

1. **Siempre prueba en Shasta Testnet primero**
2. **Usa múltiples wallets para simular usuarios reales**
3. **Monitorea los eventos en TronScan**
4. **Verifica los balances después de cada operación**
5. **Documenta cualquier comportamiento inesperado**

**¡Buena suerte con tus tests! 🚀**