import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { createParticipant } from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { TrainingProgram, Participant } from '@shared/schema';

export default function CreateParticipant() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [participantData, setParticipantData] = useState({
    participantId: `BHM${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9000) + 1000)}`,
    fullName: '',
    email: '',
    phone: '',
    trainingProgramId: 0,
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  // Query training programs for the dropdown
  const { data: programs } = useQuery<{ data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Create participant mutation
  const createParticipantMutation = useMutation({
    mutationFn: (data: Omit<Participant, 'id'>) => createParticipant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      toast({
        title: "Participant created",
        description: "The participant has been successfully created",
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error creating participant",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...participantData,
      trainingProgramId: Number(participantData.trainingProgramId),
      enrollmentDate: new Date(participantData.enrollmentDate)
    };
    
    createParticipantMutation.mutate(submissionData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Participant</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new participant to the training program.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Participant Details</CardTitle>
            <CardDescription>Fill in the details for the new participant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="participantId">Participant ID *</Label>
                  <Input
                    id="participantId"
                    value={participantData.participantId}
                    onChange={(e) => setParticipantData({ ...participantData, participantId: e.target.value })}
                    placeholder="Participant ID"
                    required
                    data-testid="input-participant-id"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={participantData.fullName}
                    onChange={(e) => setParticipantData({ ...participantData, fullName: e.target.value })}
                    placeholder="Enter participant's full name"
                    required
                    data-testid="input-full-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={participantData.email}
                    onChange={(e) => setParticipantData({ ...participantData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={participantData.phone}
                    onChange={(e) => setParticipantData({ ...participantData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingProgram">Training Program *</Label>
                  <Select 
                    value={participantData.trainingProgramId.toString()} 
                    onValueChange={(value) => setParticipantData({ ...participantData, trainingProgramId: parseInt(value) })}
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
                  <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                  <Input
                    id="enrollmentDate"
                    type="date"
                    value={participantData.enrollmentDate}
                    onChange={(e) => setParticipantData({ ...participantData, enrollmentDate: e.target.value })}
                    required
                    data-testid="input-enrollment-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={participantData.status} 
                    onValueChange={(value) => setParticipantData({ ...participantData, status: value })}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Link href="/admin">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createParticipantMutation.isPending}
                  data-testid="button-create-participant"
                >
                  {createParticipantMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Participant
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}