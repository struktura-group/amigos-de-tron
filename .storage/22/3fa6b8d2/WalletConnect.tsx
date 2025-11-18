import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WalletConnect() {
  const { t } = useLanguage();
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('walletAddress')
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Simular conexión con TronLink
      // En producción real, usar: window.tronWeb o window.tronLink
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generar dirección simulada de TRON (formato real)
      const simulatedAddress = 'T' + Math.random().toString(36).substring(2, 15).toUpperCase() + 
                              Math.random().toString(36).substring(2, 15).toUpperCase();
      
      setWalletAddress(simulatedAddress);
      localStorage.setItem('walletAddress', simulatedAddress);
      localStorage.setItem('walletConnected', 'true');
      
    } catch (err) {
      setError(t.walletConnectionError || 'Error al conectar wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnected');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletAddress) {
    return (
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            {t.walletConnected || 'Wallet Conectada'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {formatAddress(walletAddress)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={disconnectWallet}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            {t.disconnectWallet || 'Desconectar Wallet'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-orange-500" />
          {t.connectWallet || 'Conectar Wallet'}
        </CardTitle>
        <CardDescription>
          {t.connectWalletDescription || 'Conecta tu wallet TronLink para activar tu cuenta'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Button 
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          {isConnecting ? (
            <>{t.connecting || 'Conectando'}...</>
          ) : (
            <>{t.connectTronLink || 'Conectar TronLink'}</>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          {t.needTronLink || 'Necesitas tener TronLink instalado en tu navegador'}
        </p>
      </CardContent>
    </Card>
  );
}