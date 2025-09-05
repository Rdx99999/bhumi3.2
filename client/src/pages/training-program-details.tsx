import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EnrollmentDialog } from "@/components/ui/enrollment-dialog";
import { ArrowLeft, Clock, Calendar, Award, Banknote } from "lucide-react";
import { TrainingProgram } from "@shared/schema";
import { motion } from "framer-motion";
import SEO from "@/components/SEO/SEO";
import Breadcrumbs, { generateBreadcrumbs } from "@/components/SEO/Breadcrumbs";
import FAQSchema, { commonFAQs } from "@/components/SEO/FAQSchema";
import RelatedContent from "@/components/SEO/RelatedContent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Map of category names to badge colors
const categoryColors: Record<string, string> = {
  'Business': 'bg-blue-100 text-primary',
  'Finance': 'bg-green-100 text-green-800',
  'Leadership': 'bg-yellow-100 text-yellow-800',
  'Marketing': 'bg-purple-100 text-purple-800',
  'Technology': 'bg-cyan-100 text-cyan-800'
};

export default function TrainingProgramDetails() {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  
  // Get the program identifier from the URL (could be ID or slug)
  const params = useParams();
  const identifier = params.id; // This could be a numeric ID or a slug
  
  // Fetch the training program data
  const { data: programResponse, isLoading, error } = useQuery<{ success: boolean; data: TrainingProgram }>({
    queryKey: [`/api/training-programs/${identifier}`],
    // Only run the query if we have a valid identifier
    enabled: !!identifier,
  });
  
  const program = programResponse?.data;
  
  const handleEnrollClick = () => {
    setEnrollDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-8 w-24 bg-gray-300 rounded mb-4"></div>
              <div className="h-12 w-3/4 bg-gray-300 rounded mb-6"></div>
              <div className="w-full h-72 bg-gray-300 rounded-lg mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !program) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h1>
            <p className="text-gray-600 mb-6">The training program you're looking for could not be found.</p>
            <Link href="/training-programs">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Programs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Generate structured data for training program
  const generateTrainingCourseStructuredData = (program: TrainingProgram) => {
    return {
      type: 'trainingCourse' as const,
      data: {
        name: program.title,
        description: program.description,
        provider: {
          '@type': 'Organization',
          name: 'Bhumi Consultancy Services',
          sameAs: 'https://bhumiconsultancy.in'
        },
        offers: {
          '@type': 'Offer',
          price: program.price.toString(),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString().split('T')[0]
        },
        coursePrerequisites: 'No specific prerequisites',
        educationalCredentialAwarded: 'Professional Certificate',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'ONLINE',
          duration: program.duration,
          inLanguage: 'en'
        }
      }
    };
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      {/* SEO for training program details */}
      {program && (
        <SEO
          title={`${program.title} | Training Programs | Bhumi Consultancy`}
          description={program.description}
          keywords={`${program.title.toLowerCase()}, ${program.category.toLowerCase()}, professional training, certificate program, bhumi consultancy`}
          canonicalUrl={`https://bhumiconsultancy.in/training-programs/${program.slug || program.id}`}
          ogImage={program.image_path ? program.image_path : undefined}
          structuredData={generateTrainingCourseStructuredData(program)}
        />
      )}
      
      {/* Breadcrumbs */}
      {program && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs 
            items={generateBreadcrumbs.trainingProgramDetail(program.title, program.slug || program.id.toString())}
            className="max-w-4xl mx-auto"
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link href="/training-programs">
            <Button variant="ghost" className="mb-6 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Programs
            </Button>
          </Link>
          
          {/* Program details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge className={`${categoryColors[program.category] || 'bg-gray-100 text-gray-800'} mb-4 font-medium text-sm`}>
              {program.category}
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{program.title}</h1>
            
            {/* Featured image - Blur background effect for both mobile and desktop */}
            <div className="mb-8">
              {/* Mobile view - blur background with clear overlay */}
              <div className="block md:hidden relative rounded-lg overflow-hidden shadow-md h-64">
                {/* Blurred background */}
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-sm scale-110"
                  style={{
                    backgroundImage: `url(${program.image_path || `https://source.unsplash.com/random/1200x600?business,${program.category.toLowerCase()}`})`
                  }}
                ></div>
                
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                
                {/* Clear image overlay - mobile optimized */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <img 
                    src={program.image_path || `https://source.unsplash.com/random/1200x600?business,${program.category.toLowerCase()}`}
                    alt={program.title} 
                    className="max-w-full max-h-48 object-cover object-center rounded-lg shadow-lg"
                  />
                </div>
              </div>
              
              {/* Desktop view - blur background with clear overlay */}
              <div className="hidden md:block relative rounded-lg overflow-hidden shadow-md h-80">
                {/* Blurred background */}
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-sm scale-110"
                  style={{
                    backgroundImage: `url(${program.image_path || `https://source.unsplash.com/random/1200x600?business,${program.category.toLowerCase()}`})`
                  }}
                ></div>
                
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                
                {/* Clear image overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img 
                    src={program.image_path || `https://source.unsplash.com/random/1200x600?business,${program.category.toLowerCase()}`}
                    alt={program.title} 
                    className="max-w-md max-h-64 object-cover object-center rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Program details card */}
            <Card className="mb-8 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3">
                    <Banknote className="w-6 h-6 mx-auto text-primary mb-2" />
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Price</h3>
                    {program.delivery_mode === 'online' ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Online</p>
                        <p className="text-base font-semibold text-primary">₹{(program.online_price || program.price).toLocaleString()} <span className="text-xs text-gray-500">+GST</span></p>
                      </div>
                    ) : program.delivery_mode === 'offline' ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Offline</p>
                        <p className="text-base font-semibold text-gray-900">₹{(program.offline_price || program.price).toLocaleString()} <span className="text-xs text-gray-500">+GST</span></p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="bg-primary/5 rounded-lg p-2 flex-1">
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-700 block mb-1">Online</span>
                            <span className="text-sm font-bold text-primary">₹{(program.online_price || program.price).toLocaleString()}</span>
                            <span className="text-xs text-gray-500 block">+GST</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 flex-1">
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-700 block mb-1">Offline</span>
                            <span className="text-sm font-bold text-gray-900">₹{(program.offline_price || program.online_price || program.price).toLocaleString()}</span>
                            <span className="text-xs text-gray-500 block">+GST</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-3">
                    <Clock className="w-6 h-6 mx-auto text-primary mb-2" />
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="text-base font-semibold text-gray-900">{program.duration}</p>
                  </div>
                  
                  <div className="text-center p-3">
                    <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="text-base font-semibold text-gray-900">{program.category}</p>
                  </div>
                  
                  <div className="text-center p-3">
                    <Award className="w-6 h-6 mx-auto text-primary mb-2" />
                    <h3 className="text-sm font-medium text-gray-500">Certification</h3>
                    <p className="text-base font-semibold text-gray-900">Included</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Program description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Description</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-gray-900" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-gray-900" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-base sm:text-lg leading-7 text-gray-700" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />,
                    li: ({node, ...props}) => <li className="text-base sm:text-lg leading-7" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic mb-4 text-gray-600" {...props} />,
                    code: ({node, ...props}: any) => 
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-6 border-gray-300" {...props} />
                  }}
                >
                  {program.description}
                </ReactMarkdown>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            {/* FAQ Section */}
            <FAQSchema 
              faqs={commonFAQs.trainingProgram(program.title, program.duration, program.price)}
              className="mb-8"
            />
            
            <Separator className="my-8" />
            
            {/* Related Content for Internal Linking */}
            <RelatedContent 
              currentId={program.id}
              currentType="training"
              currentCategory={program.category}
              className="mb-8"
            />
            
            <Separator className="my-8" />
            
            {/* Call to action */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Enroll?</h2>
              <p className="text-gray-600 mb-6">Join our program and take the next step in your professional development.</p>
              <Button size="lg" className="px-8" onClick={handleEnrollClick}>
                Enroll Now
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Enrollment Dialog */}
      {program && (
        <EnrollmentDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          programName={program.title}
          programId={program.id}
        />
      )}
    </div>
  );
}