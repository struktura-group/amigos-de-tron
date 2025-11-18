import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  plan: 'basic' | 'master' | 'elite';
}

const sampleAds: Ad[] = [
  {
    id: '1',
    title: 'Consultoría Empresarial',
    description: 'Servicios profesionales de consultoría para tu negocio',
    category: 'Servicios',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    plan: 'elite',
  },
  {
    id: '2',
    title: 'Tienda Online',
    description: 'Productos de calidad con envío internacional',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
    plan: 'master',
  },
  {
    id: '3',
    title: 'Academia Digital',
    description: 'Cursos online de desarrollo profesional',
    category: 'Educación',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop',
    plan: 'basic',
  },
  {
    id: '4',
    title: 'Agencia de Marketing',
    description: 'Estrategias digitales para hacer crecer tu marca',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    plan: 'elite',
  },
];

export default function AdCarousel() {
  const { t } = useLanguage();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'elite':
        return 'bg-red-500';
      case 'master':
        return 'bg-green-500';
      case 'basic':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{t('featuredAds')}</h2>
        <p className="text-muted-foreground">{t('promoteYourBusiness')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleAds.map((ad) => (
          <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="relative h-48 overflow-hidden">
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <Badge className={`absolute top-2 right-2 ${getPlanColor(ad.plan)} text-white`}>
                {ad.plan.toUpperCase()}
              </Badge>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{ad.title}</h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{ad.description}</p>
              <Badge variant="outline">{ad.category}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}