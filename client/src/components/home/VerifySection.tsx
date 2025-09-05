import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CertificateCard } from "@/components/ui/certificate-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CertificateVerificationResult } from "@shared/cloudflare-api";

export default function VerifySection() {
  const [activeTab, setActiveTab] = useState<'verify' | 'status'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);
  const { toast } = useToast();

  // Form state
  const [certificateId, setCertificateId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId || !participantName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setVerificationResult(null);
    
    try {
      const res = await apiRequest('POST', '/api/verify-certificate', {
        certificateId,
        fullName: participantName
      });
      
      const data = await res.json();
      
      if (data.success) {
        setVerificationResult(data.data);
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Certificate could not be verified",
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
  
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participantId || !participantEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/check-status', {
        participantId,
        email: participantEmail
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Status Check Successful",
          description: `Status: ${data.data.participant.status}`,
        });
        
        // Redirect to full verify page with the data
        // This is a simplified implementation for the homepage section
      } else {
        toast({
          title: "Status Check Failed",
          description: data.error || "Participant not found",
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
    <section id="verify" className="section-spacing bg-white">
      <div className="mx-responsive">
        <div className="max-w-3xl mx-auto">
          <div className="text-center content-spacing">
            <h2 className="heading-responsive font-bold text-primary mb-3 md:mb-4">Verify Certificate</h2>
            <p className="subtitle-responsive max-w-2xl mx-auto">
              Check the authenticity of your certificate or view your training status.
            </p>
          </div>
          
          <Card className="shadow-card transition-medium">
            <CardContent className="p-5 sm:p-6 md:p-8">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-center mb-5 sm:mb-6">
                  <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
                    <Button
                      variant={activeTab === 'verify' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('verify')}
                      className={`flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base ${
                        activeTab === 'verify' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Verify Certificate
                    </Button>
                    <Button
                      variant={activeTab === 'status' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('status')}
                      className={`flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base ${
                        activeTab === 'status' 
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Check Status
                    </Button>
                  </div>
                </div>
                
                {/* Verify Certificate Form */}
                {activeTab === 'verify' && (
                  <Card className="shadow-sm border border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <form className="space-y-5" onSubmit={handleVerifyCertificate}>
                        <div>
                          <Label htmlFor="certificate-id" className="text-base font-medium mb-1.5 block">
                            Certificate ID
                          </Label>
                          <Input 
                            id="certificate-id" 
                            value={certificateId}
                            onChange={(e) => setCertificateId(e.target.value)}
                            placeholder="Enter your certificate ID"
                            className="h-10 sm:h-11"
                          />
                        </div>
                        <div>
                          <Label htmlFor="participant-name" className="text-base font-medium mb-1.5 block">
                            Full Name
                          </Label>
                          <Input 
                            id="participant-name" 
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            placeholder="Enter your full name"
                            className="h-10 sm:h-11"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-accent h-10 sm:h-11 text-sm sm:text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? "Verifying..." : "Verify Certificate"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
                
                {/* Check Status Form */}
                {activeTab === 'status' && (
                  <Card className="shadow-sm border border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <form className="space-y-5" onSubmit={handleCheckStatus}>
                        <div>
                          <Label htmlFor="participant-id" className="text-base font-medium mb-1.5 block">
                            Participant ID
                          </Label>
                          <Input 
                            id="participant-id" 
                            value={participantId}
                            onChange={(e) => setParticipantId(e.target.value)}
                            placeholder="Enter your participant ID"
                            className="h-10 sm:h-11"
                          />
                        </div>
                        <div>
                          <Label htmlFor="participant-email" className="text-base font-medium mb-1.5 block">
                            Email Address
                          </Label>
                          <Input 
                            id="participant-email" 
                            type="email"
                            value={participantEmail}
                            onChange={(e) => setParticipantEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="h-10 sm:h-11"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-accent h-10 sm:h-11 text-sm sm:text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? "Checking..." : "Check Status"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Results Section */}
              {verificationResult && (
                <div className="mt-6 sm:mt-8 fade-in">
                  <CertificateCard 
                    certificate={verificationResult.certificate}
                    participant={verificationResult.participant}
                    training={verificationResult.training}
                  />
                </div>
              )}
              
              <div className="mt-5 sm:mt-7 text-center">
                <Link href="/verify-certificate">
                  <Button variant="link" className="text-primary text-sm sm:text-base">
                    Go to full verification page →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
