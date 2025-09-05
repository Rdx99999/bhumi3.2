import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Mail, Phone, Clock, Facebook, Twitter, Linkedin, Instagram, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Spinner, SuccessCheck } from "@/components/ui/loading-animation";
import SEO from "@/components/SEO/SEO";

export default function Contact() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/contact', {
        name,
        email,
        phone,
        subject,
        message
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Message Sent",
          description: "Thank you for your message. We will get back to you soon!",
        });
        
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        toast({
          title: "Submission Failed",
          description: data.error || "There was a problem sending your message",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to top when navigating to this page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Social media hover animation variants
  const socialIconVariants = {
    hover: { scale: 1.2, rotate: 10 },
    tap: { scale: 0.95 }
  };

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Enhanced submit handler with animation
  const enhancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/contact', {
        name,
        email,
        phone,
        subject,
        message
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Show success animation
        setShowSuccess(true);
        
        // Hide success animation after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          
          toast({
            title: "Message Sent",
            description: "Thank you for your message. We will get back to you soon!",
          });
          
          // Reset form
          setName("");
          setEmail("");
          setPhone("");
          setSubject("");
          setMessage("");
        }, 2000);
      } else {
        toast({
          title: "Submission Failed",
          description: data.error || "There was a problem sending your message",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-10 sm:py-12 bg-gray-50">
      {/* SEO for Contact page */}
      <SEO
        title="Contact Us | Bhumi Consultancy Services"
        description="Get in touch with Bhumi Consultancy Services. Contact our team to discuss your business needs, training programs, or certification services."
        keywords="contact bhumi consultancy, business consulting contact, training programs contact, bhumi contact form, certificate verification assistance"
        canonicalUrl="https://bhumiconsultancy.in/contact"
        structuredData={{
          type: 'organization',
          data: {
            name: 'Bhumi Consultancy Services',
            url: 'https://bhumiconsultancy.in',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+91 7827284027',
              contactType: 'customer support',
              areaServed: 'IN',
              availableLanguage: ['en', 'hi']
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'MCF-6503, Sanjay Colony, Sector-23, 33 Feet Road, Near Rana Aata Chakki',
              addressLocality: 'Faridabad',
              addressRegion: 'Haryana',
              postalCode: '121005',
              addressCountry: 'IN'
            }
          }
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Get in touch with our team to discuss your business needs and how we can help you succeed.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-5 gap-6 md:gap-8">
          {/* Contact Information */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-primary mb-4 md:mb-6">Our Information</h3>
                
                <motion.div 
                  className="space-y-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="flex items-start"
                    variants={fadeIn}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-[40px] h-[40px]"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <MapPin size={22} />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Location</h4>
                      <p className="text-gray-600">
                        <a 
                          href="https://maps.app.goo.gl/q8xTrJTi7XNRbT7Z8" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          MCF-6503, Sanjay Colony, Sector-23, 33 Feet Road<br/>
                          Near Rana Aata Chakki, Faridabad, Haryana 121005
                        </a>
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start"
                    variants={fadeIn}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-[40px] h-[40px]"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Mail size={22} />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Email</h4>
                      <p className="text-gray-600">
                        <a 
                          href="mailto:bcs04062013@gmail.com" 
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          bcs04062013@gmail.com
                        </a>
                        <br/>
                        <a 
                          href="mailto:varjunupadhyay@gmail.com" 
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          varjunupadhyay@gmail.com
                        </a>
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start"
                    variants={fadeIn}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-[40px] h-[40px]"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Phone size={22} />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Phone</h4>
                      <p className="text-gray-600">
                        <a 
                          href="tel:+917827284027" 
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          +91 7827284027
                        </a>
                        <br/>
                        <a 
                          href="tel:+918700761218" 
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          +91 8700761218
                        </a>
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start"
                    variants={fadeIn}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-[40px] h-[40px]"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Clock size={22} />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Business Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM<br/>Saturday: 10:00 AM - 2:00 PM</p>
                    </div>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <h4 className="font-medium text-gray-800 mb-3">Follow Us</h4>
                  <div className="flex space-x-4">
                    <motion.a 
                      href="https://www.facebook.com/share/19gk3NuZ5F/"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 transition duration-300 flex items-center justify-center w-[36px] h-[36px]"
                      whileHover={socialIconVariants.hover}
                      whileTap={socialIconVariants.tap}
                    >
                      <Facebook size={20} />
                    </motion.a>
                    <motion.a 
                      href="https://x.com/veerupyy?t=3j_t11dcqUTDxbptxjEw_w&s=09"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-400 p-2 rounded-full text-white hover:bg-blue-500 transition duration-300 flex items-center justify-center w-[36px] h-[36px]"
                      whileHover={socialIconVariants.hover}
                      whileTap={socialIconVariants.tap}
                    >
                      <Twitter size={20} />
                    </motion.a>
                    <motion.a 
                      href="https://www.linkedin.com/in/veerarjun-upadhyay-a41001313?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-700 p-2 rounded-full text-white hover:bg-blue-800 transition duration-300 flex items-center justify-center w-[36px] h-[36px]"
                      whileHover={socialIconVariants.hover}
                      whileTap={socialIconVariants.tap}
                    >
                      <Linkedin size={20} />
                    </motion.a>
                    <motion.a 
                      href="https://www.instagram.com/veerarjunupadhyay?igsh=MXA5bmtkNHZlbmV5eg=="
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-pink-500 p-2 rounded-full text-white hover:bg-pink-600 transition duration-300 flex items-center justify-center w-[36px] h-[36px]"
                      whileHover={socialIconVariants.hover}
                      whileTap={socialIconVariants.tap}
                    >
                      <Instagram size={20} />
                    </motion.a>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div 
            className="md:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <CardContent className="p-6 sm:p-8 relative">
                {/* Success overlay */}
                {showSuccess && (
                  <motion.div 
                    className="absolute inset-0 bg-white bg-opacity-90 z-10 flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SuccessCheck className="mb-4" />
                    <motion.p 
                      className="text-xl font-medium text-green-600"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      Message Sent Successfully!
                    </motion.p>
                  </motion.div>
                )}
              
                <motion.h3 
                  className="text-xl font-bold text-primary mb-4 md:mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Send Us a Message
                </motion.h3>
                
                <form className="space-y-4" onSubmit={enhancedSubmit}>
                  <motion.div 
                    className="grid md:grid-cols-2 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={fadeIn}>
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1" 
                        placeholder="Your full name"
                      />
                    </motion.div>
                    <motion.div variants={fadeIn}>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1" 
                        placeholder="Your email address"
                      />
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1" 
                      placeholder="Your phone number"
                    />
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultancy Services">Consultancy Services</SelectItem>
                        <SelectItem value="Audit Preparation">Audit Preparation</SelectItem>
                        <SelectItem value="Training Programs">Training Programs</SelectItem>
                        <SelectItem value="Certificate Verification">Certificate Verification</SelectItem>
                        <SelectItem value="Other Inquiry">Other Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1" 
                      placeholder="Your message"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-accent"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Spinner size="small" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Map Section */}
        <motion.div 
          className="mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="rounded-lg overflow-hidden shadow-md h-64 sm:h-96">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.4694845126133!2d77.31289427578356!3d28.401350097525867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdbeec33b1511%3A0x4e4d143b706aedd9!2sBhumi%20consultancy%20services!5e0!3m2!1sen!2sin!4v1712688123559!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Bhumi Consultancy Services Location"
              className="rounded-lg"
            />
          </div>
          <div className="mt-2 text-center">
            <a 
              href="https://maps.app.goo.gl/q8xTrJTi7XNRbT7Z8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark text-sm font-medium hover:underline transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
