import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import LanguageSelector from '@/components/LanguageSelector';
import CountdownTimer from '@/components/CountdownTimer';
import MatrixVisualization from '@/components/MatrixVisualization';
import WalletConnect from '@/components/WalletConnect';
import { Link } from 'react-router-dom';
import {
  Flame,
  Copy,
  TrendingUp,
  Wallet,
  Users,
  ImageIcon,
  Settings,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { t } = useLanguage();
  const [autoWithdraw, setAutoWithdraw] = useState(true);

  const referralLink = 'https://amigosdetron.io/ref/ABC123XYZ';

  const matrices = [
    {
      id: 'IPB',
      nodes: [
        { id: '1', status: 'active' as const },
        { id: '2', status: 'completed' as const },
        { id: '3', status: 'active' as const },
      ],
    },
    {
      id: 'IPB1',
      nodes: [
        { id: '1', status: 'completed' as const },
        { id: '2', status: 'completed' as const },
        { id: '3', status: 'completed' as const },
      ],
    },
    {
      id: 'IPB2',
      nodes: [
        { id: '1', status: 'active' as const },
        { id: '2', status: 'pending' as const },
        { id: '3', status: 'pending' as const },
      ],
    },
  ];

  const stats = [
    { label: t('completedCycles'), value: '47', icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-500' },
    { label: t('commissions'), value: '587.5 TRX', icon: <Wallet className="h-5 w-5" />, color: 'text-blue-500' },
    { label: 'Referidos', value: '23', icon: <Users className="h-5 w-5" />, color: 'text-purple-500' },
    { label: t('burnHistory'), value: '258.5 TRX', icon: <Flame className="h-5 w-5" />, color: 'text-red-500' },
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('home')}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold">{t('dashboard')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              {t('activePlan')}: MASTER
            </Badge>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect />
        </div>

        {/* Pre-Launch Timer */}
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30 p-8 mb-8">
          <div className="text-center mb-6">
            <Badge className="mb-4 bg-red-500 text-white text-lg px-4 py-2">
              {t('preLaunch')} - 90 {t('daysRemaining')}
            </Badge>
            <p className="text-gray-300">
              Tiempo restante para seleccionar un plan de membresía
            </p>
          </div>
          <CountdownTimer daysFromNow={90} />
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={stat.color}>{stat.icon}</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Referral Link */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            {t('referralLink')}
          </h3>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="bg-gray-800 border-gray-700"
            />
            <Button onClick={copyReferralLink} className="bg-purple-500 hover:bg-purple-600">
              <Copy className="h-4 w-4 mr-2" />
              {t('copyLink')}
            </Button>
          </div>
        </Card>

        {/* Matrices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {t('activeMatrices')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matrices.map((matrix) => (
              <MatrixVisualization key={matrix.id} matrixId={matrix.id} nodes={matrix.nodes} />
            ))}
          </div>
        </div>

        {/* Settings & Ads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto Withdraw */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              {t('autoWithdraw')}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Retiro automático de comisiones</p>
                <p className="text-sm text-gray-400">
                  Las comisiones se retirarán automáticamente a tu wallet
                </p>
              </div>
              <Switch checked={autoWithdraw} onCheckedChange={setAutoWithdraw} />
            </div>
          </Card>

          {/* My Ads */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-500" />
              {t('myAds')}
            </h3>
            <p className="text-gray-400 mb-4">
              Promociona tu negocio en la plataforma global
            </p>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Crear Anuncio
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}