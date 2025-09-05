import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Mail, Phone, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function ContactSection() {
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

  return (
    <section id="contact" className="section-spacing bg-gray-50">
      <div className="mx-responsive">
        <div className="text-center content-spacing">
          <h2 className="heading-responsive font-bold text-primary mb-4">Contact Us</h2>
          <p className="subtitle-responsive max-w-3xl mx-auto">
            Get in touch with our team to discuss your business needs.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 max-w-content-md md:max-w-none mx-auto">
          {/* Contact Information - optimized for mobile */}
          <Card className="lg:col-span-2 shadow-card h-full">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-6 md:mb-8">Our Information</h3>
              
              <div className="space-y-6">
                {/* Location with better tap target */}
                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 text-base md:text-lg">Location</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      <a 
                        href="https://maps.app.goo.gl/q8xTrJTi7XNRbT7Z8" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline transition-colors block py-1"
                      >
                        MCF-6503, Sanjay Colony, Sector-23, 33 Feet Road<br/>
                        Near Rana Aata Chakki, Faridabad, Haryana 121005
                      </a>
                    </p>
                  </div>
                </div>
                
                {/* Email with better tap target */}
                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 text-base md:text-lg">Email</h4>
                    <div className="text-gray-600 text-sm md:text-base">
                      <a 
                        href="mailto:bcs04062013@gmail.com" 
                        className="hover:text-primary hover:underline transition-colors block py-1"
                      >
                        bcs04062013@gmail.com
                      </a>
                      <a 
                        href="mailto:varjunupadhyay@gmail.com" 
                        className="hover:text-primary hover:underline transition-colors block py-1"
                      >
                        varjunupadhyay@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Phone with better tap target */}
                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 text-base md:text-lg">Phone</h4>
                    <div className="text-gray-600 text-sm md:text-base">
                      <a 
                        href="tel:+917827284027" 
                        className="hover:text-primary hover:underline transition-colors block py-1"
                      >
                        +91 7827284027
                      </a>
                      <a 
                        href="tel:+918700761218" 
                        className="hover:text-primary hover:underline transition-colors block py-1"
                      >
                        +91 8700761218
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Business Hours with better tap target */}
                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4 text-white flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 text-base md:text-lg">Business Hours</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Monday - Friday: 9:00 AM - 6:00 PM<br/>
                      Saturday: 10:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Social Media with better tap targets */}
              <div className="mt-10">
                <h4 className="font-medium text-gray-800 mb-4 text-base md:text-lg">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/share/19gk3NuZ5F/" target="_blank" rel="noopener noreferrer" 
                     className="bg-blue-500 p-2.5 rounded-full text-white hover:bg-blue-600 transition-medium shadow-sm hover:shadow-md flex items-center justify-center w-10 h-10 md:w-11 md:h-11">
                    <Facebook size={22} />
                  </a>
                  <a href="https://x.com/veerupyy?t=3j_t11dcqUTDxbptxjEw_w&s=09" target="_blank" rel="noopener noreferrer" 
                     className="bg-blue-400 p-2.5 rounded-full text-white hover:bg-blue-500 transition-medium shadow-sm hover:shadow-md flex items-center justify-center w-10 h-10 md:w-11 md:h-11">
                    <Twitter size={22} />
                  </a>
                  <a href="https://www.linkedin.com/in/veerarjun-upadhyay-a41001313?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" 
                     className="bg-blue-700 p-2.5 rounded-full text-white hover:bg-blue-800 transition-medium shadow-sm hover:shadow-md flex items-center justify-center w-10 h-10 md:w-11 md:h-11">
                    <Linkedin size={22} />
                  </a>
                  <a href="https://www.instagram.com/veerarjunupadhyay?igsh=MXA5bmtkNHZlbmV5eg==" target="_blank" rel="noopener noreferrer" 
                     className="bg-pink-500 p-2.5 rounded-full text-white hover:bg-pink-600 transition-medium shadow-sm hover:shadow-md flex items-center justify-center w-10 h-10 md:w-11 md:h-11">
                    <Instagram size={22} />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Form - optimized for mobile */}
          <Card className="lg:col-span-3 shadow-card">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-6 md:mb-7">Send Us a Message</h3>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium mb-2 block">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-base" 
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-medium mb-2 block">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base" 
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-base font-medium mb-2 block">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-base" 
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-base font-medium mb-2 block">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-12 text-base">
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
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-base font-medium mb-2 block">Message</Label>
                  <Textarea 
                    id="message" 
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none min-h-[140px] text-base" 
                    placeholder="Your message"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-accent h-12 text-base shadow-md hover:shadow-lg transition-all font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
