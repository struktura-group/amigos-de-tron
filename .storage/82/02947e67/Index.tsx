import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSelector from '@/components/LanguageSelector';
import WalletConnectButton from '@/components/WalletConnectButton';
import AdCarousel from '@/components/AdCarousel';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Shield, Users, TrendingUp, CheckCircle2, Zap, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Index() {
  const { t } = useLanguage();
  const { isConnected, address, isRegistered, register, purchasePlan } = useWallet();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const totalSupply = 94660000000;
  const burnGoal = totalSupply * 0.25;
  const currentBurned = 2847650000;
  const burnProgress = (currentBurned / burnGoal) * 100;

  useEffect(() => {
    // Obtener código de referido de la URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Mostrar modal de registro si hay código de referido
      if (isConnected && !isRegistered) {
        setShowRegisterModal(true);
      }
    }
  }, [searchParams, isConnected, isRegistered]);

  const handleRegister = async () => {
    if (!referralCode) {
      toast.error('Código de referido requerido', {
        description: 'Por favor ingresa un código de referido válido',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await register(parseInt(referralCode));
      if (result.success) {
        toast.success('¡Registro exitoso!', {
          description: 'Ahora puedes comprar planes',
        });
        setShowRegisterModal(false);
      } else {
        toast.error('Error al registrar', {
          description: result.message,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Por favor intenta nuevamente';
      toast.error('Error al registrar', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanPurchase = async (plan: 35 | 100 | 250, planName: string) => {
    if (!isConnected) {
      toast.error('Wallet no conectada', {
        description: 'Por favor conecta tu wallet TronLink',
      });
      return;
    }

    if (!isRegistered) {
      toast.error('Usuario no registrado', {
        description: 'Por favor regístrate primero con un código de referido',
      });
      setShowRegisterModal(true);
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan);

    try {
      const result = await purchasePlan(plan);
      
      if (result.success) {
        toast.success('¡Compra exitosa!', {
          description: `Has activado el plan ${planName} con ${plan} TRX`,
        });
        
        // Redirigir al dashboard después de la compra
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        toast.error('Error al comprar plan', {
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error purchasing plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Por favor intenta nuevamente';
      toast.error('Error al procesar la compra', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    {
      id: 35,
      name: t('basicPlan'),
      price: '35 TRX',
      color: 'from-blue-500 to-blue-600',
      features: 'Acceso básico a la matriz 1x2 y comisiones del 50%',
      icon: <Users className="h-8 w-8" />,
    },
    {
      id: 100,
      name: t('standardPlan'),
      price: '100 TRX',
      color: 'from-green-500 to-green-600',
      features: 'Posición mejorada en la matriz y mayores comisiones',
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true,
    },
    {
      id: 250,
      name: t('premiumPlan'),
      price: '250 TRX',
      color: 'from-red-500 to-red-600',
      features: 'Máximas comisiones y posición prioritaria',
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
            <Link to="/referral" className="hover:text-red-500 transition-colors">
              {t('referral')}
            </Link>
            <Link to="/transactions" className="hover:text-red-500 transition-colors">
              {t('transactions')}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <WalletConnectButton />
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Modal de Registro */}
      {showRegisterModal && isConnected && !isRegistered && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Registro Requerido</h2>
            <p className="text-gray-400 mb-6">
              Para comprar planes, primero debes registrarte con un código de referido.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="refCode">Código de Referido</Label>
                <Input
                  id="refCode"
                  type="number"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Ingresa el código de referido"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRegister}
                  disabled={isProcessing || !referralCode}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                >
                  {isProcessing ? 'Registrando...' : 'Registrarse'}
                </Button>
                <Button
                  onClick={() => setShowRegisterModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-red-500/20 text-red-400 border-red-500/50">
          Sistema Matricial 1×2
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          AMIGOS DE TRON
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Plataforma Descentralizada de Crowdfunding Blockchain
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Sistema matricial 1×2 con quema automática de TRX. Objetivo: Quemar el 25% del suministro global de TRX.
        </p>
        <div className="flex gap-4 justify-center">
          {!isConnected ? (
            <WalletConnectButton />
          ) : !isRegistered ? (
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              onClick={() => setShowRegisterModal(true)}
            >
              Registrarse Ahora
            </Button>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                Ir al Dashboard
              </Button>
            </Link>
          )}
          <Link to="/referral">
            <Button size="lg" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
              Ver Referidos
            </Button>
          </Link>
        </div>
        
        {isConnected && (
          <Card className="mt-8 max-w-md mx-auto bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-green-400 font-semibold">
                {isRegistered ? 'Usuario Registrado' : 'Wallet Conectada'}
              </p>
            </div>
            <p className="text-sm text-gray-400">
              {address?.slice(0, 8)}...{address?.slice(-6)}
            </p>
            {!isRegistered && (
              <Button
                size="sm"
                className="mt-4 w-full bg-green-500 hover:bg-green-600"
                onClick={() => setShowRegisterModal(true)}
              >
                Registrarse con Código de Referido
              </Button>
            )}
          </Card>
        )}
      </section>

      {/* Burn Progress Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Flame className="h-8 w-8 text-red-500" />
              Progreso de Quema de TRX
            </h2>
            <p className="text-gray-400">Objetivo: Quemar 25% del suministro total</p>
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
                <p className="text-sm text-gray-400 mb-2">Suministro Total</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(totalSupply / 1000000000).toFixed(2)}B TRX
                </p>
              </Card>
              <Card className="bg-gray-800/50 p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">TRX Quemado</p>
                <p className="text-2xl font-bold text-red-400">
                  {(currentBurned / 1000000000).toFixed(2)}B TRX
                </p>
              </Card>
              <Card className="bg-gray-800/50 p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">Meta</p>
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
          <h2 className="text-4xl font-bold mb-4">Planes Disponibles</h2>
          <p className="text-gray-400">Elige el plan que mejor se adapte a tus objetivos</p>
          {!isConnected && (
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500">
              <Wallet className="h-5 w-5" />
              <p className="text-sm">Conecta tu wallet para comprar planes</p>
            </div>
          )}
          {isConnected && !isRegistered && (
            <div className="mt-4 flex items-center justify-center gap-2 text-orange-500">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">Regístrate con un código de referido para comprar planes</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
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
                <Button
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}
                  onClick={() => handlePlanPurchase(plan.id as 35 | 100 | 250, plan.name)}
                  disabled={!isConnected || !isRegistered || isProcessing}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Procesando...
                    </span>
                  ) : !isConnected ? (
                    <span className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Conectar Wallet
                    </span>
                  ) : !isRegistered ? (
                    'Registrarse Primero'
                  ) : (
                    t('buyNow')
                  )}
                </Button>
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
            <h2 className="text-3xl font-bold mb-2">Aviso Legal</h2>
            <p className="text-xl text-green-400 font-semibold">NO es una Pirámide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Objetivo Finito</h3>
                <p className="text-gray-400 text-sm">
                  Quemar 25% del suministro total de TRX (23.665B TRX). El proyecto se cierra automáticamente al cumplir la meta.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Smart Contract Verificable</h3>
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
                <h3 className="font-bold mb-2">Negocio Real</h3>
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
          <p className="mb-2">© 2025 AMIGOS DE TRON. Proyecto de crowdfunding descentralizado</p>
          <p className="text-sm">
            Sistema descentralizado de crowdfunding blockchain con objetivo de quema del 25% del suministro global de TRX
          </p>
        </div>
      </footer>
    </div>
  );
}