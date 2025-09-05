import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Clock } from "lucide-react";
import { TrainingProgram } from "@shared/schema";
import { EnrollmentDialog } from "@/components/ui/enrollment-dialog";

// Utility function to strip markdown formatting for card previews
const stripMarkdown = (text: string): string => {
  return text
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim();
};

// Map of category names to badge colors
const categoryColors: Record<string, string> = {
  'Business': 'bg-blue-100 text-primary',
  'Finance': 'bg-green-100 text-green-800',
  'Leadership': 'bg-yellow-100 text-yellow-800',
  'Marketing': 'bg-purple-100 text-purple-800',
  'Technology': 'bg-cyan-100 text-cyan-800'
};

export default function TrainingSection() {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  
  const { data: trainings, isLoading } = useQuery<{ success: boolean; data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
  });
  
  const handleEnrollClick = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setEnrollDialogOpen(true);
  };

  return (
    <section id="training" className="section-spacing bg-gray-50">
      <div className="mx-responsive">
        <div className="text-center content-spacing">
          <h2 className="heading-responsive font-bold text-primary mb-3 md:mb-4">Training Programs</h2>
          <p className="subtitle-responsive max-w-3xl mx-auto">
            Develop your team's skills with our industry-leading training programs.
          </p>
        </div>
        
        <div className="symmetrical-grid">
          {isLoading ? (
            // Loading state with symmetrical layout
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-card overflow-hidden transition-medium animate-pulse">
                <div className="w-full h-48 sm:h-52 bg-gray-300"></div>
                <CardContent className="p-5 sm:p-6 md:p-7">
                  <div className="w-20 h-6 bg-gray-300 rounded-full mb-3"></div>
                  <div className="w-3/4 h-7 bg-gray-300 rounded mb-3"></div>
                  <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="w-5/6 h-4 bg-gray-300 rounded mb-5"></div>
                  <div className="flex justify-between items-center mb-5">
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                    <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-gray-300 h-10 rounded flex-1"></div>
                    <div className="bg-gray-300 h-10 rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            trainings?.data.slice(0, 3).map((program) => (
              <Card key={program.id} className="bg-white rounded-lg shadow-card shadow-card-hover overflow-hidden transition-medium">
                <div className="relative">
                  <img 
                    src={program.image_path || `https://source.unsplash.com/random/600x400?business,${program.category.toLowerCase()}`} 
                    alt={program.title} 
                    className="w-full h-48 sm:h-52 object-cover object-center"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-10"></div>
                </div>
                <CardContent className="p-5 sm:p-6 md:p-7">
                  <Badge className={`${categoryColors[program.category] || 'bg-gray-100 text-gray-800'} mb-2 font-medium px-3 py-1`}>
                    {program.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{program.title}</h3>
                  <p className="text-gray-600 mb-5 line-clamp-2">{stripMarkdown(program.description)}</p>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm sm:text-base text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" /> {program.duration}
                    </span>
                    <span className="text-sm sm:text-base text-primary font-semibold">₹{(program.online_price || program.price).toLocaleString()} <span className="text-xs text-gray-500">+GST</span></span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 w-full text-sm sm:text-base py-2" 
                      onClick={() => handleEnrollClick(program)}
                    >
                      Enroll Now
                    </Button>
                    <Link href={`/training-programs/${program.slug || program.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm sm:text-base py-2">Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center mt-10 sm:mt-12">
          <Link href="/training-programs">
            <Button variant="outline" 
              className="inline-flex items-center border-primary text-primary hover:bg-primary hover:text-white text-base sm:text-lg py-2 px-5 sm:py-3 sm:px-7 transition-all"
            >
              View All Training Programs <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Enrollment Dialog */}
      {selectedProgram && (
        <EnrollmentDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          programName={selectedProgram.title}
          programId={selectedProgram.id}
        />
      )}
    </section>
  );
}
