import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { createTrainingProgram } from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { generateSlug, isValidSlug } from '@/lib/slug-utils';
import type { TrainingProgram } from '@shared/schema';

export default function CreateTrainingProgram() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [programData, setProgramData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: '',
    category: '',
    price: 0,
    online_price: 0,
    offline_price: 0,
    delivery_mode: 'both',
    image_path: ''
  });

  const [isSlugManual, setIsSlugManual] = useState(false);

  // Auto-generate slug from title when title changes
  useEffect(() => {
    if (!isSlugManual && programData.title) {
      const autoSlug = generateSlug(programData.title);
      setProgramData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [programData.title, isSlugManual]);

  // Create training program mutation
  const createProgramMutation = useMutation({
    mutationFn: (data: Omit<TrainingProgram, 'id'>) => createTrainingProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-programs'] });
      toast({
        title: "Training program created",
        description: "The training program has been successfully created",
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error creating training program",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...programData,
      price: programData.offline_price || programData.online_price || 0 // Set price for backward compatibility
    };
    
    createProgramMutation.mutate(submissionData);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Training Program</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Fill in the details to create a new training program.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Training Program Details</CardTitle>
            <CardDescription>Enter the information for the new training program</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Program Title *</Label>
                  <Input
                    id="title"
                    value={programData.title}
                    onChange={(e) => setProgramData({ ...programData, title: e.target.value })}
                    placeholder="Enter program title"
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={programData.slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setProgramData({ ...programData, slug: e.target.value });
                    }}
                    placeholder="auto-generated-from-title"
                    required
                    data-testid="input-slug"
                    className={!isValidSlug(programData.slug) && programData.slug ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-gray-500">
                    Auto-generated from title. You can modify it for SEO. Only lowercase letters, numbers, and hyphens allowed.
                  </p>
                  {!isValidSlug(programData.slug) && programData.slug && (
                    <p className="text-sm text-red-500">
                      Invalid slug format. Use only lowercase letters, numbers, and hyphens.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={programData.category}
                    onChange={(e) => setProgramData({ ...programData, category: e.target.value })}
                    placeholder="e.g., Technical, Leadership, Safety"
                    required
                    data-testid="input-category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={programData.duration}
                    onChange={(e) => setProgramData({ ...programData, duration: e.target.value })}
                    placeholder="e.g., 2 weeks, 3 months"
                    required
                    data-testid="input-duration"
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="online_price">Online Price (₹)</Label>
                  <Input
                    id="online_price"
                    type="number"
                    value={programData.online_price}
                    onChange={(e) => setProgramData({ ...programData, online_price: parseInt(e.target.value) || 0 })}
                    placeholder="Enter online price (optional)"
                    min="0"
                    data-testid="input-online-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offline_price">Offline Price (₹) *</Label>
                  <Input
                    id="offline_price"
                    type="number"
                    value={programData.offline_price}
                    onChange={(e) => setProgramData({ ...programData, offline_price: parseInt(e.target.value) || 0 })}
                    placeholder="Enter offline price"
                    min="0"
                    required
                    data-testid="input-offline-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_mode">Delivery Mode *</Label>
                  <Select 
                    value={programData.delivery_mode} 
                    onValueChange={(value) => setProgramData({ ...programData, delivery_mode: value })}
                  >
                    <SelectTrigger data-testid="select-delivery-mode">
                      <SelectValue placeholder="Select delivery mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="offline">Offline Only</SelectItem>
                      <SelectItem value="both">Both Online & Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={programData.description}
                  onChange={(e) => setProgramData({ ...programData, description: e.target.value })}
                  placeholder="Describe the training program..."
                  rows={4}
                  required
                  data-testid="textarea-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label htmlFor="image_path">Image Path (URL)</Label>
                  <Input
                    id="image_path"
                    value={programData.image_path}
                    onChange={(e) => setProgramData({ ...programData, image_path: e.target.value })}
                    placeholder="Enter image URL (optional)"
                    data-testid="input-image-path"
                  />
                  {programData.image_path && (
                    <div className="mt-3">
                      <Label className="text-sm text-gray-600 mb-2 block">Image Preview:</Label>
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <img
                          src={programData.image_path}
                          alt="Training program preview"
                          className="max-w-full h-32 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = target.nextElementSibling as HTMLDivElement;
                            if (errorDiv) errorDiv.style.display = 'block';
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                            const errorDiv = target.nextElementSibling as HTMLDivElement;
                            if (errorDiv) errorDiv.style.display = 'none';
                          }}
                        />
                        <div 
                          className="text-red-500 text-sm p-2 hidden"
                          style={{ display: 'none' }}
                        >
                          Failed to load image. Please check the URL.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Link href="/admin">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createProgramMutation.isPending}
                  data-testid="button-create-program"
                >
                  {createProgramMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Program
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}