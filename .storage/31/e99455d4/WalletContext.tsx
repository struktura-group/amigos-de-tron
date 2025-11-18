import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  connectWallet,
  getCurrentAddress,
  getTRXBalance,
  isTronLinkInstalled,
  initTronWeb,
  getUserStats,
  getContractStats,
} from '@/lib/tronWeb';

interface WalletContextType {
  address: string | null;
  balance: number;
  isConnected: boolean;
  isLoading: boolean;
  userStats: any;
  contractStats: any;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  refreshUserStats: () => Promise<void>;
  refreshContractStats: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [contractStats, setContractStats] = useState<any>(null);

  // Inicializar TronWeb al cargar
  useEffect(() => {
    const init = async () => {
      try {
        await initTronWeb();
        
        // Verificar si ya está conectado
        const currentAddr = await getCurrentAddress();
        if (currentAddr) {
          setAddress(currentAddr);
          setIsConnected(true);
          await refreshBalance();
          await refreshUserStats();
        }
        
        // Cargar estadísticas del contrato
        await refreshContractStats();
      } catch (error) {
        console.error('Error initializing TronWeb:', error);
      }
    };

    init();

    // Escuchar cambios de cuenta en TronLink
    if (typeof window !== 'undefined' && (window as any).tronLink) {
      (window as any).tronLink.on('accountsChanged', (accounts: any) => {
        if (accounts && accounts.length > 0) {
          const newAddress = accounts[0];
          setAddress(newAddress);
          setIsConnected(true);
          refreshBalance();
          refreshUserStats();
        } else {
          disconnect();
        }
      });
    }
  }, []);

  const connect = async () => {
    if (!isTronLinkInstalled()) {
      alert('Por favor instala TronLink para continuar.\nVisita: https://www.tronlink.org/');
      window.open('https://www.tronlink.org/', '_blank');
      return;
    }

    setIsLoading(true);
    try {
      const addr = await connectWallet();
      if (addr) {
        setAddress(addr);
        setIsConnected(true);
        await refreshBalance();
        await refreshUserStats();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert(error.message || 'Error al conectar la wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(0);
    setIsConnected(false);
    setUserStats(null);
  };

  const refreshBalance = async () => {
    if (!address) return;
    
    try {
      const bal = await getTRXBalance(address);
      setBalance(bal);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const refreshUserStats = async () => {
    if (!address) return;
    
    try {
      const stats = await getUserStats(address);
      setUserStats(stats);
    } catch (error) {
      console.error('Error refreshing user stats:', error);
      // Si el usuario no está registrado, stats será null
      setUserStats(null);
    }
  };

  const refreshContractStats = async () => {
    try {
      const stats = await getContractStats();
      setContractStats(stats);
    } catch (error) {
      console.error('Error refreshing contract stats:', error);
    }
  };

  const value: WalletContextType = {
    address,
    balance,
    isConnected,
    isLoading,
    userStats,
    contractStats,
    connect,
    disconnect,
    refreshBalance,
    refreshUserStats,
    refreshContractStats,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};