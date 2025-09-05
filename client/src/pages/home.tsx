import HeroBanner from "@/components/home/HeroBanner";
import ServicesSection from "@/components/home/ServicesSection";
import TrainingSection from "@/components/home/TrainingSection";
import VerifySection from "@/components/home/VerifySection";
import ContactSection from "@/components/home/ContactSection";
import SEO from "@/components/SEO/SEO";

export default function Home() {
  // Organization structured data for homepage
  const organizationData = {
    type: 'organization' as const,
    data: {
      name: 'Bhumi Consultancy Services',
      url: 'https://bhumiconsultancy.in',
      logo: 'https://bhumiconsultancy.in/favicon.png',
      description: 'Professional business consulting, training programs, and certification services to help your business grow.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'MCF-6503, Sanjay Colony, Sector-23, 33 Feet Road, Near Rana Aata Chakki',
        addressLocality: 'Faridabad',
        addressRegion: 'Haryana',
        postalCode: '121005',
        addressCountry: 'IN'
      },
      telephone: '+91 7827284027',
      email: 'bcs04062013@gmail.com',
      socialLinks: [
        'https://www.facebook.com/share/19gk3NuZ5F/',
        'https://x.com/veerupyy?t=3j_t11dcqUTDxbptxjEw_w&s=09',
        'https://www.linkedin.com/in/veerarjun-upadhyay-a41001313',
        'https://www.instagram.com/veerarjunupadhyay?igsh=MXA5bmtkNHZlbmV5eg=='
      ]
    }
  };

  return (
    <div>
      {/* SEO Component */}
      <SEO
        title="Bhumi Consultancy Services | Professional Business Solutions"
        description="Bhumi Consultancy offers professional business consulting, training programs, and certification services to help businesses achieve their full potential."
        keywords="business consulting, training programs, certification, audit services, bhumi consultancy"
        structuredData={organizationData}
      />
      
      <HeroBanner />
      <ServicesSection />
      <TrainingSection />
      <VerifySection />
      <ContactSection />
    </div>
  );
}
