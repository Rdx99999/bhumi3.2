import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram, Mail, ChevronRight, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import logoImage from "@assets/bcslogo (3)_1756309053901.png";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/training-programs", label: "Training Programs" },
  { href: "/verify-certificate", label: "Verify Certificate" },
  { href: "/contact", label: "Contact" }
];

const serviceLinks = [
  { href: "#consultancy", label: "Consultancy Services" },
  { href: "#audit", label: "Audit Preparation" },
  { href: "/training-programs", label: "Training Programs" },
  { href: "/verify-certificate", label: "Certificate Verification" },
  { href: "#strategy", label: "Business Strategy" }
];

interface ContactItemProps {
  icon: React.ComponentType<any>;
  children: ReactNode;
}

const ContactItem = ({ icon: Icon, children }: ContactItemProps) => (
  <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
    <div className="mt-0.5 sm:mt-1 flex-shrink-0">
      <Icon size={14} className="sm:w-[18px] sm:h-[18px] text-blue-200" />
    </div>
    <div className="flex-1 text-blue-100 leading-snug">{children}</div>
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-10 sm:pt-16 pb-6 sm:pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-optimized grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-10 mb-8 sm:mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <img 
                src={logoImage} 
                alt="Bhumi Consultancy Services" 
                className="h-10 w-auto object-contain transition-transform hover:scale-105"
              />
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">Bhumi Consultancy Services</h3>
            </div>
            <p className="text-blue-100 mb-5 sm:mb-6 text-sm leading-relaxed">
              Professional consultancy services dedicated to helping businesses grow, optimize operations, and achieve sustainable success through expert guidance and tailored solutions.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/share/19gk3NuZ5F/" target="_blank" rel="noopener noreferrer" 
                 className="w-9 h-9 rounded-full bg-black bg-opacity-20 flex items-center justify-center text-blue-200 hover:text-white hover:bg-opacity-30 transition duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://x.com/veerupyy?t=3j_t11dcqUTDxbptxjEw_w&s=09" target="_blank" rel="noopener noreferrer" 
                 className="w-9 h-9 rounded-full bg-black bg-opacity-20 flex items-center justify-center text-blue-200 hover:text-white hover:bg-opacity-30 transition duration-300">
                <Twitter size={18} />
              </a>
              <a href="https://www.linkedin.com/in/veerarjun-upadhyay-a41001313?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
                 target="_blank" rel="noopener noreferrer" 
                 className="w-9 h-9 rounded-full bg-black bg-opacity-20 flex items-center justify-center text-blue-200 hover:text-white hover:bg-opacity-30 transition duration-300">
                <Linkedin size={18} />
              </a>
              <a href="https://www.instagram.com/veerarjunupadhyay?igsh=MXA5bmtkNHZlbmV5eg==" target="_blank" rel="noopener noreferrer" 
                 className="w-9 h-9 rounded-full bg-black bg-opacity-20 flex items-center justify-center text-blue-200 hover:text-white hover:bg-opacity-30 transition duration-300">
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links - better touch targets for mobile */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 tracking-tight">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href} className="group">
                  <Link href={link.href} className="text-blue-100 group-hover:text-white transition duration-300 flex items-center text-sm py-1">
                    <ChevronRight size={14} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services - better touch targets for mobile */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 tracking-tight">Our Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index} className="group">
                  <Link href={link.href} className="text-blue-100 group-hover:text-white transition duration-300 flex items-center text-sm py-1">
                    <ChevronRight size={14} className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact - optimized for mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 tracking-tight">Stay Updated</h4>
            <p className="text-blue-100 mb-4 text-sm">Subscribe to our newsletter for exclusive updates and insights.</p>
            
            <form className="space-y-3 mb-6" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Input 
                  type="email" 
                  className="w-full pl-4 pr-24 py-2 border-0 bg-black bg-opacity-20 rounded-md text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" 
                  placeholder="Your email address" 
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="absolute right-1 top-1 h-8 px-3 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium"
                >
                  Subscribe
                </Button>
              </div>
            </form>
            
            <div className="space-y-4">
              <ContactItem icon={Mail}>
                <a href="mailto:bcs04062013@gmail.com" className="hover:text-white transition-colors text-sm block">
                  bcs04062013@gmail.com
                </a>
                <a href="mailto:varjunupadhyay@gmail.com" className="hover:text-white transition-colors text-sm block">
                  varjunupadhyay@gmail.com
                </a>
              </ContactItem>
              <ContactItem icon={Phone}>
                <a href="tel:+917827284027" className="hover:text-white transition-colors text-sm block">
                  +91 7827284027
                </a>
                <a href="tel:+918700761218" className="hover:text-white transition-colors text-sm block">
                  +91 8700761218
                </a>
              </ContactItem>
              <ContactItem icon={MapPin}>
                <a href="https://maps.app.goo.gl/q8xTrJTi7XNRbT7Z8" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">
                  MCF-6503, Sanjay Colony, Sector-23,<br/> 
                  33 Feet Road, Near Rana Aata Chakki,<br/>
                  Faridabad, Haryana 121005
                </a>
              </ContactItem>
            </div>
          </div>
        </div>
        
        {/* Better mobile layout for copyright section */}
        <div className="pt-6 sm:pt-8 border-t border-blue-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm mb-4 md:mb-0 text-center md:text-left">&copy; {new Date().getFullYear()} Bhumi Consultancy Services. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-blue-200">
              <a href="#" className="hover:text-white transition-colors py-1">Privacy Policy</a>
              <span className="hidden sm:inline self-center">•</span>
              <a href="#" className="hover:text-white transition-colors py-1">Terms of Service</a>
              <span className="hidden sm:inline self-center">•</span>
              <a href="#" className="hover:text-white transition-colors py-1">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
