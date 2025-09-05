import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'service' | 'trainingCourse';
  data: Record<string, any>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Create the JSON-LD script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    // Generate appropriate JSON-LD schema based on type
    let jsonLd = {};
    
    if (type === 'organization') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url,
        logo: data.logo,
        description: data.description,
        address: data.address,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.telephone,
          contactType: 'customer service',
          email: data.email
        },
        sameAs: data.socialLinks
      };
    } else if (type === 'localBusiness') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: data.name,
        image: data.image,
        url: data.url,
        telephone: data.telephone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.address.street,
          addressLocality: data.address.locality,
          addressRegion: data.address.region,
          postalCode: data.address.postalCode,
          addressCountry: data.address.country
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: data.geo.latitude,
          longitude: data.geo.longitude
        },
        openingHoursSpecification: data.openingHours.map((hours: any) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hours.dayOfWeek,
          opens: hours.opens,
          closes: hours.closes
        })),
        priceRange: data.priceRange
      };
    } else if (type === 'service') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: data.serviceType,
        provider: {
          '@type': 'Organization',
          name: data.provider.name,
          url: data.provider.url
        },
        description: data.description,
        areaServed: data.areaServed,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: data.price,
          priceCurrency: data.priceCurrency
        }
      };
    } else if (type === 'trainingCourse') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: data.name,
        description: data.description,
        provider: {
          '@type': 'Organization',
          name: data.provider.name,
          url: data.provider.url
        },
        educationalCredentialAwarded: data.credential,
        timeRequired: data.duration,
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.priceCurrency
        }
      };
    }
    
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]); // Re-run if type or data changes
  
  // This component doesn't render anything visually
  return null;
}