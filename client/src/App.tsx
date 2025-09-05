import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/home";
import TrainingPrograms from "@/pages/training-programs";
import TrainingProgramDetails from "@/pages/training-program-details";
import ServiceDetails from "@/pages/service-details";
import VerifyCertificate from "@/pages/verify-certificate";
import Contact from "@/pages/contact";
import AboutUs from "@/pages/about";
import AdminDashboard from "@/pages/admin";
import CreateService from "@/pages/admin/create-service";
import EditService from "@/pages/admin/edit-service";
import CreateTrainingProgram from "@/pages/admin/create-training-program";
import EditTrainingProgram from "@/pages/admin/edit-training-program";
import CreateParticipant from "@/pages/admin/create-participant";
import EditParticipant from "@/pages/admin/edit-participant";
import CreateCertificate from "@/pages/admin/create-certificate";
import EditCertificate from "@/pages/admin/edit-certificate";
import DeleteConfirmation from "@/pages/admin/delete-confirmation";
import { useEffect } from "react";

function Router() {
  // Determine if we're on the admin page using wouter's useLocation
  const [location, setLocation] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  // Handle route changes and refresh issues
  useEffect(() => {
    // Store the current path in the route cache on each route change
    if (window.routeCache) {
      window.routeCache.currentPath = location;
    }
    
    // Scroll to top when navigating between routes
    window.scrollTo(0, 0);
    
    // If we're on a refresh and have a path in cache, make sure we're on the right route
    const path = window.location.pathname;
    if (path !== '/' && path !== location) {
      setLocation(path);
    }
  }, [location, setLocation]);
  
  // If on admin page, render without header/footer
  if (isAdminRoute) {
    return (
      <div className="min-h-screen min-h-screen-dynamic">
        <main className="flex-grow">
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/services/create" component={CreateService} />
            <Route path="/admin/services/edit/:id" component={EditService} />
            <Route path="/admin/training-programs/create" component={CreateTrainingProgram} />
            <Route path="/admin/training-programs/edit/:id" component={EditTrainingProgram} />
            <Route path="/admin/participants/create" component={CreateParticipant} />
            <Route path="/admin/participants/edit/:id" component={EditParticipant} />
            <Route path="/admin/certificates/create" component={CreateCertificate} />
            <Route path="/admin/certificates/edit/:id" component={EditCertificate} />
            <Route path="/admin/delete/:type/:id" component={DeleteConfirmation} />
            <Route component={AdminDashboard} />
          </Switch>
        </main>
      </div>
    );
  }
  
  // For non-admin routes, render with header and footer
  return (
    <div className="flex flex-col min-h-screen min-h-screen-dynamic">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={AboutUs} />
          <Route path="/training-programs" component={TrainingPrograms} />
          <Route path="/training-programs/:id" component={TrainingProgramDetails} />
          <Route path="/services/:id" component={ServiceDetails} />
          <Route path="/verify-certificate" component={VerifyCertificate} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
