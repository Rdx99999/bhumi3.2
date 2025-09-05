import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { updateCertificate } from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { TrainingProgram, Participant, Certificate } from '@shared/schema';

export default function EditCertificate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const certificateId = parseInt(id!);
  
  const [certificateData, setCertificateData] = useState({
    certificateId: '',
    participantId: 0,
    trainingProgramId: 0,
    issueDate: '',
    expiryDate: '',
    certificatePath: ''
  });

  // Query certificate
  const { data: certificate, isLoading: isLoadingCertificate } = useQuery<{ data: Certificate }>({
    queryKey: [`/api/certificates/${certificateId}`],
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
    enabled: !!certificateId,
  });

  // Query participants for dropdown
  const { data: participants } = useQuery<{ data: Participant[] }>({
    queryKey: ['/api/participants'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Query training programs for the dropdown
  const { data: programs } = useQuery<{ data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Update certificate data when query loads
  useEffect(() => {
    if (certificate?.data) {
      const c = certificate.data as any; // Handle both camelCase and snake_case
      setCertificateData({
        certificateId: c.certificateId || c.certificate_id || '',
        participantId: c.participantId || c.participant_id || 0,
        trainingProgramId: c.trainingProgramId || c.training_program_id || 0,
        issueDate: (() => {
          const dateField = c.issueDate || c.issue_date;
          if (!dateField) return '';
          if (dateField instanceof Date) return dateField.toISOString().split('T')[0];
          return new Date(dateField).toISOString().split('T')[0];
        })(),
        expiryDate: (() => {
          const dateField = c.expiryDate || c.expiry_date;
          if (!dateField) return '';
          if (dateField instanceof Date) return dateField.toISOString().split('T')[0];
          return new Date(dateField).toISOString().split('T')[0];
        })(),
        certificatePath: c.certificatePath || c.certificate_path || ''
      });
    }
  }, [certificate]);

  // Update certificate mutation
  const updateCertificateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Certificate> }) => updateCertificate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      queryClient.invalidateQueries({ queryKey: [`/api/certificates/${certificateId}`] });
      toast({
        title: "Certificate updated",
        description: "The certificate has been successfully updated",
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error updating certificate",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...certificateData,
      participantId: Number(certificateData.participantId),
      trainingProgramId: Number(certificateData.trainingProgramId),
      issueDate: new Date(certificateData.issueDate),
      expiryDate: certificateData.expiryDate ? new Date(certificateData.expiryDate) : null
    };
    
    updateCertificateMutation.mutate({ id: certificateId, data: submissionData });
  };

  if (isLoadingCertificate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Certificate</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Update the certificate information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>Update the information for this certificate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="certificateId">Certificate ID *</Label>
                  <Input
                    id="certificateId"
                    value={certificateData.certificateId}
                    onChange={(e) => setCertificateData({ ...certificateData, certificateId: e.target.value })}
                    placeholder="Certificate ID"
                    disabled // Usually don't change ID after creation
                    data-testid="input-certificate-id"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participant">Participant *</Label>
                  <Select 
                    value={certificateData.participantId.toString()} 
                    onValueChange={(value) => {
                      const selectedParticipant = participants?.data?.find((p: any) => p.id === parseInt(value)) as any;
                      const trainingProgramId = selectedParticipant?.training_program_id || selectedParticipant?.trainingProgramId;
                      setCertificateData({ 
                        ...certificateData, 
                        participantId: parseInt(value),
                        trainingProgramId: trainingProgramId || certificateData.trainingProgramId
                      });
                    }}
                    required
                  >
                    <SelectTrigger data-testid="select-participant">
                      <SelectValue placeholder="Select a participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants?.data?.map((participant: any) => (
                        <SelectItem key={participant.id} value={participant.id.toString()}>
                          {participant.full_name || participant.fullName} ({participant.participant_id || participant.participantId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingProgram">Training Program *</Label>
                  <Select 
                    value={certificateData.trainingProgramId.toString()} 
                    onValueChange={(value) => setCertificateData({ ...certificateData, trainingProgramId: parseInt(value) })}
                    required
                  >
                    <SelectTrigger data-testid="select-training-program">
                      <SelectValue placeholder="Select a training program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.data?.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={certificateData.issueDate}
                    onChange={(e) => setCertificateData({ ...certificateData, issueDate: e.target.value })}
                    required
                    data-testid="input-issue-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={certificateData.expiryDate}
                    onChange={(e) => setCertificateData({ ...certificateData, expiryDate: e.target.value })}
                    data-testid="input-expiry-date"
                  />
                  <p className="text-sm text-gray-500">Leave empty for certificates that don't expire</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificatePath">Certificate Path</Label>
                  <Input
                    id="certificatePath"
                    value={certificateData.certificatePath}
                    onChange={(e) => setCertificateData({ ...certificateData, certificatePath: e.target.value })}
                    placeholder="Path to certificate file (optional)"
                    data-testid="input-certificate-path"
                  />
                  <p className="text-sm text-gray-500">URL or path to the certificate document</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Link href="/admin">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={updateCertificateMutation.isPending}
                  data-testid="button-update-certificate"
                >
                  {updateCertificateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Certificate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}