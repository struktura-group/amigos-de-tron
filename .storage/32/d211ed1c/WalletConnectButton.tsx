import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WalletConnectButton() {
  const { address, balance, isConnected, isLoading, connect, disconnect } = useWallet();
  const { t } = useLanguage();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('wallet.connecting')}
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={connect} variant="default" className="gap-2">
        <Wallet className="h-4 w-4" />
        {t('wallet.connect')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('wallet.myWallet')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-xs text-muted-foreground">{t('wallet.address')}</span>
            <span className="font-mono text-xs">{formatAddress(address!)}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-xs text-muted-foreground">{t('wallet.balance')}</span>
            <span className="font-semibold">{balance.toFixed(2)} TRX</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {t('wallet.disconnect')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}