import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en' | 'pt';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
    pt: string;
  };
}

const translations: Translations = {
  // Header
  home: { es: 'Inicio', en: 'Home', pt: 'Início' },
  dashboard: { es: 'Panel', en: 'Dashboard', pt: 'Painel' },
  admin: { es: 'Admin', en: 'Admin', pt: 'Admin' },
  
  // Hero Section
  heroTitle: { es: 'AMIGOS DE TRON', en: 'FRIENDS OF TRON', pt: 'AMIGOS DO TRON' },
  heroSubtitle: { es: 'Plataforma Descentralizada de Crowdfunding Blockchain', en: 'Decentralized Blockchain Crowdfunding Platform', pt: 'Plataforma Descentralizada de Crowdfunding Blockchain' },
  heroDescription: { es: 'Sistema matricial 1×2 con quema automática de TRX. Objetivo: Quemar el 25% del suministro global de TRX.', en: '1×2 matrix system with automatic TRX burning. Goal: Burn 25% of global TRX supply.', pt: 'Sistema matricial 1×2 com queima automática de TRX. Objetivo: Queimar 25% do fornecimento global de TRX.' },
  joinNow: { es: 'Unirse Ahora', en: 'Join Now', pt: 'Junte-se Agora' },
  learnMore: { es: 'Saber Más', en: 'Learn More', pt: 'Saiba Mais' },
  
  // Progress Section
  burnProgress: { es: 'Progreso de Quema de TRX', en: 'TRX Burn Progress', pt: 'Progresso de Queima de TRX' },
  totalSupply: { es: 'Suministro Total', en: 'Total Supply', pt: 'Fornecimento Total' },
  burned: { es: 'Quemados', en: 'Burned', pt: 'Queimados' },
  goal: { es: 'Objetivo 25%', en: 'Goal 25%', pt: 'Objetivo 25%' },
  
  // Plans
  plans: { es: 'Planes de Membresía', en: 'Membership Plans', pt: 'Planos de Associação' },
  planBasic: { es: 'BASIC', en: 'BASIC', pt: 'BÁSICO' },
  planMaster: { es: 'MASTER', en: 'MASTER', pt: 'MASTER' },
  planElite: { es: 'ELITE', en: 'ELITE', pt: 'ELITE' },
  selectPlan: { es: 'Seleccionar Plan', en: 'Select Plan', pt: 'Selecionar Plano' },
  basicFeatures: { es: 'Matriz 1×2 - Comisión directa - Publicidad básica', en: 'Matrix 1×2 - Direct commission - Basic advertising', pt: 'Matriz 1×2 - Comissão direta - Publicidade básica' },
  masterFeatures: { es: 'Todo lo anterior + Fondo de reinversión - Publicidad premium', en: 'All above + Reinvestment fund - Premium advertising', pt: 'Tudo acima + Fundo de reinvestimento - Publicidade premium' },
  eliteFeatures: { es: 'Todo lo anterior + Prioridad máxima - Autofinanciación', en: 'All above + Maximum priority - Self-financing', pt: 'Tudo acima + Prioridade máxima - Autofinanciamento' },
  
  // Dashboard
  preLaunch: { es: 'Pre-Lanzamiento', en: 'Pre-Launch', pt: 'Pré-Lançamento' },
  daysRemaining: { es: 'días restantes', en: 'days remaining', pt: 'dias restantes' },
  referralLink: { es: 'Link de Referidos', en: 'Referral Link', pt: 'Link de Indicação' },
  copyLink: { es: 'Copiar Link', en: 'Copy Link', pt: 'Copiar Link' },
  activeMatrices: { es: 'Matrices Activas', en: 'Active Matrices', pt: 'Matrizes Ativas' },
  completedCycles: { es: 'Ciclos Completados', en: 'Completed Cycles', pt: 'Ciclos Concluídos' },
  commissions: { es: 'Comisiones', en: 'Commissions', pt: 'Comissões' },
  burnHistory: { es: 'Historial de Quema', en: 'Burn History', pt: 'Histórico de Queima' },
  autoWithdraw: { es: 'Retiro Automático', en: 'Auto Withdraw', pt: 'Retirada Automática' },
  myAds: { es: 'Mis Anuncios', en: 'My Ads', pt: 'Meus Anúncios' },
  activePlan: { es: 'Plan Activo', en: 'Active Plan', pt: 'Plano Ativo' },
  statistics: { es: 'Estadísticas', en: 'Statistics', pt: 'Estatísticas' },
  
  // Admin Panel
  adminPanel: { es: 'Panel de Administrador', en: 'Admin Panel', pt: 'Painel de Administrador' },
  activeUsers: { es: 'Usuarios Activos', en: 'Active Users', pt: 'Usuários Ativos' },
  totalBurned: { es: 'Total Quemado', en: 'Total Burned', pt: 'Total Queimado' },
  internalPositions: { es: 'Posiciones Internas', en: 'Internal Positions', pt: 'Posições Internas' },
  dailyCycles: { es: 'Ciclos Diarios', en: 'Daily Cycles', pt: 'Ciclos Diários' },
  adRevenue: { es: 'Ingresos por Publicidad', en: 'Ad Revenue', pt: 'Receita de Publicidade' },
  timeRemaining: { es: 'Tiempo Restante', en: 'Time Remaining', pt: 'Tempo Restante' },
  projectWillClose: { es: 'El proyecto se cerrará al alcanzar el 25% de quema', en: 'Project will close upon reaching 25% burn', pt: 'O projeto será fechado ao atingir 25% de queima' },
  
  // Matrix
  position: { es: 'Posición', en: 'Position', pt: 'Posição' },
  active: { es: 'Activa', en: 'Active', pt: 'Ativa' },
  completed: { es: 'Completada', en: 'Completed', pt: 'Concluída' },
  pending: { es: 'Pendiente', en: 'Pending', pt: 'Pendente' },
  
  // Ads
  featuredAds: { es: 'Anuncios Destacados', en: 'Featured Ads', pt: 'Anúncios Destacados' },
  globalAdvertising: { es: 'Publicidad Global', en: 'Global Advertising', pt: 'Publicidade Global' },
  promoteYourBusiness: { es: 'Promociona tu negocio desde tu Back Office', en: 'Promote your business from your Back Office', pt: 'Promova seu negócio do seu Back Office' },
  
  // Footer
  aboutProject: { es: 'Sobre el Proyecto', en: 'About Project', pt: 'Sobre o Projeto' },
  legalDisclaimer: { es: 'Aviso Legal', en: 'Legal Disclaimer', pt: 'Aviso Legal' },
  notPyramid: { es: 'NO es un sistema piramidal ni Ponzi', en: 'NOT a pyramid or Ponzi scheme', pt: 'NÃO é um esquema de pirâmide ou Ponzi' },
  finiteGoal: { es: 'Objetivo finito y verificable', en: 'Finite and verifiable goal', pt: 'Objetivo finito e verificável' },
  smartContract: { es: 'Smart Contract transparente y auditable', en: 'Transparent and auditable Smart Contract', pt: 'Smart Contract transparente e auditável' },
  realBusiness: { es: 'Negocio real: Publicidad global', en: 'Real business: Global advertising', pt: 'Negócio real: Publicidade global' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};