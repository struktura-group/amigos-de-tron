import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contractInteraction, UserInfo } from '@/lib/contractInteraction';

interface TronWeb {
  ready: boolean;
  defaultAddress: { base58: string };
  trx: {
    getBalance: (address: string) => Promise<number>;
  };
  request: (params: { method: string }) => Promise<{ code: number }>;
}

interface WalletContextType {
  address: string;
  balance: number;
  isConnected: boolean;
  userInfo: UserInfo | null;
  isRegistered: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  register: (sponsorCode: number) => Promise<{ success: boolean; message: string }>;
  purchasePlan: (plan: 35 | 100 | 250) => Promise<{ success: boolean; message: string }>;
  refreshUserInfo: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    setupTronLinkListeners();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      loadUserInfo();
    }
  }, [isConnected, address]);

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && (window as unknown as { tronWeb?: TronWeb }).tronWeb) {
        const tronWeb = (window as unknown as { tronWeb: TronWeb }).tronWeb;
        
        if (tronWeb.ready) {
          const addr = tronWeb.defaultAddress.base58;
          setAddress(addr);
          setIsConnected(true);
          await updateBalance(addr);
        }
      }
    } catch (error) {
      console.error('Error al verificar conexión:', error);
    }
  };

  const setupTronLinkListeners = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (e: MessageEvent) => {
        if (e.data.message && e.data.message.action === 'setAccount') {
          if (e.data.message.data.address) {
            setAddress(e.data.message.data.address);
            setIsConnected(true);
            updateBalance(e.data.message.data.address);
          } else {
            disconnectWallet();
          }
        }
      });
    }
  };

  const updateBalance = async (addr: string) => {
    try {
      const tronWeb = (window as unknown as { tronWeb: TronWeb }).tronWeb;
      const balanceInSun = await tronWeb.trx.getBalance(addr);
      const balanceInTrx = balanceInSun / 1_000_000;
      setBalance(balanceInTrx);
    } catch (error) {
      console.error('Error al obtener balance:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      // Verificar si el usuario está registrado
      const registered = await contractInteraction.isUserRegistered(address);
      setIsRegistered(registered);

      if (registered) {
        // Cargar información completa del usuario
        const info = await contractInteraction.getUserInfo(address);
        setUserInfo(info);
      }
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !(window as unknown as { tronWeb?: TronWeb }).tronWeb) {
        alert('Por favor instala TronLink para continuar');
        window.open('https://www.tronlink.org/', '_blank');
        return;
      }

      const tronWeb = (window as unknown as { tronWeb: TronWeb }).tronWeb;
      
      if (!tronWeb.ready) {
        // Solicitar conexión
        const res = await tronWeb.request({ method: 'tron_requestAccounts' });
        if (res.code === 200) {
          await checkWalletConnection();
        }
      } else {
        await checkWalletConnection();
      }
    } catch (error) {
      console.error('Error al conectar wallet:', error);
      alert('Error al conectar con TronLink. Por favor intenta de nuevo.');
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setBalance(0);
    setIsConnected(false);
    setUserInfo(null);
    setIsRegistered(false);
  };

  const register = async (sponsorCode: number): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isConnected) {
        return { success: false, message: 'Wallet no conectada' };
      }

      const result = await contractInteraction.register(sponsorCode);
      
      if (result.success) {
        // Recargar información del usuario
        await loadUserInfo();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const purchasePlan = async (plan: 35 | 100 | 250): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isConnected) {
        return { success: false, message: 'Wallet no conectada' };
      }

      if (!isRegistered) {
        return { success: false, message: 'Debes registrarte primero' };
      }

      if (balance < plan) {
        return { success: false, message: 'Balance insuficiente' };
      }

      const result = await contractInteraction.purchasePlan(plan);
      
      if (result.success) {
        // Actualizar balance y información del usuario
        await updateBalance(address);
        await loadUserInfo();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al comprar plan';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const refreshUserInfo = async () => {
    if (isConnected && address) {
      await updateBalance(address);
      await loadUserInfo();
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        userInfo,
        isRegistered,
        connectWallet,
        disconnectWallet,
        register,
        purchasePlan,
        refreshUserInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet debe usarse dentro de un WalletProvider');
  }
  return context;
}