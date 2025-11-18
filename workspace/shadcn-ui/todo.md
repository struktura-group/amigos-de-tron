# AMIGOS DE TRON - Plan de Desarrollo Completo

## Componentes Completados ✅
1. Estructura base del proyecto con shadcn-ui
2. Sistema multiidioma (Español/Inglés)
3. Página principal (Index.tsx) con hero section
4. Dashboard de usuario con estadísticas
5. Panel de administración
6. Visualización de matriz 1x2
7. Temporizador de cuenta regresiva 90 días
8. Carrusel de anuncios
9. Botón de conexión de wallet TronWeb
10. Contexto de gestión de wallet

## Componentes en Desarrollo 🔄

### 1. Smart Contract (Solidity para TRON)
- **Archivo**: `/workspace/shadcn-ui/contracts/AmigosDeTron.sol`
- **Características**:
  - Sistema matricial 1x2 transparente
  - Sin puertas traseras (sin funciones owner privilegiadas)
  - Ownership renunciado automáticamente
  - Distribución automática de comisiones (50% sponsor, 25% upline, 25% quema)
  - Tres planes: 50 TRX, 100 TRX, 500 TRX
  - Generación de códigos únicos de referido
  - Eventos para tracking
  - Función de quema de TRX

### 2. Sistema de Links Únicos de Referidos
- **Archivos**:
  - `/workspace/shadcn-ui/src/pages/Referral.tsx` - Página de referidos
  - `/workspace/shadcn-ui/src/components/ReferralLink.tsx` - Componente de link único
  - `/workspace/shadcn-ui/src/components/ReferralStats.tsx` - Estadísticas de referidos

### 3. Historial de Transacciones
- **Archivos**:
  - `/workspace/shadcn-ui/src/pages/Transactions.tsx` - Página de historial
  - `/workspace/shadcn-ui/src/components/TransactionList.tsx` - Lista de transacciones
  - `/workspace/shadcn-ui/src/lib/blockchainReader.ts` - Lector de blockchain

### 4. Integración Completa
- **Archivos**:
  - `/workspace/shadcn-ui/src/lib/contractInteraction.ts` - Interacción con contrato
  - Actualización de `WalletContext.tsx` con funciones reales
  - Actualización de `Index.tsx` con compra real

## Estructura de Archivos del Proyecto

```
shadcn-ui/
├── contracts/
│   ├── AmigosDeTron.sol          (Smart Contract principal)
│   └── README.md                  (Instrucciones de deploy)
├── src/
│   ├── components/
│   │   ├── ui/                    (Componentes shadcn-ui)
│   │   ├── WalletConnectButton.tsx
│   │   ├── ReferralLink.tsx       (NUEVO)
│   │   ├── ReferralStats.tsx      (NUEVO)
│   │   ├── TransactionList.tsx    (NUEVO)
│   │   ├── MatrixVisualization.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── AdCarousel.tsx
│   │   └── LanguageSelector.tsx
│   ├── contexts/
│   │   ├── WalletContext.tsx      (Actualizado)
│   │   └── LanguageContext.tsx
│   ├── lib/
│   │   ├── tronWeb.ts
│   │   ├── contractInteraction.ts (NUEVO)
│   │   ├── blockchainReader.ts    (NUEVO)
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Index.tsx              (Actualizado)
│   │   ├── Dashboard.tsx
│   │   ├── Admin.tsx
│   │   ├── Referral.tsx           (NUEVO)
│   │   └── Transactions.tsx       (NUEVO)
│   └── App.tsx                    (Actualizado con nuevas rutas)
└── README.md
```

## Orden de Implementación

1. ✅ Smart Contract en Solidity
2. ✅ Sistema de referidos en frontend
3. ✅ Historial de transacciones
4. ✅ Integración completa con el contrato
5. ✅ Testing y validación
6. ✅ Documentación de deployment

## Notas Importantes

- El Smart Contract NO tendrá funciones de retiro del owner
- El ownership se renunciará después del deploy
- Todas las comisiones se distribuyen automáticamente
- El 25% de cada transacción se quema permanentemente
- Los códigos de referido son únicos y generados por el contrato
- El historial lee datos directamente del blockchain (inmutable)