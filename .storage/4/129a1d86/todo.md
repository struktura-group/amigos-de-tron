# Plan de Desarrollo - AMIGOS DE TRON (Prototipo Web Funcional)

## Objetivo
Crear un prototipo web completo que simule visualmente la plataforma de crowdfunding blockchain AMIGOS DE TRON con sistema matricial 1×2.

## Archivos a Crear (Máximo 8 archivos de código)

### 1. src/pages/Index.tsx
- Landing page principal
- Hero section con información del proyecto
- Barra de progreso global de quema de TRX (25% objetivo)
- Sección de planes (Basic, Master, Elite)
- Rotador de anuncios publicitarios
- Footer con información legal
- Selector de idioma (ES/EN/PT-BR)

### 2. src/pages/Dashboard.tsx
- Dashboard completo del usuario
- Reloj de cuenta regresiva de 90 días (Pre-Launch)
- Link de referidos
- Matrices activas visuales (IPB, IPB1, IPB2)
- Historial de ciclos y comisiones
- Sección de publicidad del usuario
- Estado del plan activo
- Botón de retiro automático ON/OFF

### 3. src/pages/Admin.tsx
- Panel de administrador
- Estadísticas globales del proyecto
- Usuarios activos
- Total TRX quemados
- Posiciones internas generadas
- Control de tiempo restante
- Auditoría de seguridad
- Gestión de anuncios

### 4. src/components/LanguageSelector.tsx
- Componente para cambiar idioma
- Soporte para ES/EN/PT-BR
- Context API para multilenguaje

### 5. src/contexts/LanguageContext.tsx
- Context para gestión de idiomas
- Traducciones completas en español, inglés y portugués
- Hook personalizado useLanguage

### 6. src/components/MatrixVisualization.tsx
- Visualización de la matriz 1×2
- Animaciones de ciclos
- Estados de posiciones (activa, completada, pendiente)

### 7. src/components/CountdownTimer.tsx
- Reloj de cuenta regresiva de 90 días
- Formato: Días / Horas / Minutos / Segundos
- Animaciones visuales

### 8. src/components/AdCarousel.tsx
- Carrusel de anuncios publicitarios
- Rotación automática
- Filtros por categoría
- Diseño responsive

## Características Técnicas
- React + TypeScript + Vite
- Shadcn-ui para componentes
- Tailwind CSS para estilos
- React Router para navegación
- Context API para estado global
- LocalStorage para simulación de datos
- Animaciones con Framer Motion (si es necesario)

## Flujo de Usuario Simulado
1. Landing page → Registro simulado
2. Dashboard con Pre-Launch de 90 días
3. Visualización de matriz 1×2
4. Selección de planes (Basic/Master/Elite)
5. Gestión de anuncios publicitarios
6. Panel admin (solo visual)

## Notas Importantes
- Todo es simulado visualmente (no hay blockchain real)
- Los datos se guardan en localStorage
- Las transacciones son mockups
- El objetivo es mostrar UX/UI completo
- Diseño moderno y profesional
- Totalmente responsive