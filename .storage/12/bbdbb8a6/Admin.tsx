import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LanguageSelector from '@/components/LanguageSelector';
import { Link } from 'react-router-dom';
import {
  Flame,
  Users,
  TrendingUp,
  DollarSign,
  Shield,
  Clock,
  Activity,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Admin() {
  const { t } = useLanguage();

  const totalSupply = 94660000000;
  const burnGoal = totalSupply * 0.25;
  const currentBurned = 2847650000;
  const burnProgress = (currentBurned / burnGoal) * 100;

  const stats = [
    {
      label: t('activeUsers'),
      value: '12,847',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      change: '+12.5%',
    },
    {
      label: t('totalBurned'),
      value: '2.85B TRX',
      icon: <Flame className="h-6 w-6" />,
      color: 'from-red-500 to-red-600',
      change: '+8.3%',
    },
    {
      label: t('internalPositions'),
      value: '8,456',
      icon: <Activity className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      change: '+15.2%',
    },
    {
      label: t('dailyCycles'),
      value: '1,234',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      change: '+5.7%',
    },
    {
      label: t('adRevenue'),
      value: '45,678 TRX',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'from-yellow-500 to-yellow-600',
      change: '+18.9%',
    },
    {
      label: 'Reserva del Sistema',
      value: '123,456 TRX',
      icon: <Shield className="h-6 w-6" />,
      color: 'from-indigo-500 to-indigo-600',
      change: '+3.2%',
    },
  ];

  const recentActivity = [
    { type: 'Ciclo Completado', user: 'User #12847', amount: '12.5 TRX', time: 'Hace 2 min' },
    { type: 'Nueva Posición', user: 'Sistema', amount: '25 TRX', time: 'Hace 5 min' },
    { type: 'Quema Ejecutada', user: 'Smart Contract', amount: '5.5 TRX', time: 'Hace 8 min' },
    { type: 'Nuevo Usuario', user: 'User #12848', amount: '35 TRX', time: 'Hace 12 min' },
    { type: 'Plan Upgrade', user: 'User #8456', amount: '100 TRX', time: 'Hace 15 min' },
  ];

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
              <Shield className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold">{t('adminPanel')}</span>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Project Status Alert */}
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('timeRemaining')}
              </h3>
              <p className="text-gray-300 mb-4">{t('projectWillClose')}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso actual: {burnProgress.toFixed(2)}%</span>
                  <span>Objetivo: 25.00%</span>
                </div>
                <Progress value={burnProgress} className="h-3 bg-gray-700" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Burn Progress */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            Progreso Detallado de Quema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Suministro Total</p>
              <p className="text-3xl font-bold text-blue-400">
                {(totalSupply / 1000000000).toFixed(2)}B
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Quemado Actual</p>
              <p className="text-3xl font-bold text-red-400">
                {(currentBurned / 1000000000).toFixed(2)}B
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Restante para Meta</p>
              <p className="text-3xl font-bold text-green-400">
                {((burnGoal - currentBurned) / 1000000000).toFixed(2)}B
              </p>
            </div>
          </div>

          <div className="relative">
            <Progress value={burnProgress} className="h-6 bg-gray-700" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {burnProgress.toFixed(4)}% completado
            </span>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-500" />
            Actividad Reciente
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-gray-400">{activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{activity.amount}</p>
                  <p className="text-sm text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}