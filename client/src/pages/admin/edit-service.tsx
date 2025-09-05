
import { useState, useEffect } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { updateService } from '@/lib/cloudflare-api';
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

export default function EditService() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/admin/services/edit/:id');
  const serviceId = params?.id ? parseInt(params.id) : null;
  
  const [serviceData, setServiceData] = useState({
    title: '',
    description: '',
    icon: '',
    features: ''
  });

  // Query service data
  const { data: service, isLoading } = useQuery<{ data: Service }>({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Update form data when service data is loaded
  useEffect(() => {
    if (service?.data) {
      const featuresString = Array.isArray(service.data.features) 
        ? service.data.features.join(', ') 
        : '';
      
      setServiceData({
        title: service.data.title || '',
        description: service.data.description || '',
        icon: service.data.icon || '',
        features: featuresString
      });
    }
  }, [service]);

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: (data: Partial<Omit<Service, 'id'>>) => {
      if (!serviceId) throw new Error('Service ID is required');
      return updateService(serviceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}`] });
      toast({
        title: "Service updated",
        description: "The service has been successfully updated",
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error updating service",
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
    
    updateServiceMutation.mutate(submissionData);
  };

  const getSelectedIcon = (value: string) => {
    const option = iconOptions.find(opt => opt.value === value);
    return option ? option.icon : <Briefcase className="h-4 w-4" />;
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Invalid Service</h2>
            <p className="mb-8">The service ID is missing or invalid.</p>
            <Link href="/admin">
              <Button>Back to Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!service?.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Service not found</h2>
            <p className="mb-8">The service you're looking for doesn't exist.</p>
            <Link href="/admin">
              <Button>Back to Admin Dashboard</Button>
            </Link>
          </div>
        </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Update the service details.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Update the details for this service</CardDescription>
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
                  disabled={updateServiceMutation.isPending}
                  data-testid="button-update-service"
                >
                  {updateServiceMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Service
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
