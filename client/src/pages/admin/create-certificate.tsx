import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { createCertificate } from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { TrainingProgram, Participant, Certificate } from '@shared/schema';

export default function CreateCertificate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [certificateData, setCertificateData] = useState({
    certificateId: `CERT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9000) + 1000)}`,
    participantId: null as number | null,
    trainingProgramId: null as number | null,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Default 1 year later
    certificatePath: ''
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

  // Create certificate mutation
  const createCertificateMutation = useMutation({
    mutationFn: (data: Omit<Certificate, 'id'>) => createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      toast({
        title: "Certificate created",
        description: "The certificate has been successfully created",
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error creating certificate",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateData.participantId || !certificateData.trainingProgramId) {
      toast({
        title: "Error",
        description: "Please select both a participant and training program",
        variant: "destructive",
      });
      return;
    }
    
    // Additional validation: Check if selected participant has completed status
    const selectedParticipant = participants?.data?.find((p: any) => p.id === certificateData.participantId) as any;
    if (selectedParticipant?.status !== 'completed') {
      toast({
        title: "Cannot create certificate",
        description: "Certificates can only be created for participants who have completed their training program. Current status: " + (selectedParticipant?.status || 'Unknown'),
        variant: "destructive",
      });
      return;
    }
    
    const submissionData = {
      ...certificateData,
      participantId: Number(certificateData.participantId),
      trainingProgramId: Number(certificateData.trainingProgramId),
      issueDate: new Date(certificateData.issueDate),
      expiryDate: certificateData.expiryDate ? new Date(certificateData.expiryDate) : null
    };
    
    createCertificateMutation.mutate(submissionData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Certificate</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Issue a new certificate for a participant.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>Fill in the details for the new certificate</CardDescription>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Certificates can only be created for participants who have <span className="font-semibold">completed</span> their training program.
              </p>
            </div>
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
                    required
                    data-testid="input-certificate-id"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participant">Participant *</Label>
                  <Select 
                    value={certificateData.participantId ? certificateData.participantId.toString() : undefined} 
                    onValueChange={(value) => {
                      const selectedParticipant = participants?.data?.find((p: any) => p.id === parseInt(value)) as any;
                      
                      // Check if participant has completed status
                      if (selectedParticipant?.status !== 'completed') {
                        toast({
                          title: "Cannot create certificate",
                          description: "Certificates can only be created for participants who have completed their training program.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      const trainingProgramId = selectedParticipant?.training_program_id || selectedParticipant?.trainingProgramId;
                      setCertificateData({ 
                        ...certificateData, 
                        participantId: parseInt(value),
                        trainingProgramId: trainingProgramId || null
                      });
                    }}
                    required
                  >
                    <SelectTrigger data-testid="select-participant">
                      <SelectValue placeholder="Select a participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants?.data?.filter(participant => participant.id > 0).map((participant: any) => {
                        const isCompleted = participant.status === 'completed';
                        return (
                          <SelectItem 
                            key={participant.id} 
                            value={participant.id.toString()}
                            disabled={!isCompleted}
                          >
                            {participant.full_name || participant.fullName} ({participant.participant_id || participant.participantId})
                            {!isCompleted && <span className="text-red-500 ml-2">- Not Completed</span>}
                            {isCompleted && <span className="text-green-500 ml-2">- Completed</span>}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingProgram">Training Program *</Label>
                  <Select 
                    value={certificateData.trainingProgramId ? certificateData.trainingProgramId.toString() : undefined} 
                    onValueChange={(value) => setCertificateData({ ...certificateData, trainingProgramId: parseInt(value) })}
                    required
                  >
                    <SelectTrigger data-testid="select-training-program">
                      <SelectValue placeholder="Select a training program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.data?.filter(program => program.id > 0).map((program) => (
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
                  disabled={createCertificateMutation.isPending}
                  data-testid="button-create-certificate"
                >
                  {createCertificateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Certificate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}