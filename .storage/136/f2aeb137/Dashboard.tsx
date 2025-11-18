import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountdownTimer from '@/components/CountdownTimer';
import MatrixVisualization from '@/components/MatrixVisualization';
import WalletConnectButton from '@/components/WalletConnectButton';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Users, TrendingUp, Copy, CheckCircle2, ExternalLink, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { contractInteraction } from '@/lib/contractInteraction';

export default function Dashboard() {
  const { isConnected, address, userInfo, matrixInfo, isOwner } = useWallet();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    if (address) {
      loadReferrals();
    }
  }, [address]);

  const loadReferrals = async () => {
    try {
      const refs = await contractInteraction.getUserReferrals(address);
      setReferrals(refs);
    } catch (error) {
      console.error('Error al cargar referidos:', error);
    }
  };

  const referralLink = `${window.location.origin}/?ref=${userInfo?.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Enlace copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet</h2>
          <WalletConnectButton />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Flame className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOwner && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Panel Admin
                </Button>
              </Link>
            )}
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Total Ganado</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{userInfo.totalEarned} TRX</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold">Referidos</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{userInfo.totalReferrals}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold">Ciclos Completados</h3>
            </div>
            <p className="text-3xl font-bold text-red-400">{matrixInfo?.cycles || 0}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Información de Usuario</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Código de Referido</p>
                <p className="text-lg font-semibold">{userInfo.referralCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Dirección</p>
                <p className="text-sm font-mono">{address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Sponsor</p>
                <p className="text-sm font-mono">{userInfo.sponsor}</p>
              </div>
              <div className="flex gap-2 pt-2">
                {userInfo.basicActive && (
                  <Badge className="bg-blue-500">Plan Básico</Badge>
                )}
                {userInfo.masterActive && (
                  <Badge className="bg-green-500">Plan Master</Badge>
                )}
                {userInfo.premiumActive && (
                  <Badge className="bg-red-500">Plan Premium</Badge>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Pre-Launch</h3>
            {userInfo.preLaunchActive ? (
              <CountdownTimer endTime={userInfo.preLaunchEndTime} />
            ) : (
              <p className="text-gray-400">Pre-Launch finalizado</p>
            )}
          </Card>
        </div>

        <Tabs defaultValue="matrix" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matrix">Matriz</TabsTrigger>
            <TabsTrigger value="referrals">Referidos</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="mt-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Matriz 1x2 Global</h3>
              {matrixInfo && matrixInfo.isActive ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gray-800/50">
                      <p className="text-sm text-gray-400 mb-1">Posición</p>
                      <p className="text-2xl font-bold">#{matrixInfo.positionId}</p>
                    </Card>
                    <Card className="p-4 bg-gray-800/50">
                      <p className="text-sm text-gray-400 mb-1">Upline</p>
                      <p className="text-sm font-mono truncate">{matrixInfo.upline}</p>
                    </Card>
                    <Card className="p-4 bg-gray-800/50">
                      <p className="text-sm text-gray-400 mb-1">Hijos</p>
                      <p className="text-2xl font-bold">{matrixInfo.children.length}/2</p>
                    </Card>
                  </div>

                  <MatrixVisualization 
                    upline={matrixInfo.upline}
                    children={matrixInfo.children}
                    currentUser={address}
                  />

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">Pago de Ciclo</h4>
                    <p className="text-sm text-gray-300">
                      Cuando completes 2 posiciones recibirás: <span className="font-bold text-green-400">12.5 TRX</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      (12.5 TRX adicionales se queman automáticamente)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No estás en la matriz aún</p>
                  <Link to="/">
                    <Button className="bg-gradient-to-r from-red-500 to-orange-500">
                      Activar un Plan
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Mis Referidos</h3>
              
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Tu Enlace de Referido</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                  />
                  <Button onClick={copyReferralLink} size="sm">
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-300">
                  Total de Referidos: {referrals.length}
                </h4>
                {referrals.length > 0 ? (
                  <div className="space-y-2">
                    {referrals.map((ref, index) => (
                      <Card key={index} className="p-3 bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-mono">{ref}</p>
                          <a
                            href={`https://tronscan.org/#/address/${ref}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Aún no tienes referidos</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Comparte tu enlace para empezar a ganar comisiones
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Historial de Transacciones</h3>
              
              <div className="space-y-4">
                <Card className="p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-500">Comisión de Sponsor</Badge>
                    <p className="text-sm text-gray-400">Hace 2 horas</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">+10 TRX</p>
                  <p className="text-xs text-gray-500 mt-1">Plan Básico activado por referido</p>
                </Card>

                <Card className="p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-500">Ciclo Completado</Badge>
                    <p className="text-sm text-gray-400">Hace 5 horas</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">+12.5 TRX</p>
                  <p className="text-xs text-gray-500 mt-1">Matriz 1x2 - Ciclo #{matrixInfo?.cycles || 0}</p>
                </Card>

                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    Las transacciones se actualizan en tiempo real desde la blockchain
                  </p>
                  <a
                    href={`https://tronscan.org/#/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-flex items-center gap-1"
                  >
                    Ver en TronScan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}