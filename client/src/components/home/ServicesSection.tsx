import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { BarChart3, FileText, CheckCircle, Building2, ClipboardCheck, Users, Award, Target, TrendingUp, Briefcase, Settings } from "lucide-react";
import { Service } from "@shared/schema";
import { motion } from "framer-motion";
import { GridSkeleton } from "@/components/ui/loading-animation";

export default function ServicesSection() {
  const { data: services, isLoading } = useQuery<{ success: boolean; data: Service[] }>({
    queryKey: ['/api/services'],
  });

  // Mapping of icon names to Lucide icons
  const iconMap: Record<string, React.ReactNode> = {
    'chart-line': <BarChart3 className="text-white text-2xl" />,
    'file-invoice': <FileText className="text-white text-2xl" />,
    'building': <Building2 className="text-white text-2xl" />,
    'clipboard-check': <ClipboardCheck className="text-white text-2xl" />,
    'users': <Users className="text-white text-2xl" />,
    'award': <Award className="text-white text-2xl" />,
    'target': <Target className="text-white text-2xl" />,
    'trending-up': <TrendingUp className="text-white text-2xl" />,
    'briefcase': <Briefcase className="text-white text-2xl" />,
    'settings': <Settings className="text-white text-2xl" />
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section id="services" className="section-spacing bg-white">
      <div className="mx-responsive">
        <motion.div 
          className="text-center content-spacing"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-responsive font-bold text-primary mb-3 md:mb-4">Our Services</h2>
          <p className="subtitle-responsive max-w-3xl mx-auto">
            We provide comprehensive business solutions tailored to your specific needs.
          </p>
        </motion.div>
        
        {isLoading ? (
          <GridSkeleton count={2} className="symmetrical-grid-2" />
        ) : (
          <motion.div 
            className="symmetrical-grid-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services?.data.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-gray-50 rounded-lg shadow-card shadow-card-hover transition-medium border-t-4 border-primary h-full">
                  <CardContent className="p-5 sm:p-6 md:p-8 h-full flex flex-col">
                    <div className="flex items-start mb-4 md:mb-5">
                      <motion.div 
                        className="bg-yellow-500 p-3 rounded-full mr-4 flex items-center justify-center w-[44px] h-[44px] sm:w-[52px] sm:h-[52px]"
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {iconMap[service.icon] || <Briefcase className="text-white text-2xl" />}
                      </motion.div>
                      <h3 className="text-xl md:text-2xl font-bold text-primary pt-1.5">{service.title}</h3>
                    </div>
                    
                    {/* Show the features list with improved spacing and sizing */}
                    <div className="mb-6">
                      <h4 className="text-sm sm:text-base font-semibold mb-3">Key Features:</h4>
                      <ul className="text-sm sm:text-base text-gray-700 space-y-2 list-none">
                        {Array.isArray(service.features) && service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <motion.div 
                      className="mt-auto"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link 
                        href={`/services/${service.id}`} 
                        className="inline-flex items-center text-primary font-medium hover:text-accent transition-medium text-base"
                      >
                        Learn more <span className="ml-2">→</span>
                      </Link>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
