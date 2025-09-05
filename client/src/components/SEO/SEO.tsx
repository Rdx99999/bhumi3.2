import { Helmet } from 'react-helmet';
import StructuredData from './StructuredData';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string;
  lang?: string;
  structuredData?: {
    type: 'organization' | 'localBusiness' | 'service' | 'trainingCourse';
    data: Record<string, any>;
  };
}

export default function SEO({
  title = 'Bhumi Consultancy Services | Professional Business Solutions',
  description = 'Bhumi Consultancy offers professional business consulting, training programs, and certification services to help businesses achieve their full potential.',
  keywords = 'business consulting, training programs, certification, audit services, bhumi consultancy',
  canonicalUrl = import.meta.env.VITE_DOMAIN || 'https://bhumiconsultancy.in',
  ogImage = '/images/og-image.jpg',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  lang = 'en',
  structuredData
}: SEOProps) {
  
  // Base title for the company
  const baseTitle = 'Bhumi Consultancy Services';
  
  // Format the title - if it doesn't already contain the base title, append it
  const formattedTitle = title.includes(baseTitle) 
    ? title 
    : `${title} | ${baseTitle}`;
  
  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{formattedTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />
        <meta name="language" content={lang} />
        <meta name="author" content="Bhumi Consultancy Services" />
        <meta name="generator" content="React + Vite" />
        <meta name="rating" content="general" />
        
        {/* Geographic Location */}
        <meta name="geo.region" content="IN-HR" />
        <meta name="geo.placename" content="Faridabad, Haryana, India" />
        <meta name="geo.position" content="28.4089;77.3178" />
        <meta name="ICBM" content="28.4089, 77.3178" />
        
        {/* Mobile Optimization */}
        <meta name="theme-color" content="#1a365d" />
        <meta name="msapplication-TileColor" content="#1a365d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* HTTP-Equiv Tags */}
        <meta httpEquiv="Content-Language" content={lang} />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Canonical Link */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://source.unsplash.com" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Resource Hints for Performance */}
        <link rel="preload" href="/favicon.png" as="image" type="image/png" />
        
        {/* Prefetch likely next pages for faster navigation */}
        <link rel="prefetch" href="/training-programs" />
        <link rel="prefetch" href="/about" />
        <link rel="prefetch" href="/contact" />
        
        {/* Performance and Loading Hints */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Bhumi Consultancy" />
        
        {/* Image loading optimization hint */}
        <meta name="image-src" content="self https://source.unsplash.com https://bhumiconsultancy.in" />
        
        {/* Critical resource hints */}
        <link rel="modulepreload" href="/src/main.tsx" />
        <link rel="preload" href="/src/index.css" as="style" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={formattedTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={formattedTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      
      {/* Add JSON-LD structured data if provided */}
      {structuredData && (
        <StructuredData 
          type={structuredData.type} 
          data={structuredData.data} 
        />
      )}
    </>
  );
}