import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet, getCurrentAddress, getTRXBalance, isTronLinkInstalled, initTronWeb } from '@/lib/tronWeb';
import { toast } from 'sonner';

interface WalletContextType {
  address: string | null;
  balance: number;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
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
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!address;

  const refreshBalance = async () => {
    if (address) {
      try {
        const bal = await getTRXBalance(address);
        setBalance(bal);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  const connect = async () => {
    if (!isTronLinkInstalled()) {
      toast.error('TronLink not installed', {
        description: 'Please install TronLink extension to continue',
        action: {
          label: 'Install',
          onClick: () => window.open('https://www.tronlink.org/', '_blank'),
        },
      });
      return;
    }

    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      if (addr) {
        setAddress(addr);
        const bal = await getTRXBalance(addr);
        setBalance(bal);
        toast.success('Wallet connected', {
          description: `Address: ${addr.slice(0, 6)}...${addr.slice(-4)}`,
        });
      }
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      toast.error('Failed to connect wallet', {
        description: errorMessage,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(0);
    toast.info('Wallet disconnected');
  };

  // Auto-connect if TronLink is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (isTronLinkInstalled()) {
        try {
          await initTronWeb();
          const addr = await getCurrentAddress();
          if (addr) {
            setAddress(addr);
            const bal = await getTRXBalance(addr);
            setBalance(bal);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).tronLink) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).tronLink.on('accountsChanged', (accounts: any) => {
        if (accounts && accounts.length > 0) {
          const newAddress = accounts[0];
          setAddress(newAddress);
          getTRXBalance(newAddress).then(setBalance);
        } else {
          disconnect();
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};