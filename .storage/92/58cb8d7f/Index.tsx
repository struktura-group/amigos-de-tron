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
  const { 
    isConnected, 
    address, 
    isRegistered, 
    register, 
    activateBasicPlan,
    activateMasterPlan,
    activatePremiumPlan,
    basicMatrix,
    masterMatrix,
    premiumMatrix
  } = useWallet();
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
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      if (isConnected && !isRegistered) {
        setShowRegisterModal(true);
      }
    }
  }, [searchParams, isConnected, isRegistered]);

  const handleRegister = async () => {
    if (!referralCode) {
      toast.error('Código de referido requerido');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await register(parseInt(referralCode));
      if (result.success) {
        toast.success('¡Registro exitoso!');
        setShowRegisterModal(false);
      } else {
        toast.error('Error al registrar', { description: result.message });
      }
    } catch (error) {
      toast.error('Error al registrar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanActivation = async (plan: 'basic' | 'master' | 'premium', planName: string) => {
    if (!isConnected) {
      toast.error('Conecta tu wallet primero');
      return;
    }

    if (!isRegistered) {
      toast.error('Regístrate primero');
      setShowRegisterModal(true);
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan === 'basic' ? 35 : plan === 'master' ? 100 : 250);

    try {
      let result;
      if (plan === 'basic') result = await activateBasicPlan();
      else if (plan === 'master') result = await activateMasterPlan();
      else result = await activatePremiumPlan();
      
      if (result.success) {
        toast.success(`¡Plan ${planName} activado!`);
        setTimeout(() => window.location.href = '/dashboard', 2000);
      } else {
        toast.error('Error al activar plan', { description: result.message });
      }
    } catch (error) {
      toast.error('Error al procesar');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Plan Básico',
      price: '35 TRX',
      value: 35,
      color: 'from-blue-500 to-blue-600',
      features: 'Matriz 1x2 + 10 TRX sponsor + 25 TRX matriz',
      icon: <Users className="h-8 w-8" />,
      isActive: basicMatrix?.isActive || false,
      cycles: basicMatrix?.cycles || 0
    },
    {
      id: 'master',
      name: 'Plan Master',
      price: '100 TRX',
      value: 100,
      color: 'from-green-500 to-green-600',
      features: '25 TRX matriz + 25 TRX sponsor + 25 TRX empresa + 25 TRX reinversión',
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true,
      isActive: masterMatrix?.isActive || false,
      cycles: masterMatrix?.cycles || 0
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: '250 TRX',
      value: 250,
      color: 'from-red-500 to-red-600',
      features: '25 TRX matriz + 100 TRX sponsor + 75 TRX empresa + 50 TRX reinversión',
      icon: <Zap className="h-8 w-8" />,
      isActive: premiumMatrix?.isActive || false,
      cycles: premiumMatrix?.cycles || 0
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              AMIGOS DE TRON
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-red-500 transition-colors">Inicio</Link>
            <Link to="/dashboard" className="hover:text-red-500 transition-colors">Dashboard</Link>
            <Link to="/referral" className="hover:text-red-500 transition-colors">Referidos</Link>
            <Link to="/transactions" className="hover:text-red-500 transition-colors">Transacciones</Link>
          </nav>
          <div className="flex items-center gap-4">
            <WalletConnectButton />
            <LanguageSelector />
          </div>
        </div>
      </header>

      {showRegisterModal && isConnected && !isRegistered && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Registro Requerido</h2>
            <p className="text-gray-400 mb-6">Ingresa un código de referido para registrarte</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="refCode">Código de Referido</Label>
                <Input
                  id="refCode"
                  type="number"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Ej: 100000"
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
                <Button onClick={() => setShowRegisterModal(false)} variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-red-500/20 text-red-400 border-red-500/50">
          Sistema Matricial 1×2 con Reinversión Automática
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          AMIGOS DE TRON
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Plataforma Descentralizada de Crowdfunding Blockchain
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Sistema matricial 1×2 con quema automática de TRX. Objetivo: Quemar el 25% del suministro global.
        </p>
        <div className="flex gap-4 justify-center">
          {!isConnected ? (
            <WalletConnectButton />
          ) : !isRegistered ? (
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600"
              onClick={() => setShowRegisterModal(true)}
            >
              Registrarse Ahora
            </Button>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500">
                Ir al Dashboard
              </Button>
            </Link>
          )}
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
                Registrarse con Código
              </Button>
            )}
          </Card>
        )}
      </section>

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

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Planes Disponibles</h2>
          <p className="text-gray-400">Elige el plan que mejor se adapte a tus objetivos</p>
          {!isConnected && (
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500">
              <Wallet className="h-5 w-5" />
              <p className="text-sm">Conecta tu wallet para activar planes</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${plan.popular ? 'border-2 border-green-500' : 'border-gray-700'}`}
            >
              {plan.popular && (
                <Badge className="absolute top-4 right-4 bg-green-500">Popular</Badge>
              )}
              {plan.isActive && (
                <Badge className="absolute top-4 left-4 bg-blue-500">
                  Activo - {plan.cycles} ciclos
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
                  className={`w-full bg-gradient-to-r ${plan.color}`}
                  onClick={() => handlePlanActivation(plan.id as 'basic' | 'master' | 'premium', plan.name)}
                  disabled={!isConnected || !isRegistered || isProcessing || plan.isActive}
                >
                  {isProcessing && selectedPlan === plan.value ? (
                    'Procesando...'
                  ) : plan.isActive ? (
                    'Plan Activo'
                  ) : !isConnected ? (
                    'Conectar Wallet'
                  ) : !isRegistered ? (
                    'Registrarse Primero'
                  ) : (
                    'Activar Plan'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <AdCarousel />
      </section>

      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30 p-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Sistema Transparente</h2>
            <p className="text-xl text-green-400 font-semibold">Smart Contract Verificable</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Matriz 1x2 Automática</h3>
                <p className="text-gray-400 text-sm">
                  Asignación automática de posiciones y ciclos. Reposicionamiento transparente.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Reinversión Automática</h3>
                <p className="text-gray-400 text-sm">
                  Fondo que crea cuentas automáticamente cuando alcanza 2000 TRX.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Pre-Launch 90 Días</h3>
                <p className="text-gray-400 text-sm">
                  Publicidad gratuita durante 90 días desde el registro.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Quema Real de TRX</h3>
                <p className="text-gray-400 text-sm">
                  Quema indirecta por gas fees + quema directa opcional verificable.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">© 2025 AMIGOS DE TRON. Proyecto descentralizado</p>
          <p className="text-sm">
            Sistema de crowdfunding blockchain con matriz 1x2 y reinversión automática
          </p>
        </div>
      </footer>
    </div>
  );
}