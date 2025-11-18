import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { contractInteraction } from '@/lib/contractInteraction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Referral() {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState<number | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<string[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadReferralData();
    }
  }, [isConnected, address]);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      const userInfo = await contractInteraction.getUserInfo(address);
      if (userInfo) {
        setReferralCode(userInfo.referralCode);
        setTotalEarned(userInfo.totalEarned);
        
        // Generar link de referido
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/?ref=${userInfo.referralCode}`;
        setReferralLink(link);
      }

      const userReferrals = await contractInteraction.getUserReferrals(address);
      setReferrals(userReferrals);
    } catch (error) {
      console.error('Error al cargar datos de referidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('copied'),
      description: t('linkCopied'),
    });
  };

  const shareOnSocial = (platform: string) => {
    const text = encodeURIComponent(
      t('joinAmigosDeTron') + ' ' + referralLink
    );
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`,
      telegram: `https://t.me/share/url?url=${referralLink}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t('connectWallet')}</CardTitle>
            <CardDescription>
              {t('connectWalletToViewReferrals')}
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
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">{t('referralProgram')}</h1>
          <p className="text-gray-300">{t('earnCommissions')}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('totalReferrals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{referrals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('totalEarned')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalEarned.toFixed(2)} TRX</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {t('referralCode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{referralCode || '---'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Link de Referido */}
        <Card>
          <CardHeader>
            <CardTitle>{t('yourReferralLink')}</CardTitle>
            <CardDescription>
              {t('shareThisLink')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(referralLink)}
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => shareOnSocial('twitter')}
                className="bg-[#1DA1F2] hover:bg-[#1a8cd8]"
              >
                {t('shareOnTwitter')}
              </Button>
              <Button
                onClick={() => shareOnSocial('facebook')}
                className="bg-[#4267B2] hover:bg-[#365899]"
              >
                {t('shareOnFacebook')}
              </Button>
              <Button
                onClick={() => shareOnSocial('telegram')}
                className="bg-[#0088cc] hover:bg-[#0077b5]"
              >
                {t('shareOnTelegram')}
              </Button>
              <Button
                onClick={() => shareOnSocial('whatsapp')}
                className="bg-[#25D366] hover:bg-[#20bd5a]"
              >
                {t('shareOnWhatsApp')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comisiones */}
        <Card>
          <CardHeader>
            <CardTitle>{t('commissionStructure')}</CardTitle>
            <CardDescription>
              {t('earnFromReferrals')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">{t('directReferral')}</p>
                  <p className="text-sm text-blue-700">{t('fromDirectPurchases')}</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">50%</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-900">{t('matrixCommission')}</p>
                  <p className="text-sm text-green-700">{t('fromMatrixPosition')}</p>
                </div>
                <p className="text-2xl font-bold text-green-600">25%</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-semibold text-orange-900">{t('burnContribution')}</p>
                  <p className="text-sm text-orange-700">{t('automaticBurn')}</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">25%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Referidos */}
        <Card>
          <CardHeader>
            <CardTitle>{t('yourReferrals')}</CardTitle>
            <CardDescription>
              {t('peopleWhoJoined')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">{t('loading')}</p>
            ) : referrals.length === 0 ? (
              <p className="text-center text-gray-500">{t('noReferralsYet')}</p>
            ) : (
              <div className="space-y-2">
                {referrals.map((referral, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <p className="font-mono text-sm">{referral}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(referral)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}