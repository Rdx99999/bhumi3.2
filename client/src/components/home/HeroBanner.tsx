import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, BarChart, Target } from "lucide-react";

export default function HeroBanner() {
  return (
    <section id="home" className="section-spacing bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden relative">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      
      {/* Accent Circles - symmetrically placed */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
      
      <div className="mx-responsive py-responsive relative">
        <div className="symmetrical-grid-2 items-center">
          <motion.div 
            className="order-2 md:order-1 flex flex-col justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.7,
              ease: "easeOut"
            }}
          >
            <motion.div
              className="mb-4 inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
            >
              <span className="bg-blue-500 bg-opacity-30 px-4 py-1.5 rounded-full text-sm sm:text-base font-medium tracking-wide text-blue-100">
                Trusted Business Partner
              </span>
            </motion.div>
            
            <motion.h1 
              className="heading-responsive font-bold leading-tight mb-4 sm:mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Professional <span className="text-blue-300">Consultancy</span> Services for Your Business
            </motion.h1>
            
            <motion.p 
              className="text-responsive mb-6 sm:mb-8 text-blue-100 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Expert audit preparation, business training programs, and comprehensive consultancy services to help your business thrive in today's competitive market.
            </motion.p>
            
            <motion.div
              className="space-y-4 mb-8 md:pr-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-responsive">ISO certification and compliance solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-responsive">Specialized industry training programs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-responsive">Strategic business consulting services</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <Link href="/about">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="font-medium shadow-lg text-sm sm:text-base rounded-md px-6 py-6 h-auto gap-2 bg-blue-600 hover:bg-blue-700">
                    Explore Our Services
                    <ArrowRight size={16} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="bg-primary bg-opacity-50 border-blue-400 text-white hover:bg-primary-dark hover:bg-opacity-80 font-medium shadow-lg text-sm sm:text-base rounded-md px-6 py-6 h-auto">
                    Contact Us
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2 flex justify-center md:justify-end mb-8 md:mb-0 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Image frame with shadow and effect */}
            <div className="relative z-10 w-full max-w-md mx-auto md:mx-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-lg blur opacity-30"></div>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <img 
                  src="https://replit.com/cdn-cgi/image/format=auto/https://huggingface.co/Aman6u5/ddddttyyuu/resolve/main/veer%20arjum.png?download=true" 
                  alt="Managing Director - Veer Arjun Upadhyay" 
                  className="rounded-lg shadow-xl w-full h-auto relative z-10"
                />
                
                {/* Decorative elements */}
                <div className="absolute -bottom-5 -right-5 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-20">
                  <BarChart className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                
                <div className="absolute -top-5 -left-5 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-20">
                  <Target className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              </motion.div>
            </div>
            
            {/* Decorative background pattern */}
            <div className="absolute -z-10 w-full h-full scale-110 bg-blue-500 opacity-5 rounded-full blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
