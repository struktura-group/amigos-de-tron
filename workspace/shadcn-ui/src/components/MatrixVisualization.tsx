import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, Clock } from 'lucide-react';

interface MatrixNode {
  id: string;
  status: 'active' | 'completed' | 'pending';
  user?: string;
}

interface MatrixVisualizationProps {
  matrixId: string;
  nodes: MatrixNode[];
}

export default function MatrixVisualization({ matrixId, nodes }: MatrixVisualizationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Users className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{matrixId}</h3>
        <Badge variant="outline">Matriz 1×2</Badge>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Nodo Principal */}
        <div className="flex justify-center">
          <Card className={`w-24 h-24 flex flex-col items-center justify-center ${getStatusColor(nodes[0]?.status || 'pending')} text-white shadow-lg`}>
            {getStatusIcon(nodes[0]?.status || 'pending')}
            <span className="text-xs mt-1 font-medium">Principal</span>
          </Card>
        </div>

        {/* Línea de conexión */}
        <div className="w-px h-8 bg-border"></div>

        {/* Nodos hijos (1×2) */}
        <div className="flex gap-8">
          {[1, 2].map((index) => {
            const node = nodes[index] || { status: 'pending' };
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="w-px h-8 bg-border"></div>
                <Card className={`w-20 h-20 flex flex-col items-center justify-center ${getStatusColor(node.status)} text-white shadow-md`}>
                  {getStatusIcon(node.status)}
                  <span className="text-xs mt-1">{index}</span>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-around text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">Activa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-muted-foreground">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-muted-foreground">Pendiente</span>
        </div>
      </div>
    </Card>
  );
}