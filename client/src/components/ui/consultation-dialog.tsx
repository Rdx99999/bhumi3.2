import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { contactFormSchema, type ContactForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTitle: string;
  serviceId: number;
}

export function ConsultationDialog({
  open,
  onOpenChange,
  serviceTitle,
  serviceId,
}: ConsultationDialogProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I'm interested in learning more about the "${serviceTitle}" service.`,
      subject: `Consultation Request: ${serviceTitle}`,
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: ContactForm) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Consultation request sent!",
        description: "We'll get back to you soon to schedule your consultation.",
      });
      setSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to send consultation request",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ContactForm) {
    submitMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-1 sm:px-2">
          <DialogTitle className="text-lg sm:text-xl">Request a Consultation</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill out this form to request a consultation for our {serviceTitle} service. Our team will contact you shortly.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-4 sm:py-6 text-center space-y-3 sm:space-y-4">
            <div className="text-center text-xl sm:text-2xl mb-2">Thank you!</div>
            <p className="text-sm sm:text-base">
              Your consultation request has been received. We'll contact you soon to discuss how our "{serviceTitle}" service can help your business.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-3 sm:mt-4">
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Your Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your requirements or ask any questions you have about our services..."
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <input type="hidden" name="subject" value={form.getValues().subject} />

              <DialogFooter className="pt-3 sm:pt-4 gap-2 sm:gap-3 flex-col sm:flex-row">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)} 
                  className="w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending} 
                  className="w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Request Consultation"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}