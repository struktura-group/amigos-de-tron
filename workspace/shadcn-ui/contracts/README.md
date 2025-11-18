# AMIGOS DE TRON - Smart Contract

## Descripción

Este es el Smart Contract principal del proyecto AMIGOS DE TRON, un sistema de crowdfunding descentralizado con matriz 1x2 y quema automática del 25% de TRX.

## Características de Seguridad

### ✅ SIN PUERTAS TRASERAS
- **NO hay funciones de retiro del owner**
- **NO hay funciones para pausar el contrato**
- **NO hay funciones para cambiar porcentajes**
- **NO hay funciones administrativas privilegiadas**
- El contrato es completamente autónomo y descentralizado

### ✅ Distribución Automática
- 50% al patrocinador directo
- 25% al upline en la matriz
- 25% enviado a dirección de quema (0x...dEaD)

### ✅ Transparencia Total
- Todos los eventos son públicos
- Historial de transacciones inmutable
- Código fuente verificable en TronScan

## Planes Disponibles

| Plan | Precio | Comisión Sponsor | Comisión Upline | Quema |
|------|--------|------------------|-----------------|-------|
| Básico | 50 TRX | 25 TRX | 12.5 TRX | 12.5 TRX |
| Estándar | 100 TRX | 50 TRX | 25 TRX | 25 TRX |
| Premium | 500 TRX | 250 TRX | 125 TRX | 125 TRX |

## Deployment en TRON

### Requisitos Previos
1. TronLink wallet instalado
2. TRX suficiente para gas fees (~500 TRX recomendado)
3. Compilador Solidity 0.8.0+

### Pasos de Deployment

#### Opción 1: TronIDE (Recomendado)
1. Ve a https://www.tronide.io/
2. Crea un nuevo proyecto
3. Copia el código de `AmigosDeTron.sol`
4. Compila con Solidity 0.8.0+
5. Conecta TronLink
6. Deploy en Mainnet o Shasta Testnet
7. **IMPORTANTE**: Después del deploy, verifica el contrato en TronScan

#### Opción 2: TronBox
```bash
# Instalar TronBox
npm install -g tronbox

# Inicializar proyecto
tronbox init

# Copiar contrato a contracts/
cp AmigosDeTron.sol contracts/

# Configurar tronbox.js con tu private key
# NUNCA compartas tu private key

# Compilar
tronbox compile

# Deploy a Shasta Testnet
tronbox migrate --network shasta

# Deploy a Mainnet
tronbox migrate --network mainnet
```

### Configuración de tronbox.js

```javascript
module.exports = {
  networks: {
    mainnet: {
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    }
  },
  compilers: {
    solc: {
      version: '0.8.0'
    }
  }
};
```

### Verificación del Contrato

Después del deployment, verifica el contrato en TronScan:

1. **Mainnet**: https://tronscan.org/
2. **Shasta Testnet**: https://shasta.tronscan.org/

Pasos para verificar:
1. Busca tu dirección de contrato
2. Ve a la pestaña "Contract"
3. Click en "Verify Contract"
4. Pega el código fuente
5. Selecciona compiler version 0.8.0
6. Submit

### Testing en Shasta Testnet

Antes de deployar en Mainnet, prueba en Shasta:

1. Obtén TRX de testnet: https://www.trongrid.io/shasta/
2. Deploy el contrato en Shasta
3. Prueba todas las funciones:
   - Registro de usuarios
   - Compra de planes
   - Distribución de comisiones
   - Verificación de quema

## Funciones Principales

### Para Usuarios

```solidity
// Registrarse con código de referido
function register(uint256 _sponsorCode) external

// Comprar un plan
function purchasePlan(uint256 _plan) external payable

// Obtener información del usuario
function getUserInfo(address _user) external view returns (...)

// Obtener transacciones del usuario
function getUserTransactions(address _user) external view returns (Transaction[] memory)

// Obtener referidos del usuario
function getUserReferrals(address _user) external view returns (address[] memory)
```

### Para Consultas Públicas

```solidity
// Estadísticas globales
function getGlobalStats() external view returns (...)

// Verificar si usuario está registrado
function isUserRegistered(address _user) external view returns (bool)

// Obtener dirección por código de referido
function getAddressByReferralCode(uint256 _code) external view returns (address)
```

## Eventos

```solidity
event UserRegistered(address indexed user, address indexed sponsor, uint256 referralCode)
event PlanPurchased(address indexed user, uint256 amount, uint256 plan)
event CommissionPaid(address indexed from, address indexed to, uint256 amount, string commissionType)
event TRXBurned(uint256 amount, uint256 totalBurned)
event MatrixPositionAssigned(address indexed user, address indexed upline, uint256 level)
```

## Dirección de Quema

```
0x000000000000000000000000000000000000dEaD
```

Esta dirección NO tiene clave privada conocida. Los TRX enviados aquí están permanentemente fuera de circulación.

## Auditoría de Seguridad

### Checklist de Seguridad

- ✅ No hay funciones `onlyOwner`
- ✅ No hay funciones de retiro arbitrario
- ✅ No hay funciones de pausa
- ✅ No hay funciones de actualización de parámetros
- ✅ Distribución de comisiones es automática
- ✅ Porcentajes son constantes (no modificables)
- ✅ Dirección de quema es constante
- ✅ Uso de `transfer()` para envíos seguros
- ✅ Validaciones en todas las funciones críticas
- ✅ Eventos para tracking completo

### Recomendaciones Post-Deployment

1. **Verificar el código fuente** en TronScan inmediatamente
2. **Publicar la dirección del contrato** en todos los canales oficiales
3. **Monitorear las primeras transacciones** para asegurar funcionamiento correcto
4. **Crear un dashboard público** con estadísticas en tiempo real
5. **Mantener comunicación transparente** con la comunidad

## Integración con Frontend

Ver archivo `/workspace/shadcn-ui/src/lib/contractInteraction.ts` para la integración completa con el frontend React.

## Soporte

Para preguntas sobre el contrato:
- Código fuente: Completamente open source
- Auditoría: Disponible para revisión pública
- Comunidad: Telegram/Discord (agregar links)

## Licencia

MIT License - Código completamente abierto y auditable