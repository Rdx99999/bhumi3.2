import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImage from "@assets/bcslogo (3)_1756309053901.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/training-programs", label: "Training Programs" },
  { href: "/verify-certificate", label: "Verify Certificate" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scrolling effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled 
        ? "bg-white bg-opacity-95 backdrop-blur-sm shadow-md" 
        : "bg-white shadow-sm"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Bhumi Consultancy Services" 
              className="h-16 w-auto object-contain transition-transform hover:scale-105"
            />
            <div>
              <h1 className="text-primary text-xl font-bold tracking-tight">Bhumi Consultancy Services</h1>
              <p className="text-xs text-gray-600 font-medium">Professional Business Solutions</p>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md font-medium text-sm transition-all duration-300",
                  location === link.href 
                    ? "text-primary bg-primary/5 font-semibold" 
                    : "text-gray-700 hover:text-primary hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button 
              className="ml-2 font-medium shadow-sm"
              size="sm"
            >
              Get Started
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className={cn(
                "text-gray-700 hover:bg-gray-100",
                isMenuOpen && "bg-gray-100"
              )}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Nav - with smooth animation */}
        <div 
          ref={menuRef}
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 border-t border-gray-100",
            isMenuOpen 
              ? "max-h-96 opacity-100" 
              : "max-h-0 opacity-0 border-t-0"
          )}
        >
          <div className="flex flex-col space-y-1 py-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-md font-medium transition-colors duration-200",
                  location === link.href 
                    ? "text-primary bg-primary/5 font-semibold" 
                    : "text-gray-700 hover:text-primary hover:bg-gray-50"
                )}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 px-4">
              <Button className="w-full font-medium shadow-sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
