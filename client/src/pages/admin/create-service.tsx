
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { createService } from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, BarChart3, FileText, Building2, ClipboardCheck, Users, Award, Target, TrendingUp, Briefcase, Settings } from 'lucide-react';
import type { Service } from '@shared/schema';

const iconOptions = [
  { value: 'chart-line', label: 'Chart Line', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'file-invoice', label: 'File Invoice', icon: <FileText className="h-4 w-4" /> },
  { value: 'building', label: 'Building', icon: <Building2 className="h-4 w-4" /> },
  { value: 'clipboard-check', label: 'Clipboard Check', icon: <ClipboardCheck className="h-4 w-4" /> },
  { value: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { value: 'award', label: 'Award', icon: <Award className="h-4 w-4" /> },
  { value: 'target', label: 'Target', icon: <Target className="h-4 w-4" /> },
  { value: 'trending-up', label: 'Trending Up', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'briefcase', label: 'Briefcase', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
];

export default function CreateService() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [serviceData, setServiceData] = useState({
    title: '',
    description: '',
    icon: '',
    features: ''
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data: Omit<Service, 'id'>) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Service created",
        description: "The service has been successfully created",
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error creating service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceData.title || !serviceData.description || !serviceData.icon) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Parse features from comma-separated string to array
    const featuresArray = serviceData.features
      .split(',')
      .map(feature => feature.trim())
      .filter(feature => feature.length > 0);
    
    const submissionData = {
      title: serviceData.title,
      description: serviceData.description,
      icon: serviceData.icon,
      features: featuresArray
    };
    
    createServiceMutation.mutate(submissionData);
  };

  const getSelectedIcon = (value: string) => {
    const option = iconOptions.find(opt => opt.value === value);
    return option ? option.icon : <Briefcase className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new service to your offerings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Fill in the details for the new service</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={serviceData.title}
                    onChange={(e) => setServiceData({ ...serviceData, title: e.target.value })}
                    placeholder="Enter service title"
                    required
                    data-testid="input-service-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon *</Label>
                  <Select 
                    value={serviceData.icon} 
                    onValueChange={(value) => setServiceData({ ...serviceData, icon: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-service-icon">
                      <SelectValue placeholder="Select an icon">
                        {serviceData.icon && (
                          <div className="flex items-center">
                            {getSelectedIcon(serviceData.icon)}
                            <span className="ml-2">
                              {iconOptions.find(opt => opt.value === serviceData.icon)?.label}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Choose an icon that represents your service</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  placeholder="Enter service description"
                  rows={4}
                  required
                  data-testid="textarea-service-description"
                />
                <p className="text-sm text-gray-500">Provide a detailed description of the service</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features</Label>
                <Textarea
                  id="features"
                  value={serviceData.features}
                  onChange={(e) => setServiceData({ ...serviceData, features: e.target.value })}
                  placeholder="Enter features separated by commas (e.g., Feature 1, Feature 2, Feature 3)"
                  rows={3}
                  data-testid="textarea-service-features"
                />
                <p className="text-sm text-gray-500">List key features separated by commas</p>
              </div>

              <div className="flex space-x-4 pt-6">
                <Link href="/admin">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createServiceMutation.isPending}
                  data-testid="button-create-service"
                >
                  {createServiceMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Service
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
