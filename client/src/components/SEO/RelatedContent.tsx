import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Briefcase, Star } from 'lucide-react';
import { TrainingProgram, Service } from '@shared/schema';

interface RelatedContentProps {
  currentId?: number;
  currentType: 'training' | 'service';
  currentCategory?: string;
  maxItems?: number;
  className?: string;
}

// Map of category names to badge colors (reused from training-program-details)
const categoryColors: Record<string, string> = {
  'Business': 'bg-blue-100 text-primary',
  'Finance': 'bg-green-100 text-green-800',
  'Leadership': 'bg-yellow-100 text-yellow-800',
  'Marketing': 'bg-purple-100 text-purple-800',
  'Technology': 'bg-cyan-100 text-cyan-800'
};

export default function RelatedContent({ 
  currentId, 
  currentType, 
  currentCategory,
  maxItems = 3,
  className = '' 
}: RelatedContentProps) {
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  // Fetch training programs
  const { data: trainingResponse } = useQuery<{ success: boolean; data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
  });

  // Fetch services
  const { data: servicesResponse } = useQuery<{ success: boolean; data: Service[] }>({
    queryKey: ['/api/services'],
  });

  useEffect(() => {
    const trainingPrograms = trainingResponse?.data || [];
    const services = servicesResponse?.data || [];

    let related: any[] = [];

    if (currentType === 'training') {
      // For training programs, show:
      // 1. Other training programs in same category
      // 2. Different category training programs
      // 3. Related services
      
      const sameCategory = trainingPrograms
        .filter(p => p.id !== currentId && p.category === currentCategory)
        .slice(0, 2);
      
      const differentCategory = trainingPrograms
        .filter(p => p.id !== currentId && p.category !== currentCategory)
        .slice(0, 1);
        
      const relatedServices = services.slice(0, 1);

      related = [
        ...sameCategory.map(item => ({ ...item, type: 'training' })),
        ...differentCategory.map(item => ({ ...item, type: 'training' })),
        ...relatedServices.map(item => ({ ...item, type: 'service' }))
      ];
    } else {
      // For services, show:
      // 1. Other services
      // 2. Related training programs
      
      const otherServices = services
        .filter(s => s.id !== currentId)
        .slice(0, 2);
        
      const relatedTraining = trainingPrograms.slice(0, 1);

      related = [
        ...otherServices.map(item => ({ ...item, type: 'service' })),
        ...relatedTraining.map(item => ({ ...item, type: 'training' }))
      ];
    }

    setRelatedItems(related.slice(0, maxItems));
  }, [trainingResponse, servicesResponse, currentId, currentType, currentCategory, maxItems]);

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">
          {currentType === 'training' ? 'Related Programs & Services' : 'Related Services & Training'}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedItems.map((item, index) => (
          <Card key={`${item.type}-${item.id}`} className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {item.type === 'training' && item.category && (
                    <Badge className={`${categoryColors[item.category] || 'bg-gray-100 text-gray-800'} mb-3 text-xs font-medium`}>
                      {item.category}
                    </Badge>
                  )}
                  <CardTitle className="text-lg font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </div>
                <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
                  {item.type === 'training' ? (
                    <BookOpen className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {item.description?.length > 120 
                  ? `${item.description.substring(0, 120)}...` 
                  : item.description
                }
              </p>

              {item.type === 'training' && (
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  {item.duration && (
                    <span className="flex items-center gap-1">
                      ⏱️ {item.duration}
                    </span>
                  )}
                  {item.price && (
                    <span className="flex items-center gap-1 font-medium text-primary">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}

              <Link href={item.type === 'training' ? `/training-programs/${item.slug || item.id}` : `/services/${item.id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional internal links for SEO */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Explore More</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/training-programs">
            <Button variant="ghost" size="sm" className="text-sm hover:text-primary">
              All Training Programs →
            </Button>
          </Link>
          <Link href="/#services">
            <Button variant="ghost" size="sm" className="text-sm hover:text-primary">
              All Services →
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm" className="text-sm hover:text-primary">
              About Bhumi Consultancy →
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost" size="sm" className="text-sm hover:text-primary">
              Contact Us →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper component for cross-linking between content types
export function InternalLinkSuggestions({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-primary/5 to-blue-50 p-6 rounded-lg border border-primary/10 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/training-programs">
          <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-primary/20">
            <BookOpen className="w-5 h-5 text-primary mb-2" />
            <div className="text-sm font-medium text-gray-900">Training Programs</div>
            <div className="text-xs text-gray-600 mt-1">Professional Courses</div>
          </div>
        </Link>
        
        <Link href="/#services">
          <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-primary/20">
            <Briefcase className="w-5 h-5 text-primary mb-2" />
            <div className="text-sm font-medium text-gray-900">Our Services</div>
            <div className="text-xs text-gray-600 mt-1">Business Consulting</div>
          </div>
        </Link>
        
        <Link href="/verify-certificate">
          <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-primary/20">
            <Star className="w-5 h-5 text-primary mb-2" />
            <div className="text-sm font-medium text-gray-900">Verify Certificate</div>
            <div className="text-xs text-gray-600 mt-1">Authentication</div>
          </div>
        </Link>
        
        <Link href="/about">
          <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-primary/20">
            <ArrowRight className="w-5 h-5 text-primary mb-2" />
            <div className="text-sm font-medium text-gray-900">About Us</div>
            <div className="text-xs text-gray-600 mt-1">Our Story</div>
          </div>
        </Link>
      </div>
    </div>
  );
}