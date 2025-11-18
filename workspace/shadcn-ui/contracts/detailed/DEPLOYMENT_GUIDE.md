# Guía de Deployment - AMIGOS DE TRON Smart Contract

## 📋 Información del Contrato

**Nombre:** AmigosDeTronComplete.sol  
**Versión:** 1.0.0  
**Solidity:** ^0.8.0  
**Red:** TRON Mainnet / Shasta Testnet

---

## 🚀 Pasos para Deployar

### 1. Preparación

Antes de deployar, necesitas:

- ✅ Wallet con TRX para gas fees
- ✅ TronLink Pro o TronBox instalado
- ✅ Dirección de la empresa de servicios (serviceCompanyAddress)

### 2. Compilación

```bash
# Usando TronBox
tronbox compile

# O usando Remix IDE
# 1. Ir a https://remix.ethereum.org/
# 2. Cambiar compiler a TRON
# 3. Pegar el código del contrato
# 4. Compilar con Solidity 0.8.0+
```

### 3. Deployment

#### Opción A: TronBox

```javascript
// migrations/2_deploy_contracts.js
const AmigosDeTronComplete = artifacts.require("AmigosDeTronComplete");

module.exports = function(deployer) {
  const serviceCompanyAddress = "TU_DIRECCION_DE_EMPRESA_AQUI";
  deployer.deploy(AmigosDeTronComplete, serviceCompanyAddress);
};
```

```bash
# Deploy en Shasta Testnet
tronbox migrate --network shasta

# Deploy en Mainnet
tronbox migrate --network mainnet
```

#### Opción B: TronLink + Remix

1. Abrir Remix IDE
2. Compilar el contrato
3. Ir a "Deploy & Run Transactions"
4. Seleccionar "Injected Web3" (TronLink)
5. Ingresar `serviceCompanyAddress` en el constructor
6. Click en "Deploy"
7. Confirmar transacción en TronLink

#### Opción C: TronScan Contract Deployment

1. Ir a https://tronscan.org/#/contracts/contract-compiler
2. Subir el archivo .sol
3. Compilar
4. Deploy con los parámetros del constructor

---

## 🔧 Configuración Post-Deployment

### 1. Verificar el Contrato

```bash
# En TronScan
https://tronscan.org/#/contract/[CONTRACT_ADDRESS]

# Verificar código fuente
# 1. Ir a la pestaña "Contract"
# 2. Click en "Verify Contract"
# 3. Subir código fuente
# 4. Confirmar compilación
```

### 2. Actualizar Frontend

Después del deployment, actualiza estos archivos:

**`src/lib/contractInteraction.ts`**

```typescript
// Cambiar esta línea:
export const CONTRACT_ADDRESS = 'TBD';

// Por:
export const CONTRACT_ADDRESS = 'TU_DIRECCION_DE_CONTRATO_AQUI';
```

### 3. Probar Funciones Básicas

```javascript
// Usando TronWeb
const tronWeb = window.tronWeb;
const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

// 1. Verificar owner inicial
const owner = await contract.users(tronWeb.defaultAddress.base58).call();
console.log('Owner referral code:', owner.referralCode.toString());

// 2. Registrar un usuario de prueba
await contract.register(100000).send({
  feeLimit: 100_000_000,
  callValue: 0
});

// 3. Activar Plan Básico
await contract.activateBasicPlan().send({
  feeLimit: 100_000_000,
  callValue: 35_000_000
});

// 4. Ver estadísticas globales
const stats = await contract.getGlobalStats().call();
console.log('Total users:', stats._totalUsers.toString());
console.log('Total burned:', stats._totalBurned.toString());
```

---

## 📊 Parámetros del Constructor

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `serviceCompanyAddress` | address | Dirección que recibirá las comisiones de empresa | `TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9` |

---

## 🔐 Seguridad Post-Deployment

### Checklist de Seguridad

- [ ] Verificar que `serviceCompanyAddress` es correcta
- [ ] Confirmar que el owner inicial tiene código 100000
- [ ] Probar registro de usuarios
- [ ] Probar activación de cada plan
- [ ] Verificar distribución de comisiones
- [ ] Confirmar funcionamiento de matriz 1x2
- [ ] Probar ciclos y reposicionamiento
- [ ] Verificar creación automática de cuentas
- [ ] Confirmar quema de TRX
- [ ] Auditar código en TronScan

### Funciones Críticas a Probar

```javascript
// 1. Registro
await contract.register(sponsorCode).send();

// 2. Activación de planes
await contract.activateBasicPlan().send({ callValue: 35_000_000 });
await contract.activateMasterPlan().send({ callValue: 100_000_000 });
await contract.activatePremiumPlan().send({ callValue: 250_000_000 });

// 3. Consultas
await contract.getUserInfo(address).call();
await contract.getUserMatrixInfo(address, planId).call();
await contract.getGlobalStats().call();

// 4. Quema directa
await contract.burnTRX().send({ callValue: amount });
```

---

## 📝 Notas Importantes

### Valores Fijos en el Contrato

```solidity
PLAN_BASIC = 35,000,000 SUN (35 TRX)
PLAN_MASTER = 100,000,000 SUN (100 TRX)
PLAN_PREMIUM = 250,000,000 SUN (250 TRX)

PRE_LAUNCH_DURATION = 90 days
REINVESTMENT_THRESHOLD_LOW = 2,000,000,000 SUN (2000 TRX)

BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD
```

### Distribuciones por Plan

**Plan Básico (35 TRX):**
- 10 TRX → Sponsor directo
- 25 TRX → Matriz
- Al ciclar: 10 TRX usuario + 2.5 TRX sponsor + 12.5 TRX quema

**Plan Master (100 TRX):**
- 25 TRX → Matriz
- 25 TRX → Sponsor
- 25 TRX → Empresa
- 25 TRX → Reinversión

**Plan Premium (250 TRX):**
- 25 TRX → Matriz
- 100 TRX → Sponsor
- 75 TRX → Empresa
- 50 TRX → Reinversión

### Gas Fees Estimados

| Operación | Gas Estimado (TRX) |
|-----------|-------------------|
| Deploy | ~500-1000 TRX |
| Register | ~50-100 TRX |
| Activate Plan | ~100-200 TRX |
| Matrix Cycle | ~150-250 TRX |

---

## 🐛 Troubleshooting

### Error: "Usuario ya registrado"
- El usuario ya tiene una cuenta activa
- Usar otra wallet

### Error: "Monto incorrecto"
- Verificar que envías exactamente 35, 100 o 250 TRX
- Convertir a SUN: TRX * 1,000,000

### Error: "Plan ya activo"
- El usuario ya activó ese plan
- Puede activar otros planes

### Error: "Sponsor no existe"
- El código de referido no es válido
- Verificar que el sponsor esté registrado

---

## 📞 Soporte

Para problemas con el deployment:

1. Revisar logs de TronScan
2. Verificar balance de TRX
3. Confirmar red correcta (Mainnet/Testnet)
4. Revisar permisos de la wallet

---

## ✅ Deployment Checklist Final

Antes de considerar el deployment completo:

- [ ] Contrato deployado exitosamente
- [ ] Dirección del contrato guardada
- [ ] Código verificado en TronScan
- [ ] Frontend actualizado con la dirección
- [ ] Funciones básicas probadas
- [ ] Matriz 1x2 funcionando
- [ ] Ciclos y reposicionamiento OK
- [ ] Reinversión automática OK
- [ ] Quema de TRX funcionando
- [ ] Pre-Launch activado
- [ ] Documentación actualizada

---

**Fecha de última actualización:** 2025-01-16  
**Versión del contrato:** 1.0.0  
**Estado:** Listo para deployment