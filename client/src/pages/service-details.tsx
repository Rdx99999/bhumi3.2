import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsultationDialog } from "@/components/ui/consultation-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Service } from "@shared/schema";
import SEO from "@/components/SEO/SEO";
import Breadcrumbs, { generateBreadcrumbs } from "@/components/SEO/Breadcrumbs";
import RelatedContent from "@/components/SEO/RelatedContent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ServiceDetails() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  
  // Get the service ID from the URL
  const serviceId = location.split('/').pop();
  
  console.log("Current location:", location);
  console.log("Service ID extracted:", serviceId);
  
  // Fetch the service details
  const { data: serviceResponse, isLoading, error } = useQuery<{ success: boolean; data: Service }>({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId,
  });
  
  console.log("Service Response:", serviceResponse);
  console.log("Loading State:", isLoading);
  console.log("Error:", error);
  
  const service = serviceResponse?.data;
  
  useEffect(() => {
    if (serviceResponse && !serviceResponse.success) {
      toast({
        title: "Error",
        description: "Failed to load service details. Please try again.",
        variant: "destructive",
      });
    }
  }, [serviceResponse, toast]);

  // Function to handle "Back to Services" button
  const handleBack = () => {
    setLocation('/#services');
  };
  
  // Function to open consultation dialog
  const openConsultationDialog = () => {
    setConsultationDialogOpen(true);
  };

  // Service structured data for this specific service
  const generateServiceStructuredData = (service: Service) => {
    return {
      type: 'service' as const,
      data: {
        serviceType: service.title,
        provider: {
          name: 'Bhumi Consultancy Services',
          url: 'https://bhumiconsultancy.in'
        },
        description: service.description,
        areaServed: 'Worldwide',
        price: 'Contact for pricing',
        priceCurrency: 'INR'
      }
    };
  };

  return (
    <main className="container mx-auto px-4 py-6 sm:py-12">
      {/* SEO for service details page */}
      {service && (
        <SEO
          title={`${service.title} | Bhumi Consultancy Services`}
          description={service.description}
          keywords={`${service.title.toLowerCase()}, consultancy services, business consulting, bhumi consultancy`}
          canonicalUrl={`https://bhumiconsultancy.in/services/${service.id}`}
          structuredData={generateServiceStructuredData(service)}
        />
      )}
      
      {/* Breadcrumbs */}
      {service && (
        <Breadcrumbs 
          items={generateBreadcrumbs.serviceDetail(service.title, service.id.toString())}
          className="mb-4"
        />
      )}
      
      <Button 
        variant="ghost" 
        className="mb-4 sm:mb-6 flex items-center"
        onClick={handleBack}
        size="sm"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="text-sm sm:text-base">Back to Services</span>
      </Button>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 sm:h-12 w-3/4" />
          <Skeleton className="h-5 sm:h-6 w-full" />
          <Skeleton className="h-36 sm:h-48 w-full" />
          <Skeleton className="h-5 sm:h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 sm:mt-8">
            <Skeleton className="h-20 sm:h-24 w-full" />
            <Skeleton className="h-20 sm:h-24 w-full" />
          </div>
        </div>
      ) : service ? (
        <>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{service.title}</h1>
          </div>
          
          <Card className="mb-6 sm:mb-8 bg-white shadow-md">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-6" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-5" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-gray-700 mb-2 mt-3" {...props} />,
                    h5: ({node, ...props}) => <h5 className="text-base font-semibold text-gray-700 mb-1 mt-2" {...props} />,
                    h6: ({node, ...props}) => <h6 className="text-sm font-semibold text-gray-600 mb-1 mt-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-base sm:text-lg leading-7" {...props} />,
                    ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="text-base leading-6" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 my-4" {...props} />,
                    code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                    pre: ({node, ...props}) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-6 border-gray-300" {...props} />
                  }}
                >
                  {service.description}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
          
          <Separator className="my-6 sm:my-8" />
          
          <div className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {Array.isArray(service.features) ? 
                service.features.map((feature: string, index: number) => (
                  <Card key={index} className="h-full border-l-4 border-l-primary">
                    <CardHeader className="py-3 px-4 sm:pb-2 sm:px-6">
                      <CardTitle className="text-base sm:text-xl flex items-center">
                        <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <span className="leading-tight">{feature}</span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))
              : <p>No features available for this service.</p>}
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 text-center">
            <Button 
              size="lg" 
              onClick={openConsultationDialog}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Get a Consultation
            </Button>
          </div>
          
          {/* Consultation Dialog */}
          {service && (
            <ConsultationDialog 
              open={consultationDialogOpen}
              onOpenChange={setConsultationDialogOpen}
              serviceTitle={service.title}
              serviceId={service.id}
            />
          )}
          
          {/* Related Content for Internal Linking */}
          <RelatedContent 
            currentId={service.id}
            currentType="service"
            className="mt-8"
          />
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Service not found</h2>
          <p className="mb-8">The service you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/#services">View All Services</Link>
          </Button>
        </div>
      )}
    </main>
  );
}