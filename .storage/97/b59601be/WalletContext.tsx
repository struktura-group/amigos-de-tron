import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contractInteraction, UserInfo, MatrixInfo } from '@/lib/contractInteraction';

interface TronWeb {
  ready: boolean;
  defaultAddress: { base58: string };
  trx: { getBalance: (address: string) => Promise<number> };
  request: (params: { method: string }) => Promise<{ code: number }>;
}

interface WalletContextType {
  address: string;
  balance: number;
  isConnected: boolean;
  userInfo: UserInfo | null;
  isRegistered: boolean;
  matrixInfo: MatrixInfo | null;
  isOwner: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  register: (sponsorCode: number) => Promise<{ success: boolean; message: string }>;
  activateBasicPlan: () => Promise<{ success: boolean; message: string }>;
  activateMasterPlan: () => Promise<{ success: boolean; message: string }>;
  activatePremiumPlan: () => Promise<{ success: boolean; message: string }>;
  refreshUserInfo: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [matrixInfo, setMatrixInfo] = useState<MatrixInfo | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    setupTronLinkListeners();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      loadUserInfo();
      checkIfOwner();
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
      setBalance(balanceInSun / 1_000_000);
    } catch (error) {
      console.error('Error al obtener balance:', error);
    }
  };

  const checkIfOwner = async () => {
    try {
      const ownerAddress = await contractInteraction.getOwner();
      if (ownerAddress && address === ownerAddress) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error al verificar owner:', error);
      setIsOwner(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const info = await contractInteraction.getUserInfo(address);
      
      if (info && info.isActive) {
        setUserInfo(info);
        setIsRegistered(true);

        // Cargar información de la matriz única
        const matrix = await contractInteraction.getUserMatrixInfo(address);
        setMatrixInfo(matrix);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
      setIsRegistered(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !(window as unknown as { tronWeb?: TronWeb }).tronWeb) {
        alert('Por favor instala TronLink');
        window.open('https://www.tronlink.org/', '_blank');
        return;
      }

      const tronWeb = (window as unknown as { tronWeb: TronWeb }).tronWeb;
      
      if (!tronWeb.ready) {
        const res = await tronWeb.request({ method: 'tron_requestAccounts' });
        if (res.code === 200) {
          await checkWalletConnection();
        }
      } else {
        await checkWalletConnection();
      }
    } catch (error) {
      console.error('Error al conectar wallet:', error);
      alert('Error al conectar con TronLink');
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setBalance(0);
    setIsConnected(false);
    setUserInfo(null);
    setIsRegistered(false);
    setMatrixInfo(null);
    setIsOwner(false);
  };

  const register = async (sponsorCode: number): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isConnected) return { success: false, message: 'Wallet no conectada' };

      const result = await contractInteraction.register(sponsorCode);
      
      if (result.success) {
        await loadUserInfo();
      }

      return result;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al registrar' };
    }
  };

  const activateBasicPlan = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isConnected) return { success: false, message: 'Wallet no conectada' };
      if (!isRegistered) return { success: false, message: 'Debes registrarte primero' };
      if (balance < 35) return { success: false, message: 'Balance insuficiente' };

      const result = await contractInteraction.activateBasicPlan();
      
      if (result.success) {
        await updateBalance(address);
        await loadUserInfo();
      }

      return result;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al activar plan' };
    }
  };

  const activateMasterPlan = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isConnected) return { success: false, message: 'Wallet no conectada' };
      if (!isRegistered) return { success: false, message: 'Debes registrarte primero' };
      if (balance < 100) return { success: false, message: 'Balance insuficiente' };

      const result = await contractInteraction.activateMasterPlan();
      
      if (result.success) {
        await updateBalance(address);
        await loadUserInfo();
      }

      return result;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al activar plan' };
    }
  };

  const activatePremiumPlan = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isConnected) return { success: false, message: 'Wallet no conectada' };
      if (!isRegistered) return { success: false, message: 'Debes registrarte primero' };
      if (balance < 250) return { success: false, message: 'Balance insuficiente' };

      const result = await contractInteraction.activatePremiumPlan();
      
      if (result.success) {
        await updateBalance(address);
        await loadUserInfo();
      }

      return result;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al activar plan' };
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
        matrixInfo,
        isOwner,
        connectWallet,
        disconnectWallet,
        register,
        activateBasicPlan,
        activateMasterPlan,
        activatePremiumPlan,
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