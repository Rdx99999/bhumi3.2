import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download } from "lucide-react";
import { useState } from "react";
import { downloadPublicCertificate } from "@/lib/cloudflare-api";
import { useToast } from "@/hooks/use-toast";

interface CertificateCardProps {
  participant: {
    name: string;
    id: number;
  };
  training: {
    name: string;
    id: number;
  };
  certificate: {
    certificateId: string;
    issueDate: string;
    status: 'active' | 'expired' | 'revoked';
    certificatePath?: string;
  };
}

export function CertificateCard({ participant, training, certificate }: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // First try to use direct certificate path if available
      if (certificate.certificatePath) {
        window.open(certificate.certificatePath, '_blank');
        setIsDownloading(false);
        return;
      }

      // Otherwise, call the API to get the download URL
      const response = await fetch(`/api/certificates/download/${certificate.certificateId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certificate: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log("Certificate card download response:", responseData);
      
      if (responseData.success && responseData.data) {
        // Try to find a URL in the response data - check both downloadUrl and url properties
        const downloadUrl = responseData.data.downloadUrl || responseData.data.url;
        
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        } else {
          console.log("Download response data:", responseData.data);
          throw new Error("No download URL found in response");
        }
      } else {
        throw new Error(responseData.error || "Certificate could not be downloaded");
      }
    } catch (error) {
      toast({
        title: "Error downloading certificate",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Format the issue date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="border-2 border-green-200 bg-green-50 shadow-soft transition-fast hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-3 rounded-full mr-3 shadow-sm">
            <Check className="text-green-600 h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-green-800">Certificate Verified</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 bg-white p-4 rounded-lg border border-green-100">
            <div className="text-gray-600 font-medium">Participant Name:</div>
            <div className="font-bold text-gray-800">{participant.name}</div>
            
            <div className="text-gray-600 font-medium">Training Program:</div>
            <div className="font-bold text-gray-800">{training.name}</div>
            
            <div className="text-gray-600 font-medium">Issue Date:</div>
            <div className="font-bold text-gray-800">{formatDate(certificate.issueDate)}</div>
            
            <div className="text-gray-600 font-medium">Certificate ID:</div>
            <div className="font-bold text-gray-800 font-mono tracking-tight">{certificate.certificateId}</div>
            
            <div className="text-gray-600 font-medium">Status:</div>
            <div className="font-bold">
              {certificate.status === 'expired' ? (
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-red-600 mr-2 inline-block"></span> 
                  Expired
                </Badge>
              ) : certificate.status === 'revoked' ? (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-gray-600 mr-2 inline-block"></span> 
                  Revoked
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-2 inline-block animate-pulse"></span> 
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={18} /> {isDownloading ? "Downloading..." : "Download Certificate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
