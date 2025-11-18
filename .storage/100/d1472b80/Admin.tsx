import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WalletConnectButton from '@/components/WalletConnectButton';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Users, TrendingUp, Shield, ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { contractInteraction, GlobalStats } from '@/lib/contractInteraction';

export default function Admin() {
  const { isConnected, isOwner } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [serviceAddress, setServiceAddress] = useState('');
  const [newServiceAddress, setNewServiceAddress] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isConnected || !isOwner) {
      navigate('/');
    } else {
      loadStats();
      loadServiceAddress();
    }
  }, [isConnected, isOwner, navigate]);

  const loadStats = async () => {
    try {
      const globalStats = await contractInteraction.getGlobalStats();
      setStats(globalStats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const loadServiceAddress = async () => {
    try {
      const addr = await contractInteraction.getServiceAddress();
      if (addr) {
        setServiceAddress(addr);
        setNewServiceAddress(addr);
      }
    } catch (error) {
      console.error('Error al cargar dirección:', error);
    }
  };

  const handleUpdateAddress = async () => {
    if (!newServiceAddress) {
      toast.error('Ingresa una dirección válida');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await contractInteraction.updateServiceAddress(newServiceAddress);
      if (result.success) {
        toast.success('Dirección actualizada exitosamente');
        setServiceAddress(newServiceAddress);
      } else {
        toast.error('Error al actualizar', { description: result.message });
      }
    } catch (error) {
      toast.error('Error al procesar');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isConnected || !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-400 mb-6">Solo el owner puede acceder a esta página</p>
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
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Panel de Administración
              </span>
            </div>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Total Usuarios</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats?.totalUsers || 0}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold">Posiciones Matriz</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats?.matrixPositions || 0}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold">TRX Quemado</h3>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats?.totalBurned.toFixed(2) || 0} TRX</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Fondo Reinversión</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{stats?.reinvestmentBalance.toFixed(2) || 0} TRX</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Configuración de Wallet de Empresa</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentAddress">Dirección Actual</Label>
                <Input
                  id="currentAddress"
                  value={serviceAddress}
                  readOnly
                  className="mt-2 bg-gray-800 font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="newAddress">Nueva Dirección</Label>
                <Input
                  id="newAddress"
                  value={newServiceAddress}
                  onChange={(e) => setNewServiceAddress(e.target.value)}
                  placeholder="Ingresa la nueva dirección de wallet"
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Esta wallet recibirá los pagos de empresa de los planes Master y Premium
                </p>
              </div>

              <Button
                onClick={handleUpdateAddress}
                disabled={isUpdating || newServiceAddress === serviceAddress}
                className="w-full bg-gradient-to-r from-green-500 to-green-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Actualizando...' : 'Actualizar Dirección'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Distribución de Planes</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                <span className="font-semibold">Plan Básico</span>
                <span className="text-2xl font-bold text-blue-400">{stats?.basicCount || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-900/20 border border-green-500/30 rounded">
                <span className="font-semibold">Plan Master</span>
                <span className="text-2xl font-bold text-green-400">{stats?.masterCount || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-500/30 rounded">
                <span className="font-semibold">Plan Premium</span>
                <span className="text-2xl font-bold text-red-400">{stats?.premiumCount || 0}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-300 mb-3">Fondo de Reinversión</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance Actual:</span>
                  <span className="font-bold">{stats?.reinvestmentBalance.toFixed(2) || 0} TRX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cuentas Creadas:</span>
                  <span className="font-bold">{stats?.accountsCreated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Threshold:</span>
                  <span className="font-bold">2000 TRX</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-3">Matriz Global</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Posiciones:</span>
                  <span className="font-bold">{stats?.matrixPositions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo de Matriz:</span>
                  <span className="font-bold">1x2 Global</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pago por Ciclo:</span>
                  <span className="font-bold">25 TRX</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}