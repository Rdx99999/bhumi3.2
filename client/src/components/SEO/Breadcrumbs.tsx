import { useEffect } from 'react';
import { Link } from 'wouter';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Add structured data for breadcrumbs
  useEffect(() => {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: {
          '@type': 'WebPage',
          '@id': item.url.startsWith('http') ? item.url : `https://bhumiconsultancy.in${item.url}`
        }
      }))
    };

    // Create script element for JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(breadcrumbSchema);
    script.id = 'breadcrumb-schema';

    // Remove existing breadcrumb schema if present
    const existingScript = document.getElementById('breadcrumb-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      const scriptToRemove = document.getElementById('breadcrumb-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items]);

  if (items.length <= 1) {
    return null; // Don't show breadcrumbs if there's only one item (home)
  }

  return (
    <nav 
      className={`text-sm text-gray-600 mb-4 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 mx-2 text-gray-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === items.length - 1 ? (
              // Current page - not a link
              <span 
                className="font-medium text-gray-900"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              // Link to previous pages
              <Link 
                href={item.url}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper function to generate breadcrumbs for different page types
export const generateBreadcrumbs = {
  home: (): BreadcrumbItem[] => [
    { name: 'Home', url: '/' }
  ],
  
  about: (): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' }
  ],
  
  contact: (): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' }
  ],
  
  trainingPrograms: (): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Training Programs', url: '/training-programs' }
  ],
  
  trainingProgramDetail: (programTitle: string, programId: string): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Training Programs', url: '/training-programs' },
    { name: programTitle, url: `/training-programs/${programId}` }
  ],
  
  services: (): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' }
  ],
  
  serviceDetail: (serviceTitle: string, serviceId: string): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: serviceTitle, url: `/services/${serviceId}` }
  ],
  
  verifyCertificate: (): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Verify Certificate', url: '/verify-certificate' }
  ]
};