import { useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  showVisualFAQ?: boolean;
  className?: string;
}

export default function FAQSchema({ faqs, showVisualFAQ = true, className = '' }: FAQSchemaProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Add FAQ structured data
  useEffect(() => {
    if (faqs.length === 0) return;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    // Create script element for JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(faqSchema);
    script.id = 'faq-schema';

    // Remove existing FAQ schema if present
    const existingScript = document.getElementById('faq-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      const scriptToRemove = document.getElementById('faq-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [faqs]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!showVisualFAQ) {
    return null; // Only add structured data, no visual component
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      
      {faqs.map((faq, index) => (
        <Card key={index} className="overflow-hidden">
          <button
            onClick={() => toggleExpanded(index)}
            className="w-full text-left p-6 hover:bg-gray-50 transition-colors duration-200"
            aria-expanded={expandedItems.includes(index)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 pr-4">
                {faq.question}
              </h3>
              <div className="flex-shrink-0">
                {expandedItems.includes(index) ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          </button>
          
          {expandedItems.includes(index) && (
            <CardContent className="pt-0 pb-6 px-6">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

// Pre-defined FAQ sets for different types of content
export const commonFAQs = {
  trainingProgram: (programTitle: string, duration: string, price: number): FAQItem[] => [
    {
      question: `What is included in the ${programTitle} training program?`,
      answer: `The ${programTitle} program includes comprehensive training materials, hands-on exercises, expert instruction, and a professional certificate upon completion. You'll have access to all course resources and ongoing support throughout the program.`
    },
    {
      question: `How long does the ${programTitle} program take to complete?`,
      answer: `The program duration is ${duration}. This includes both theoretical learning and practical exercises. You can learn at your own pace with flexible scheduling options.`
    },
    {
      question: `What is the cost of this training program?`,
      answer: `The ${programTitle} program is priced at ₹${price.toLocaleString('en-IN')}. This is a one-time fee that includes all training materials, assessments, and certification.`
    },
    {
      question: `Do I get a certificate after completing the program?`,
      answer: `Yes, you will receive a professional certificate from Bhumi Consultancy Services upon successful completion of the program. This certificate is recognized in the industry and can enhance your professional credentials.`
    },
    {
      question: `Are there any prerequisites for this training program?`,
      answer: `This program is designed for professionals of all levels. While no specific prerequisites are required, having basic knowledge in the relevant field may be beneficial for faster learning.`
    },
    {
      question: `How can I enroll in this training program?`,
      answer: `You can enroll by clicking the "Enroll Now" button on this page. Our team will contact you within 24 hours to guide you through the enrollment process and provide all necessary information.`
    }
  ],

  generalBusiness: (): FAQItem[] => [
    {
      question: 'What services does Bhumi Consultancy offer?',
      answer: 'Bhumi Consultancy offers comprehensive business consulting services including strategic planning, financial advisory, training programs, certification services, and operational improvement consulting.'
    },
    {
      question: 'How experienced is the Bhumi Consultancy team?',
      answer: 'Our team consists of experienced professionals with expertise across various business domains. We have successfully served numerous clients and have a proven track record in delivering quality consulting services.'
    },
    {
      question: 'Do you provide customized solutions?',
      answer: 'Yes, we believe every business is unique. We provide customized consulting solutions tailored to your specific needs, industry requirements, and business objectives.'
    },
    {
      question: 'What industries do you serve?',
      answer: 'We serve businesses across various industries including manufacturing, retail, technology, healthcare, finance, and service sectors. Our expertise spans multiple domains to address diverse business challenges.'
    },
    {
      question: 'How can I get started with your services?',
      answer: 'You can get started by contacting us through our website or calling our team directly. We offer free initial consultations to understand your needs and propose the best solution for your business.'
    }
  ]
};