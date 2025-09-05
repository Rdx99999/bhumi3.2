import { useState } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { 
  deleteService, 
  deleteTrainingProgram,
  deleteParticipant,
  deleteCertificate, 
  deleteContact
} from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmation() {
  const [, params] = useRoute('/admin/delete/:type/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const { type, id } = params!;
  const itemId = parseInt(id);

  // Query the specific item to get details for confirmation
  const { data: item, isLoading } = useQuery({
    queryKey: [`/api/${type}s/${itemId}`],
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
    enabled: !!type && !!itemId,
  });

  // Generic delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      switch (type) {
        case 'service':
          return await deleteService(itemId);
        case 'training-program':
          return await deleteTrainingProgram(itemId);
        case 'participant':
          return await deleteParticipant(itemId);
        case 'certificate':
          return await deleteCertificate(itemId);
        case 'contact':
          return await deleteContact(itemId);
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    },
    onSuccess: () => {
      // Invalidate the relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/${type}s`] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      
      toast({
        title: "Item deleted",
        description: `The ${type.replace('-', ' ')} has been successfully deleted`,
      });
      navigate('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error deleting item",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  // Handle delete confirmation
  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Get item display name and details
  const getItemDetails = () => {
    if (!item?.data) return { name: 'Item', details: '' };
    
    const data = item.data;
    
    switch (type) {
      case 'service':
        return { 
          name: data.title || 'Service', 
          details: data.description || '' 
        };
      case 'training-program':
        return { 
          name: data.title || 'Training Program', 
          details: `${data.category || ''} • ${data.duration || ''}` 
        };
      case 'participant':
        return { 
          name: data.fullName || data.full_name || 'Participant', 
          details: `${data.email || ''} • ID: ${data.participantId || data.participant_id || ''}` 
        };
      case 'certificate':
        return { 
          name: `Certificate ${data.certificateId || data.certificate_id || ''}`, 
          details: data.participant_name || '' 
        };
      case 'contact':
        return { 
          name: data.fullName || data.full_name || 'Contact', 
          details: `${data.email || ''} • ${data.subject || ''}` 
        };
      default:
        return { name: 'Item', details: '' };
    }
  };

  const { name, details } = getItemDetails();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // If item not found
  if (!item?.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Item Not Found</CardTitle>
              <CardDescription>
                The item you're trying to delete could not be found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <Card className="border-red-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Delete {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <CardDescription className="text-lg">
              Are you sure you want to delete this {type.replace('-', ' ')}?
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-lg">{name}</h3>
              {details && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{details}</p>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Warning</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This action cannot be undone. The {type.replace('-', ' ')} and all associated data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
              <Link href="/admin" className="order-2 sm:order-1">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  disabled={isDeleting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="order-1 sm:order-2 w-full sm:w-auto"
                data-testid="button-confirm-delete"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}