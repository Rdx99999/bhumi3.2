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

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programName: string;
  programId: number;
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  programName,
  programId,
}: EnrollmentDialogProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I'd like to enroll in the "${programName}" training program.`,
      subject: `Enrollment Request: ${programName}`,
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: ContactForm) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Enrollment request sent!",
        description: "We'll get back to you soon regarding your enrollment.",
      });
      setSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to send enrollment request",
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
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Enroll in {programName}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 mt-2">
            Fill out this form to request enrollment in this training program. Our team will contact you shortly.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-4 sm:py-6 text-center space-y-3 sm:space-y-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
              Thank you!
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed px-2">
              Your enrollment request has been received. We'll contact you soon with the next steps for joining the "{programName}" program.
            </p>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="mt-4 w-full sm:w-auto px-6 py-2 h-10"
            >
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        {...field} 
                      />
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
                    <FormLabel className="text-sm sm:text-base font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        type="email"
                        {...field} 
                      />
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
                    <FormLabel className="text-sm sm:text-base font-medium">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+91 9876543210" 
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        type="tel"
                        {...field} 
                      />
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
                    <FormLabel className="text-sm sm:text-base font-medium">
                      Additional Information
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific requirements or questions..."
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <input type="hidden" name="subject" value={form.getValues().subject} />

              <DialogFooter className="pt-4 sm:pt-6 flex-col sm:flex-row gap-3 sm:gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto order-2 sm:order-1 h-10 sm:h-11"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="w-full sm:w-auto order-1 sm:order-2 h-10 sm:h-11"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Submit Enrollment Request"
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