import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search } from "lucide-react";
import { TrainingProgram } from "@shared/schema";
import { EnrollmentDialog } from "@/components/ui/enrollment-dialog";
import SEO from "@/components/SEO/SEO";

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

export default function TrainingPrograms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  
  const { data: trainingsResponse, isLoading } = useQuery<{ success: boolean; data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
  });
  
  const trainings = trainingsResponse?.data || [];
  
  // Filter trainings based on search term and category
  const filteredTrainings = trainings.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || program.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories for filter
  const categories = trainings
    .map(program => program.category)
    .filter((category, index, self) => self.indexOf(category) === index);
    
  const handleEnrollClick = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setEnrollDialogOpen(true);
  };

  return (
    <div className="py-12 bg-gray-50">
      {/* SEO for Training Programs listing page */}
      <SEO
        title="Professional Training Programs | Bhumi Consultancy Services"
        description="Explore our comprehensive range of professional training programs designed to enhance your business skills and professional development."
        keywords="training programs, professional development, business skills, certification, bhumi consultancy"
        canonicalUrl="https://bhumiconsultancy.in/training-programs"
        structuredData={{
          type: 'organization',
          data: {
            name: 'Bhumi Consultancy Services',
            description: 'Professional training programs and certification services',
            url: 'https://bhumiconsultancy.in/training-programs',
            services: trainings.map(program => program.title)
          }
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Training Programs</h1>
          <p className="text-lg text-gray-600">
            Explore our comprehensive training programs designed to enhance your business skills and professional development.
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search training programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Training Programs List */}
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading state
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <CardContent className="p-6">
                  <div className="w-16 h-6 bg-gray-300 rounded-full mb-2"></div>
                  <div className="w-48 h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="w-full h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                    <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-gray-300 h-10 rounded flex-1"></div>
                    <div className="bg-gray-300 h-10 rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTrainings.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <h3 className="text-xl font-medium text-gray-600">No training programs found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredTrainings.map((program) => (
              <Card key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <img 
                  src={program.image_path || `https://source.unsplash.com/random/600x400?business,${program.category.toLowerCase()}`} 
                  alt={program.title} 
                  className="w-full h-48 object-cover object-center"
                />
                <CardContent className="p-6">
                  <Badge className={`${categoryColors[program.category] || 'bg-gray-100 text-gray-800'} mb-2 font-medium`}>
                    {program.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-gray-600 mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '3rem' }}>{stripMarkdown(program.description)}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" /> {program.duration}
                    </span>
                    <span className="text-sm text-primary font-semibold">₹{(program.online_price || program.price).toLocaleString()} <span className="text-xs text-gray-500">+GST</span></span>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0 flex gap-2">
                  <Button 
                    className="flex-1 w-full" 
                    onClick={() => handleEnrollClick(program)}
                  >
                    Enroll
                  </Button>
                  <Link href={`/training-programs/${program.slug || program.id}`}>
                    <Button variant="outline" className="flex-1">Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
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
    </div>
  );
}
