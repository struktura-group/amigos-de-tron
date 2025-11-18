import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WalletConnectButton() {
  const { address, balance, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { t } = useLanguage();

  if (isConnecting) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('wallet.connecting')}
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={connect} className="gap-2">
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
          <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <span className="sm:hidden">{address?.slice(0, 4)}...</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('wallet.myWallet')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{t('wallet.address')}</div>
          <div className="text-xs text-muted-foreground break-all">{address}</div>
        </div>
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{t('wallet.balance')}</div>
          <div className="text-xs text-muted-foreground">{balance.toFixed(2)} TRX</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {t('wallet.disconnect')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}