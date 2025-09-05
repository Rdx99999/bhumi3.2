import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { 
  deleteService, 
  deleteTrainingProgram,
  getAllParticipants, deleteParticipant,
  getAllCertificates, deleteCertificate, downloadCertificate,
  getAllContacts, updateContactStatus, deleteContact
} from '@/lib/cloudflare-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Download, CheckCircle, XCircle, Clock, Building2, GraduationCap, Users, Award, MessageSquare, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Service, TrainingProgram, Participant, Certificate, Contact } from '@shared/schema';

// Navigation items for the sidebar
const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'services',
    label: 'Services',
    icon: Building2,
  },
  {
    id: 'training',
    label: 'Training Programs',
    icon: GraduationCap,
  },
  {
    id: 'participants',
    label: 'Participants',
    icon: Users,
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: MessageSquare,
  },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [apiCode, setApiCode] = useState(localStorage.getItem('admin_api_code') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_api_code'));
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication handler
  const handleAuthenticate = () => {
    if (apiCode === import.meta.env.VITE_API_CODE) {
      localStorage.setItem('admin_api_code', apiCode);
      setIsAuthenticated(true);
      toast({
        title: "Authentication successful",
        description: "You are now logged in as admin",
      });
    } else {
      toast({
        title: "Authentication failed",
        description: "Invalid API code",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_api_code');
    setIsAuthenticated(false);
    setApiCode('');
  };

  // Handle navigation item click - close mobile menu
  const handleNavigationClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your API code to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiCode">API Code</label>
                <input
                  id="apiCode"
                  type="password"
                  value={apiCode}
                  onChange={(e) => setApiCode(e.target.value)}
                  placeholder="Enter API code..."
                  data-testid="input-api-code"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button 
              onClick={handleAuthenticate} 
              className="w-full"
              data-testid="button-authenticate"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render active section content
  const renderActiveContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />;
      case 'services':
        return <ServiceManager />;
      case 'training':
        return <TrainingProgramManager />;
      case 'participants':
        return <ParticipantManager />;
      case 'certificates':
        return <CertificateManager />;
      case 'contacts':
        return <ContactManager />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Bhumi Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Management Dashboard
            </p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            data-testid="button-close-menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigationClick(item.id)}
                data-testid={`nav-${item.id}`}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
              data-testid="button-hamburger"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your {activeSection === 'overview' ? 'business overview' : activeSection}
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {renderActiveContent()}
        </div>
      </div>
    </div>
  );
}

// Overview Dashboard Component
function OverviewDashboard() {
  // Query data for overview
  const { data: services } = useQuery<{ data: Service[] }>({
    queryKey: ['/api/services'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  const { data: programs } = useQuery<{ data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  const { data: participants } = useQuery<{ data: Participant[] }>({
    queryKey: ['/api/participants'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  const { data: certificates } = useQuery<{ data: Certificate[] }>({
    queryKey: ['/api/certificates'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  const { data: contacts } = useQuery<{ data: Contact[] }>({
    queryKey: ['/api/contacts'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 opacity-80 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-blue-100 text-xs sm:text-sm">Services</p>
                <p className="text-xl sm:text-2xl font-bold">{services?.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 opacity-80 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-green-100 text-xs sm:text-sm">Training Programs</p>
                <p className="text-xl sm:text-2xl font-bold">{programs?.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 opacity-80 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-purple-100 text-xs sm:text-sm">Participants</p>
                <p className="text-xl sm:text-2xl font-bold">{participants?.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 opacity-80 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-orange-100 text-xs sm:text-sm">Certificates</p>
                <p className="text-xl sm:text-2xl font-bold">{certificates?.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Contacts</CardTitle>
            <CardDescription>Latest contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts?.data?.slice(0, 5).map((contact: Contact) => (
                <div key={contact.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {(contact as any).full_name || contact.fullName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {contact.subject}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {formatDate((contact as any).created_at || contact.createdAt)}
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent contacts</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Training Programs</CardTitle>
            <CardDescription>Latest training programs added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programs?.data?.slice(0, 5).map((program: TrainingProgram) => (
                <div key={program.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {program.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {program.category} • {program.duration}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-green-600 font-medium">
                    ₹{program.online_price || program.price}
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 dark:text-gray-400">No training programs yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/admin/services/create">
              <Button variant="outline" className="flex items-center justify-center space-x-2 h-12 w-full">
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Add Service</span>
              </Button>
            </Link>
            <Link href="/admin/training-programs/create">
              <Button variant="outline" className="flex items-center justify-center space-x-2 h-12 w-full">
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Add Program</span>
              </Button>
            </Link>
            <Link href="/admin/participants/create">
              <Button variant="outline" className="flex items-center justify-center space-x-2 h-12 w-full">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Add Participant</span>
              </Button>
            </Link>
            <Link href="/admin/certificates/create">
              <Button variant="outline" className="flex items-center justify-center space-x-2 h-12 w-full">
                <Award className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Certificate</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Services Manager Component
function ServiceManager() {
  const { toast } = useToast();

  // Query services
  const { data: services, isLoading } = useQuery<{ data: Service[] }>({
    queryKey: ['/api/services'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Service deleted",
        description: "The service has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <Link href="/admin/services/create">
          <Button data-testid="button-add-service">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.data?.map((service: Service) => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{service.title}</span>
                <div className="flex space-x-2">
                  <Link href={`/admin/services/edit/${service.id}`}>
                    <Button variant="ghost" size="icon" data-testid={`button-edit-service-${service.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/delete/service/${service.id}`}>
                    <Button variant="ghost" size="icon" data-testid={`button-delete-service-${service.id}`}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 truncate">{service.description}</p>
              <div className="mt-2">
                <h4 className="text-sm font-medium">Features:</h4>
                <ul className="text-sm pl-5 list-disc mt-1">
                  {Array.isArray(service.features) 
                    ? service.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))
                    : typeof service.features === 'string' &&
                      JSON.parse(service.features as string).slice(0, 3).map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))
                  }
                  {((Array.isArray(service.features) && service.features.length > 3) ||
                    (typeof service.features === 'string' && JSON.parse(service.features as string).length > 3)) && (
                    <li>...</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Training Programs Manager Component - NO DIALOGS, FULL PAGE NAVIGATION
function TrainingProgramManager() {
  const { toast } = useToast();

  // Query training programs
  const { data: programs, isLoading } = useQuery<{ data: TrainingProgram[] }>({
    queryKey: ['/api/training-programs'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Delete training program mutation
  const deleteProgramMutation = useMutation({
    mutationFn: deleteTrainingProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-programs'] });
      toast({
        title: "Training program deleted",
        description: "The training program has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting training program",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Training Programs</h2>
        <Link href="/admin/training-programs/create">
          <Button data-testid="button-add-program">
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs?.data?.map((program: TrainingProgram) => (
          <Card key={program.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{program.title}</span>
                <div className="flex space-x-2">
                  <Link href={`/admin/training-programs/edit/${program.id}`}>
                    <Button variant="ghost" size="icon" data-testid={`button-edit-program-${program.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/delete/training-program/${program.id}`}>
                    <Button variant="ghost" size="icon" data-testid={`button-delete-program-${program.id}`}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </Link>
                </div>
              </CardTitle>
              <CardDescription>{program.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 truncate">{program.description}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm"><span className="font-medium">Duration:</span> {program.duration}</p>
                <p className="text-sm"><span className="font-medium">Online:</span> ₹{program.online_price || program.price}</p>
                {program.offline_price && (
                  <p className="text-sm"><span className="font-medium">Offline:</span> ₹{program.offline_price}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={program.delivery_mode === 'online' ? 'default' : 'secondary'}>
                    {program.delivery_mode === 'online' ? 'Online Only' : 
                     program.delivery_mode === 'offline' ? 'Offline Only' : 'Both'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Participant Manager Component - NO DIALOGS, FULL PAGE NAVIGATION
function ParticipantManager() {
  const { toast } = useToast();

  // Query participants
  const { data: participants, isLoading: isLoadingParticipants } = useQuery<{ data: Participant[] }>({
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

  // Delete participant mutation
  const deleteParticipantMutation = useMutation({
    mutationFn: deleteParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      toast({
        title: "Participant deleted",
        description: "The participant has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting participant",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Get training program name by ID
  const getTrainingProgramName = (id: number): string => {
    const program = programs?.data?.find(p => p.id === id);
    return program ? program.title : `Program #${id}`;
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      withdrawn: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Loading state
  if (isLoadingParticipants) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Participants</h2>
        <Link href="/admin/participants/create">
          <Button data-testid="button-add-participant">
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Training Program</th>
              <th className="text-left py-3 px-4">Enrollment Date</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants?.data?.map((participant: any) => (
              <tr key={participant.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{participant.participant_id}</td>
                <td className="py-3 px-4">
                  <div>
                    {participant.full_name}
                    <div className="text-xs text-gray-500">{participant.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{participant.training_program_name}</td>
                <td className="py-3 px-4">{formatDate(participant.enrollment_date)}</td>
                <td className="py-3 px-4">{renderStatusBadge(participant.status)}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/admin/participants/edit/${participant.id}`}>
                      <Button variant="ghost" size="icon" data-testid={`button-edit-participant-${participant.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/delete/participant/${participant.id}`}>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-participant-${participant.id}`}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {(!participants?.data || participants.data.length === 0) && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No participants found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Certificate Manager Component - NO DIALOGS, FULL PAGE NAVIGATION
function CertificateManager() {
  const { toast } = useToast();

  // Query certificates
  const { data: certificates, isLoading: isLoadingCertificates } = useQuery<{ data: Certificate[] }>({
    queryKey: ['/api/certificates'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
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
  });

  // Delete certificate mutation
  const deleteCertificateMutation = useMutation({
    mutationFn: deleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      toast({
        title: "Certificate deleted",
        description: "The certificate has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting certificate",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Download certificate mutation
  const downloadCertificateMutation = useMutation({
    mutationFn: downloadCertificate,
    onSuccess: (response) => {
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        toast({
          title: "Download failed",
          description: "Certificate could not be downloaded",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error downloading certificate",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handler for downloading a certificate
  const handleDownloadCertificate = (certificateId: string) => {
    downloadCertificateMutation.mutate(certificateId);
  };

  // Get participant name by ID
  const getParticipantName = (id: number): string => {
    const participant = participants?.data?.find(p => p.id === id);
    return participant ? (participant as any).full_name || participant.fullName : `Participant #${id}`;
  };

  // Get training program name by ID
  const getTrainingProgramName = (id: number): string => {
    const program = programs?.data?.find(p => p.id === id);
    return program ? program.title : `Program #${id}`;
  };

  // Check if certificate is expired
  const isCertificateExpired = (expiryDate: Date | string | null): boolean => {
    if (!expiryDate) return false;
    const expiryDateTime = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
    return expiryDateTime < new Date();
  };

  // Loading state
  if (isLoadingCertificates) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Certificates</h2>
        <Link href="/admin/certificates/create">
          <Button data-testid="button-add-certificate">
            <Plus className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Certificate ID</th>
              <th className="text-left py-3 px-4">Participant</th>
              <th className="text-left py-3 px-4">Training Program</th>
              <th className="text-left py-3 px-4">Issue Date</th>
              <th className="text-left py-3 px-4">Expiry Date</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates?.data?.map((certificate: any) => (
              <tr key={certificate.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{certificate.certificate_id}</td>
                <td className="py-3 px-4">{certificate.participant_name}</td>
                <td className="py-3 px-4">{certificate.training_program_name}</td>
                <td className="py-3 px-4">{formatDate(certificate.issue_date)}</td>
                <td className="py-3 px-4">
                  {certificate.expiry_date ? (
                    <span className={isCertificateExpired(certificate.expiry_date) ? 'text-red-500' : ''}>
                      {formatDate(certificate.expiry_date)}
                    </span>
                  ) : (
                    <span className="text-gray-500">No expiry</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownloadCertificate(certificate.certificate_id)}
                      title="Download Certificate"
                      data-testid={`button-download-certificate-${certificate.id}`}
                    >
                      <Download className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Link href={`/admin/certificates/edit/${certificate.id}`}>
                      <Button variant="ghost" size="icon" data-testid={`button-edit-certificate-${certificate.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/delete/certificate/${certificate.id}`}>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-certificate-${certificate.id}`}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {(!certificates?.data || certificates.data.length === 0) && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No certificates found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Contact Manager Component - NO DIALOGS, FULL PAGE NAVIGATION  
function ContactManager() {
  const { toast } = useToast();

  // Query contacts
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<{ data: Contact[] }>({
    queryKey: ['/api/contacts'],
    staleTime: 10000,
    queryFn: getQueryFn({ on401: "throw", authenticate: true }),
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting contact",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update contact status mutation
  const updateContactStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact status updated",
        description: "The contact status has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating contact status",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handler for updating contact status
  const handleUpdateStatus = (id: number, status: string) => {
    updateContactStatusMutation.mutate({ id, status });
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Render status update buttons
  const renderStatusButtons = (contact: Contact) => {
    const statuses = ['pending', 'contacted', 'resolved', 'archived'];
    return (
      <div className="flex space-x-2">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={contact.status === status ? "default" : "outline"}
            size="sm"
            onClick={() => handleUpdateStatus(contact.id, status)}
            disabled={updateContactStatusMutation.isPending}
            data-testid={`button-status-${status}-${contact.id}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>
    );
  };

  // Loading state
  if (isLoadingContacts) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Contacts</h2>
      </div>

      <div className="space-y-4">
        {contacts?.data?.map((contact: Contact) => (
          <Card key={contact.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{(contact as any).full_name || contact.fullName}</CardTitle>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(contact.status)}
                  <Link href={`/admin/delete/contact/${contact.id}`}>
                    <Button variant="ghost" size="icon" data-testid={`button-delete-contact-${contact.id}`}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">Subject:</h4>
                <p className="text-sm">{contact.subject}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Message:</h4>
                <p className="text-sm text-gray-700">{contact.message}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Received: {formatDateTime((contact as any).created_at || contact.createdAt)}
                </p>
                <div>
                  {renderStatusButtons(contact)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!contacts?.data || contacts.data.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No contacts found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Contact submissions will appear here when received.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}