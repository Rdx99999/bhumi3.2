import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CertificateCard } from "@/components/ui/certificate-card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CertificateVerificationResult, ParticipantStatusResult } from "@shared/cloudflare-api";
import { Clock, Download, CheckCircle, XCircle } from "lucide-react";
import SEO from "@/components/SEO/SEO";

export default function VerifyCertificate() {
  const [activeTab, setActiveTab] = useState("verify");
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);
  const [statusResult, setStatusResult] = useState<ParticipantStatusResult | null>(null);
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
    
    setIsVerifyLoading(true);
    setVerificationResult(null);
    
    try {
      const res = await apiRequest('POST', '/api/verify-certificate', {
        certificateId,
        participantName
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
      setIsVerifyLoading(false);
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
    
    setIsStatusLoading(true);
    setStatusResult(null);
    
    try {
      const res = await apiRequest('POST', '/api/check-status', {
        participantId,
        email: participantEmail
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatusResult(data.data);
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
      setIsStatusLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen">
      {/* SEO for verification page */}
      <SEO
        title="Certificate Verification | Check Training Status | Bhumi Consultancy"
        description="Verify the authenticity of certificates issued by Bhumi Consultancy or check your training program status with our secure verification tool."
        keywords="certificate verification, training program status, credential verification, check certificate, bhumi consultancy"
        canonicalUrl="https://bhumiconsultancy.in/verify-certificate"
        structuredData={{
          type: 'organization',
          data: {
            name: 'Bhumi Consultancy Services',
            url: 'https://bhumiconsultancy.in/verify-certificate',
            description: 'Official certificate verification tool for Bhumi Consultancy training programs.',
            serviceType: 'Certificate Verification Service'
          }
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 fade-in">
            <h1 className="text-4xl font-bold text-primary mb-4">Certificate & Status Verification</h1>
            <p className="text-lg text-gray-600">
              Check the authenticity of your certificate or view your training status.
            </p>
          </div>
          
          <Card className="shadow-card transition-medium">
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="verify" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="verify" className="text-base py-3">Verify Certificate</TabsTrigger>
                  <TabsTrigger value="status" className="text-base py-3">Check Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="verify" className="slide-up">
                  <Card className="shadow-sm border-blue-100">
                    <CardHeader className="bg-blue-50 bg-opacity-50">
                      <CardTitle className="text-xl text-primary">Certificate Verification</CardTitle>
                      <CardDescription className="text-gray-600">
                        Enter your certificate ID and full name to verify the authenticity of your certificate.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form className="space-y-6" onSubmit={handleVerifyCertificate}>
                        <div>
                          <Label htmlFor="certificate-id" className="text-base font-medium">Certificate ID</Label>
                          <Input 
                            id="certificate-id" 
                            value={certificateId}
                            onChange={(e) => setCertificateId(e.target.value)}
                            placeholder="Enter your certificate ID"
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="participant-name" className="text-base font-medium">Full Name</Label>
                          <Input 
                            id="participant-name" 
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            placeholder="Enter your full name as on certificate"
                            className="mt-2 h-12"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base shadow-sm hover:shadow-md transition-all"
                          disabled={isVerifyLoading}
                        >
                          {isVerifyLoading ? "Verifying..." : "Verify Certificate"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  {verificationResult && (
                    <div className="mt-8 slide-up">
                      <CertificateCard 
                        certificate={verificationResult.certificate}
                        participant={verificationResult.participant}
                        training={verificationResult.training}
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="status" className="slide-up">
                  <Card className="shadow-sm border-blue-100">
                    <CardHeader className="bg-blue-50 bg-opacity-50">
                      <CardTitle className="text-xl text-primary">Training Status Check</CardTitle>
                      <CardDescription className="text-gray-600">
                        Enter your participant ID and email to check your training status and certificates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form className="space-y-6" onSubmit={handleCheckStatus}>
                        <div>
                          <Label htmlFor="participant-id" className="text-base font-medium">Participant ID</Label>
                          <Input 
                            id="participant-id" 
                            value={participantId}
                            onChange={(e) => setParticipantId(e.target.value)}
                            placeholder="Enter your participant ID"
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="participant-email" className="text-base font-medium">Email Address</Label>
                          <Input 
                            id="participant-email" 
                            type="email"
                            value={participantEmail}
                            onChange={(e) => setParticipantEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="mt-2 h-12"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base shadow-sm hover:shadow-md transition-all"
                          disabled={isStatusLoading}
                        >
                          {isStatusLoading ? "Checking..." : "Check Status"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  {statusResult && (
                    <div className="mt-8 slide-up">
                      <Card className="mb-6 shadow-soft border-blue-100 overflow-hidden">
                        <div className="bg-blue-50 p-4 border-b border-blue-100">
                          <h3 className="text-xl font-bold text-primary">Participant Information</h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-5">
                            <div className="bg-blue-100 p-3 rounded-full shadow-sm">
                              <CheckCircle className="text-primary h-6 w-6" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-800">{statusResult.participant.name}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <span>ID:</span> 
                                <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">
                                  {statusResult.participant.participantId}
                                </code>
                              </div>
                            </div>
                            <div className="ml-auto">
                              <Badge className={`px-3 py-1 text-sm ${
                                statusResult.participant.status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : statusResult.participant.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}>
                                <span className={`h-2 w-2 rounded-full mr-1.5 inline-block ${
                                  statusResult.participant.status === 'active'
                                    ? 'bg-green-600 animate-pulse' 
                                    : statusResult.participant.status === 'completed'
                                    ? 'bg-blue-600'
                                    : 'bg-yellow-600'
                                }`}></span>
                                {statusResult.participant.status.charAt(0).toUpperCase() + statusResult.participant.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="mb-4 flex items-center">
                        <h3 className="text-xl font-bold text-gray-800">Enrolled Programs</h3>
                        <Badge className="ml-3 bg-blue-50 text-blue-800 border-blue-200">
                          {statusResult.enrolledPrograms.length} {statusResult.enrolledPrograms.length === 1 ? 'Program' : 'Programs'}
                        </Badge>
                      </div>
                      
                      {statusResult.enrolledPrograms.length === 0 ? (
                        <Card className="shadow-soft border-gray-100">
                          <CardContent className="p-10 text-center">
                            <XCircle className="h-14 w-14 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 text-lg">No enrolled programs found</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {statusResult.enrolledPrograms.map((program, index) => (
                            <Card key={index} className="shadow-card shadow-card-hover transition-medium border-gray-100">
                              <CardContent className="p-6">
                                <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-3 mb-4">
                                  <h3 className="text-lg font-bold text-gray-800">{program.name}</h3>
                                  {program.certificateId ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                      <span className="h-2 w-2 rounded-full bg-green-600 mr-1.5 inline-block"></span> 
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                                      <span className="h-2 w-2 rounded-full bg-yellow-600 mr-1.5 inline-block animate-pulse"></span> 
                                      In Progress
                                    </Badge>
                                  )}
                                </div>
                                
                                {program.completionDate && (
                                  <div className="flex items-center text-gray-600 mb-4 text-sm bg-gray-50 p-2 rounded-md inline-block">
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" /> 
                                    Completed on: <span className="font-medium ml-1">{new Date(program.completionDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}</span>
                                  </div>
                                )}
                                
                                {program.certificateId && (
                                  <div className="mt-4">
                                    <Button 
                                      className="gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                                      onClick={async () => {
                                        // Use the downloadPublicCertificate function instead of direct access
                                        if (program.certificateId) {
                                          toast({
                                            description: "Downloading certificate...",
                                            duration: 3000
                                          });
                                          
                                          try {
                                            const response = await apiRequest('GET', `/api/certificates/download/${program.certificateId}`, undefined, false);
                                            // Parse the response as JSON
                                            const responseData = await response.json();
                                            
                                            console.log("Certificate download response:", responseData);
                                            
                                            // Check if the response is successful and contains data
                                            if (responseData.success && responseData.data) {
                                              // Try to find a URL in the response - either downloadUrl or url property
                                              const downloadUrl = responseData.data.downloadUrl || responseData.data.url;
                                              
                                              if (downloadUrl) {
                                                // Open the actual download URL in a new tab
                                                window.open(downloadUrl, '_blank');
                                              } else {
                                                console.log("Download response data:", responseData.data);
                                                throw new Error("No download URL found in response");
                                              }
                                            } else {
                                              throw new Error("Failed to get download URL");
                                            }
                                          } catch (error) {
                                            toast({
                                              variant: "destructive",
                                              title: "Download failed",
                                              description: "Could not download the certificate. Please try again.",
                                              duration: 3000
                                            });
                                          }
                                        }
                                      }}
                                    >
                                      <Download size={18} /> Download Certificate
                                    </Button>
                                    <div className="mt-2 text-xs text-gray-500">
                                      Certificate ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{program.certificateId}</code>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
