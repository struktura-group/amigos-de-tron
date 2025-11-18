import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { contractInteraction, Transaction } from '@/lib/contractInteraction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDownRight, ArrowUpRight, Flame, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Transactions() {
  const { address, isConnected } = useWallet();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions();
    }
  }, [isConnected, address]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txs = await contractInteraction.getUserTransactions(address);
      // Ordenar por timestamp descendente (más reciente primero)
      const sortedTxs = txs.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(sortedTxs);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowDownRight className="h-5 w-5 text-red-500" />;
      case 'commission':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'burn':
        return <Flame className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-red-100 text-red-800';
      case 'commission':
        return 'bg-green-100 text-green-800';
      case 'burn':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t('connectWallet')}</CardTitle>
            <CardDescription>
              {t('connectWalletToViewTransactions')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">{t('transactionHistory')}</h1>
            <p className="text-gray-300">{t('viewAllTransactions')}</p>
          </div>
          <Button
            onClick={loadTransactions}
            disabled={loading}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">{t('totalPurchases')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {transactions.filter(tx => tx.transactionType === 'purchase').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">{t('totalCommissions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {transactions
                  .filter(tx => tx.transactionType === 'commission')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toFixed(2)} TRX
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">{t('totalBurned')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {transactions
                  .filter(tx => tx.transactionType === 'burn')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toFixed(2)} TRX
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>{t('allTransactions')}</CardTitle>
            <CardDescription>
              {t('completeHistory')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">{t('loading')}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noTransactionsYet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(tx.transactionType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTransactionColor(tx.transactionType)}>
                            {t(tx.transactionType)}
                          </Badge>
                          {tx.relatedAddress && tx.relatedAddress !== '0x0000000000000000000000000000000000000000' && (
                            <span className="text-xs text-gray-500 font-mono">
                              {t('from')}: {formatAddress(tx.relatedAddress)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          tx.transactionType === 'commission' ? 'text-green-600' :
                          tx.transactionType === 'purchase' ? 'text-red-600' :
                          'text-orange-600'
                        }`}>
                          {tx.transactionType === 'commission' ? '+' : '-'}
                          {tx.amount.toFixed(2)} TRX
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{t('aboutTransactions')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>• {t('purchaseInfo')}</p>
            <p>• {t('commissionInfo')}</p>
            <p>• {t('burnInfo')}</p>
            <p className="font-semibold mt-4">{t('allTransactionsOnChain')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}