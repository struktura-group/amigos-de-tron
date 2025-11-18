# 🚀 Guía de Deployment - AMIGOS DE TRON (Optimizado)

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Deployment con TronBox](#deployment-con-tronbox)
3. [Deployment con TronIDE](#deployment-con-tronide)
4. [Verificación del Contrato](#verificación-del-contrato)
5. [Interacción con el Contrato](#interacción-con-el-contrato)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### 1. Wallet TRON
- Instala [TronLink](https://www.tronlink.org/) (extensión de navegador)
- Crea una wallet o importa una existente
- Guarda tu **private key** de forma segura

### 2. TRX para Gas
- **Testnet (Shasta)**: Obtén TRX gratis en https://www.trongrid.io/shasta/
- **Mainnet**: Compra TRX en exchanges (Binance, Kraken, etc.)

### 3. Herramientas de Desarrollo

**Opción A: TronBox (Línea de comandos)**
```bash
npm install -g tronbox
```

**Opción B: TronIDE (Browser-based)**
- No requiere instalación
- Accede a: https://www.tronide.io/

---

## 🔧 Deployment con TronBox

### Paso 1: Configurar Proyecto

```bash
# Crear directorio del proyecto
mkdir amigos-de-tron
cd amigos-de-tron

# Inicializar proyecto TronBox
tronbox init
```

### Paso 2: Configurar tronbox.js

Crea o edita `tronbox.js`:

```javascript
module.exports = {
  networks: {
    // Testnet Shasta
    shasta: {
      privateKey: 'TU_PRIVATE_KEY_AQUI',
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '*'
    },
    
    // Mainnet
    mainnet: {
      privateKey: 'TU_PRIVATE_KEY_AQUI',
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '*'
    }
  },
  
  compilers: {
    solc: {
      version: '0.8.6'
    }
  }
};
```

⚠️ **IMPORTANTE**: Nunca compartas tu private key. Usa variables de entorno:

```bash
export TRON_PRIVATE_KEY="tu_private_key_aqui"
```

Luego en `tronbox.js`:
```javascript
privateKey: process.env.TRON_PRIVATE_KEY
```

### Paso 3: Copiar el Contrato

Copia `AmigosDeTronOptimized.sol` a la carpeta `contracts/`:

```bash
cp AmigosDeTronOptimized.sol contracts/
```

### Paso 4: Crear Script de Migración

Crea `migrations/2_deploy_contracts.js`:

```javascript
const AmigosDeTronOptimized = artifacts.require("AmigosDeTronOptimized");

module.exports = function(deployer, network, accounts) {
  // Dirección de la empresa de servicios
  // CAMBIA ESTO por tu dirección real
  const serviceCompanyAddress = "TU_DIRECCION_DE_EMPRESA_AQUI";
  
  deployer.deploy(AmigosDeTronOptimized, serviceCompanyAddress);
};
```

### Paso 5: Compilar

```bash
tronbox compile
```

Deberías ver:
```
Compiling ./contracts/AmigosDeTronOptimized.sol...
Writing artifacts to ./build/contracts
```

### Paso 6: Desplegar

**En Testnet (Shasta):**
```bash
tronbox migrate --network shasta
```

**En Mainnet:**
```bash
tronbox migrate --network mainnet
```

### Paso 7: Guardar Información del Contrato

Después del deployment, verás algo como:

```
AmigosDeTronOptimized: TXxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Guarda esta dirección** - es la dirección de tu contrato desplegado.

---

## 🌐 Deployment con TronIDE

### Paso 1: Acceder a TronIDE

1. Ve a https://www.tronide.io/
2. Conecta tu wallet TronLink
3. Selecciona la red (Shasta Testnet o Mainnet)

### Paso 2: Crear Nuevo Archivo

1. Click en "File" → "New File"
2. Nombra el archivo: `AmigosDeTronOptimized.sol`
3. Copia y pega todo el código del contrato

### Paso 3: Compilar

1. Click en el ícono de "Compile" (martillo)
2. Selecciona versión del compilador: `0.8.6`
3. Click "Compile AmigosDeTronOptimized.sol"
4. Verifica que no haya errores

### Paso 4: Desplegar

1. Click en el ícono de "Deploy & Run" (cohete)
2. Selecciona "AmigosDeTronOptimized" en el dropdown
3. En el campo de constructor, ingresa la dirección de la empresa:
   ```
   "TU_DIRECCION_DE_EMPRESA_AQUI"
   ```
   (Incluye las comillas)
4. Click "Deploy"
5. Confirma la transacción en TronLink

### Paso 5: Verificar Deployment

Después del deployment:
1. Copia la dirección del contrato
2. Búscala en [TronScan](https://tronscan.org/) (mainnet) o [Shasta TronScan](https://shasta.tronscan.org/) (testnet)

---

## ✅ Verificación del Contrato

### En TronScan

1. Ve a TronScan y busca la dirección de tu contrato
2. Click en la pestaña "Contract"
3. Click en "Verify Contract"
4. Completa el formulario:
   - **Compiler Version**: 0.8.6
   - **Optimization**: No
   - **Contract Code**: Pega el código completo
5. Click "Verify and Publish"

### Verificación Manual

Usa TronBox console:

```bash
tronbox console --network shasta
```

Luego:
```javascript
let instance = await AmigosDeTronOptimized.at("DIRECCION_DEL_CONTRATO");
let owner = await instance.owner();
console.log("Owner:", owner);
```

---

## 🔗 Interacción con el Contrato

### Usando TronWeb (JavaScript)

```javascript
const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',
    privateKey: 'TU_PRIVATE_KEY'
});

// Cargar el contrato
const contractAddress = 'TU_DIRECCION_DE_CONTRATO';
const contract = await tronWeb.contract().at(contractAddress);

// Registrar usuario
await contract.register(100000).send({
    callValue: 0,
    shouldPollResponse: true
});

// Activar Plan Básico (35 TRX)
await contract.activateBasicPlan().send({
    callValue: 35_000_000, // 35 TRX en SUN
    shouldPollResponse: true
});

// Consultar información del usuario
const userInfo = await contract.getUserInfo(tuDireccion).call();
console.log(userInfo);
```

### Usando TronLink (Frontend)

```javascript
// Verificar si TronLink está instalado
if (window.tronWeb && window.tronWeb.ready) {
    const tronWeb = window.tronWeb;
    
    // Obtener dirección del usuario
    const userAddress = tronWeb.defaultAddress.base58;
    
    // Cargar contrato
    const contract = await tronWeb.contract().at('DIRECCION_DEL_CONTRATO');
    
    // Registrar
    await contract.register(100000).send();
    
    // Activar plan
    await contract.activateBasicPlan().send({
        callValue: tronWeb.toSun(35) // 35 TRX
    });
}
```

---

## 🐛 Troubleshooting

### Error: "Insufficient balance"
**Solución**: Asegúrate de tener suficiente TRX en tu wallet para:
- Gas fees (~5-10 TRX para deployment)
- El monto del plan que estás activando

### Error: "Contract validation failed"
**Solución**: 
1. Verifica que la versión del compilador sea exactamente 0.8.6
2. Asegúrate de copiar todo el código sin modificaciones
3. No uses optimización del compilador

### Error: "Invalid address"
**Solución**: 
- Las direcciones TRON deben empezar con 'T'
- Verifica que la dirección de la empresa sea válida
- Usa base58 format, no hex

### Error: "Transaction failed"
**Solución**:
1. Aumenta el `feeLimit` en tronbox.js a 2000 * 1e6
2. Verifica que tengas suficiente bandwidth y energy
3. Revisa los logs en TronScan para más detalles

### Contrato no aparece en TronScan
**Solución**:
- Espera 1-2 minutos para que se indexe
- Verifica que estés buscando en la red correcta (mainnet vs testnet)
- Usa la dirección completa (base58)

---

## 📊 Funciones Principales del Contrato

### Para Usuarios

| Función | Descripción | Costo |
|---------|-------------|-------|
| `register(sponsorCode)` | Registrarse con código de referido | 0 TRX |
| `activateBasicPlan()` | Activar plan básico | 35 TRX |
| `activateMasterPlan()` | Activar plan master | 100 TRX |
| `activatePremiumPlan()` | Activar plan premium | 250 TRX |
| `getUserInfo(address)` | Ver información del usuario | 0 TRX (view) |
| `getUserMatrixInfo(address)` | Ver posición en matriz | 0 TRX (view) |
| `getUserRenewalInfo(address)` | Ver info de renovación | 0 TRX (view) |

### Para Administradores (Owner)

| Función | Descripción |
|---------|-------------|
| `updateServiceAddress(newAddress)` | Cambiar dirección de empresa |
| `withdrawRenewalFees(amount)` | Retirar fondos de renovación |
| `withdrawGasReserve(amount)` | Retirar reserva de gas |
| `transferOwnership(newOwner)` | Transferir ownership |

### Consultas Públicas

| Función | Descripción |
|---------|-------------|
| `getGlobalStats()` | Estadísticas globales del proyecto |
| `getUserReferralsPaginated(user, offset, limit)` | Lista de referidos (paginada) |
| `getContractBalance()` | Balance del contrato |

---

## 🔐 Seguridad

### Mejoras Implementadas

✅ **Uso de `call()` en lugar de `transfer()`**
- Evita problemas con límite de gas
- Más seguro para contratos complejos

✅ **Funciones de retiro para owner**
- `withdrawRenewalFees()` - Retirar fondos de renovación
- `withdrawGasReserve()` - Retirar reserva de gas

✅ **Paginación en consultas**
- `getUserReferralsPaginated()` evita problemas de gas

✅ **Validaciones exhaustivas**
- Verificación de direcciones
- Verificación de montos
- Prevención de reentrancy

✅ **Eventos completos**
- Todas las operaciones importantes emiten eventos
- Facilita auditoría y tracking

---

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. Revisa los logs en TronScan
2. Verifica que tengas suficiente TRX y energy
3. Asegúrate de usar la versión correcta del compilador (0.8.6)
4. Consulta la documentación oficial de TRON: https://developers.tron.network/

---

## ✨ Próximos Pasos

Después del deployment exitoso:

1. ✅ Verifica el contrato en TronScan
2. ✅ Prueba las funciones básicas (register, activate plan)
3. ✅ Integra con tu frontend
4. ✅ Realiza pruebas exhaustivas en testnet
5. ✅ Considera una auditoría profesional antes de mainnet

**¡Buena suerte con tu proyecto AMIGOS DE TRON! 🚀**