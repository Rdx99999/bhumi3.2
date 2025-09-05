import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Animated Spinner
export function Spinner({ className, size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizeClass = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={cn("text-primary", sizeClass[size])} />
      </motion.div>
    </motion.div>
  );
}

// Animated Success Check
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <CheckCircle2 className="text-green-600 h-8 w-8" />
    </motion.div>
  );
}

// Animated Pulse Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("rounded-lg bg-white shadow-md p-6", className)}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 0.8, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="h-6 w-2/3 bg-gray-200 rounded-md mb-4" />
      <div className="h-4 w-full bg-gray-200 rounded-md mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 rounded-md mb-2" />
      <div className="h-4 w-4/6 bg-gray-200 rounded-md mb-4" />
      <div className="h-8 w-1/3 bg-gray-200 rounded-md" />
    </motion.div>
  );
}

// Animated Grid Skeleton with staggered entrance
export function GridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array(count)
        .fill(0)
        .map((_, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <CardSkeleton />
          </motion.div>
        ))}
    </motion.div>
  );
}

// Animated Text Skeleton
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("space-y-2", className)}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 0.8, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {Array(lines)
        .fill(0)
        .map((_, idx) => (
          <div 
            key={idx} 
            className={`h-4 bg-gray-200 rounded-md ${idx === lines - 1 ? "w-4/6" : "w-full"}`}
          />
        ))}
    </motion.div>
  );
}

// Loading Button - Shows spinner while loading
export function LoadingButton({ 
  children, 
  isLoading, 
  loadingText = "Loading...",
  className 
}: { 
  children: React.ReactNode; 
  isLoading: boolean; 
  loadingText?: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "relative px-4 py-2 rounded-md bg-primary text-white font-medium transition-all",
        isLoading ? "bg-primary/80" : "hover:bg-primary/90",
        className
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <motion.div 
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Spinner size="small" />
          <span>{loadingText}</span>
        </motion.div>
      ) : (
        children
      )}
    </button>
  );
}

// Bouncing Dots Animation
export function BouncingDotsLoader({ className }: { className?: string }) {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        repeat: Infinity,
        duration: 0.8
      }
    }
  };

  return (
    <motion.div
      className={cn("flex space-x-2 justify-center items-center", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary rounded-full"
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
}

// Page Loading Animation
export function PageLoadingAnimation() {
  return (
    <div className="min-h-[300px] w-full flex flex-col items-center justify-center">
      <Spinner size="large" className="mb-4" />
      <motion.p 
        className="text-lg text-primary font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Loading content...
      </motion.p>
      <BouncingDotsLoader className="mt-2" />
    </div>
  );
}