import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LanguageSelector from '@/components/LanguageSelector';
import AdCarousel from '@/components/AdCarousel';
import { Link } from 'react-router-dom';
import { Flame, Shield, Users, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

export default function Index() {
  const { t } = useLanguage();

  const totalSupply = 94660000000;
  const burnGoal = totalSupply * 0.25;
  const currentBurned = 2847650000;
  const burnProgress = (currentBurned / burnGoal) * 100;

  const plans = [
    {
      name: t('planBasic'),
      price: '35 TRX',
      color: 'from-blue-500 to-blue-600',
      features: t('basicFeatures'),
      icon: <Users className="h-8 w-8" />,
    },
    {
      name: t('planMaster'),
      price: '100 TRX',
      color: 'from-green-500 to-green-600',
      features: t('masterFeatures'),
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true,
    },
    {
      name: t('planElite'),
      price: '250 TRX',
      color: 'from-red-500 to-red-600',
      features: t('eliteFeatures'),
      icon: <Zap className="h-8 w-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              AMIGOS DE TRON
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-red-500 transition-colors">
              {t('home')}
            </Link>
            <Link to="/dashboard" className="hover:text-red-500 transition-colors">
              {t('dashboard')}
            </Link>
            <Link to="/admin" className="hover:text-red-500 transition-colors">
              {t('admin')}
            </Link>
          </nav>
          <LanguageSelector />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-red-500/20 text-red-400 border-red-500/50">
          Sistema Matricial 1×2
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          {t('heroTitle')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          {t('heroSubtitle')}
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          {t('heroDescription')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
              {t('joinNow')}
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
            {t('learnMore')}
          </Button>
        </div>
      </section>

      {/* Burn Progress Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Flame className="h-8 w-8 text-red-500" />
              {t('burnProgress')}
            </h2>
            <p className="text-gray-400">{t('goal')}</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Progress value={burnProgress} className="h-8 bg-gray-700" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {burnProgress.toFixed(2)}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">{t('totalSupply')}</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(totalSupply / 1000000000).toFixed(2)}B TRX
                </p>
              </Card>
              <Card className="bg-gray-800/50 p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">{t('burned')}</p>
                <p className="text-2xl font-bold text-red-400">
                  {(currentBurned / 1000000000).toFixed(2)}B TRX
                </p>
              </Card>
              <Card className="bg-gray-800/50 p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">{t('goal')}</p>
                <p className="text-2xl font-bold text-green-400">
                  {(burnGoal / 1000000000).toFixed(2)}B TRX
                </p>
              </Card>
            </div>
          </div>
        </Card>
      </section>

      {/* Plans Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t('plans')}</h2>
          <p className="text-gray-400">Pre-Launch gratuito de 90 días incluido</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden ${plan.popular ? 'border-2 border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-700'}`}
            >
              {plan.popular && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                  Popular
                </Badge>
              )}
              <div className={`h-32 bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <div className="text-white">{plan.icon}</div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {plan.price}
                </p>
                <p className="text-gray-400 mb-6 min-h-[60px]">{plan.features}</p>
                <Link to="/dashboard">
                  <Button className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}>
                    {t('selectPlan')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Advertising Section */}
      <section className="container mx-auto px-4 py-16">
        <AdCarousel />
      </section>

      {/* Legal Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30 p-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">{t('legalDisclaimer')}</h2>
            <p className="text-xl text-green-400 font-semibold">{t('notPyramid')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">{t('finiteGoal')}</h3>
                <p className="text-gray-400 text-sm">
                  Quemar 25% del suministro total de TRX (23.665B TRX). El proyecto se cierra automáticamente al cumplir la meta.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">{t('smartContract')}</h3>
                <p className="text-gray-400 text-sm">
                  Código verificable en blockchain TRON. Sin control humano, sin jerarquías, sin manipulación.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Autofinanciación</h3>
                <p className="text-gray-400 text-sm">
                  El Smart Contract crea posiciones internas automáticas. No depende solo de nuevos usuarios.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">{t('realBusiness')}</h3>
                <p className="text-gray-400 text-sm">
                  Plataforma de publicidad global. Cada usuario puede promocionar su negocio desde su Back Office.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">© 2025 AMIGOS DE TRON. {t('aboutProject')}</p>
          <p className="text-sm">
            Sistema descentralizado de crowdfunding blockchain con objetivo de quema del 25% del suministro global de TRX
          </p>
        </div>
      </footer>
    </div>
  );
}