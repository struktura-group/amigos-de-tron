import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: Translations = {
  // Navegación
  home: { es: 'Inicio', en: 'Home' },
  dashboard: { es: 'Panel', en: 'Dashboard' },
  admin: { es: 'Admin', en: 'Admin' },
  referral: { es: 'Referidos', en: 'Referrals' },
  transactions: { es: 'Transacciones', en: 'Transactions' },
  
  // Wallet
  connectWallet: { es: 'Conectar Wallet', en: 'Connect Wallet' },
  disconnectWallet: { es: 'Desconectar', en: 'Disconnect' },
  connected: { es: 'Conectado', en: 'Connected' },
  balance: { es: 'Balance', en: 'Balance' },
  
  // Referidos
  referralProgram: { es: 'Programa de Referidos', en: 'Referral Program' },
  earnCommissions: { es: 'Gana comisiones invitando amigos', en: 'Earn commissions by inviting friends' },
  totalReferrals: { es: 'Total Referidos', en: 'Total Referrals' },
  totalEarned: { es: 'Total Ganado', en: 'Total Earned' },
  referralCode: { es: 'Código de Referido', en: 'Referral Code' },
  yourReferralLink: { es: 'Tu Link de Referido', en: 'Your Referral Link' },
  shareThisLink: { es: 'Comparte este link para ganar comisiones', en: 'Share this link to earn commissions' },
  copied: { es: 'Copiado', en: 'Copied' },
  linkCopied: { es: 'Link copiado al portapapeles', en: 'Link copied to clipboard' },
  shareOnTwitter: { es: 'Compartir en Twitter', en: 'Share on Twitter' },
  shareOnFacebook: { es: 'Compartir en Facebook', en: 'Share on Facebook' },
  shareOnTelegram: { es: 'Compartir en Telegram', en: 'Share on Telegram' },
  shareOnWhatsApp: { es: 'Compartir en WhatsApp', en: 'Share on WhatsApp' },
  joinAmigosDeTron: { es: 'Únete a AMIGOS DE TRON y gana TRX', en: 'Join AMIGOS DE TRON and earn TRX' },
  commissionStructure: { es: 'Estructura de Comisiones', en: 'Commission Structure' },
  earnFromReferrals: { es: 'Gana de cada compra de tus referidos', en: 'Earn from each purchase of your referrals' },
  directReferral: { es: 'Referido Directo', en: 'Direct Referral' },
  fromDirectPurchases: { es: 'De las compras directas', en: 'From direct purchases' },
  matrixCommission: { es: 'Comisión de Matriz', en: 'Matrix Commission' },
  fromMatrixPosition: { es: 'De tu posición en la matriz', en: 'From your matrix position' },
  burnContribution: { es: 'Contribución a Quema', en: 'Burn Contribution' },
  automaticBurn: { es: 'Quema automática de TRX', en: 'Automatic TRX burn' },
  yourReferrals: { es: 'Tus Referidos', en: 'Your Referrals' },
  peopleWhoJoined: { es: 'Personas que se unieron con tu link', en: 'People who joined with your link' },
  noReferralsYet: { es: 'Aún no tienes referidos', en: 'No referrals yet' },
  connectWalletToViewReferrals: { es: 'Conecta tu wallet para ver tus referidos', en: 'Connect your wallet to view your referrals' },
  
  // Transacciones
  transactionHistory: { es: 'Historial de Transacciones', en: 'Transaction History' },
  viewAllTransactions: { es: 'Ver todas tus transacciones', en: 'View all your transactions' },
  refresh: { es: 'Actualizar', en: 'Refresh' },
  totalPurchases: { es: 'Total Compras', en: 'Total Purchases' },
  totalCommissions: { es: 'Total Comisiones', en: 'Total Commissions' },
  totalBurned: { es: 'Total Quemado', en: 'Total Burned' },
  allTransactions: { es: 'Todas las Transacciones', en: 'All Transactions' },
  completeHistory: { es: 'Historial completo de tu actividad', en: 'Complete history of your activity' },
  loading: { es: 'Cargando...', en: 'Loading...' },
  noTransactionsYet: { es: 'Aún no tienes transacciones', en: 'No transactions yet' },
  purchase: { es: 'Compra', en: 'Purchase' },
  commission: { es: 'Comisión', en: 'Commission' },
  burn: { es: 'Quema', en: 'Burn' },
  from: { es: 'De', en: 'From' },
  aboutTransactions: { es: 'Sobre las Transacciones', en: 'About Transactions' },
  purchaseInfo: { es: 'Las compras son pagos que realizas para adquirir planes', en: 'Purchases are payments you make to acquire plans' },
  commissionInfo: { es: 'Las comisiones son ganancias automáticas de tus referidos', en: 'Commissions are automatic earnings from your referrals' },
  burnInfo: { es: 'El 25% de cada transacción se quema permanentemente', en: '25% of each transaction is permanently burned' },
  allTransactionsOnChain: { es: 'Todas las transacciones están registradas en la blockchain de TRON y son inmutables', en: 'All transactions are recorded on the TRON blockchain and are immutable' },
  connectWalletToViewTransactions: { es: 'Conecta tu wallet para ver tus transacciones', en: 'Connect your wallet to view your transactions' },
  
  // Planes
  basicPlan: { es: 'Plan Básico', en: 'Basic Plan' },
  standardPlan: { es: 'Plan Estándar', en: 'Standard Plan' },
  premiumPlan: { es: 'Plan Premium', en: 'Premium Plan' },
  buyNow: { es: 'Comprar Ahora', en: 'Buy Now' },
  
  // General
  welcome: { es: 'Bienvenido', en: 'Welcome' },
  project: { es: 'Proyecto', en: 'Project' },
  stats: { es: 'Estadísticas', en: 'Stats' },
  users: { es: 'Usuarios', en: 'Users' },
  invested: { es: 'Invertido', en: 'Invested' },
  burned: { es: 'Quemado', en: 'Burned' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}