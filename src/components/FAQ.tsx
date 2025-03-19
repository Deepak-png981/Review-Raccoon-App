/* eslint-disable react-refresh/only-export-components */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from './faq-data'

const FAQ = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle size={16} className="text-primary" />
            <span className="text-sm font-medium">Questions & Answers</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-foreground/80">
            Have questions? We've got answers. If you don't find what you're looking for,
            feel free to reach out to our support team.
          </p>
        </div>
        
        <div className="glass-card rounded-xl overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10 last:border-b-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-secondary/20 transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 text-foreground/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-12 text-center">
          <p className="mb-4 text-foreground/80">
            Still have questions?
          </p>
          <a href="/documentation" className="text-primary hover:text-primary/80 font-medium">
            Check out our detailed documentation →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
