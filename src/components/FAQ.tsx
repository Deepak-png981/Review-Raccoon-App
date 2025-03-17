
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Review Raccoon integrate with GitHub?",
    answer: "Review Raccoon integrates as a GitHub Action. Once installed from the GitHub Marketplace, it automatically runs on your pull requests, analyzing code changes and providing feedback directly within the PR interface."
  },
  {
    question: "What programming languages does Review Raccoon support?",
    answer: "Review Raccoon supports a wide range of programming languages including JavaScript, TypeScript, Python, Java, Go, Ruby, PHP, C#, and more. Our analysis engine adapts to the specific language patterns and best practices."
  },
  {
    question: "Can I customize the rules for my team's specific needs?",
    answer: "Yes! Review Raccoon allows you to create a configuration file in your repository where you can define custom rules, set severity levels, and specify files or directories to include or exclude from analysis."
  },
  {
    question: "Will Review Raccoon slow down my CI/CD pipeline?",
    answer: "No, Review Raccoon is designed to be extremely fast. Our analysis typically completes in seconds, and runs in parallel to your existing CI checks without blocking or delaying them."
  },
  {
    question: "Is there a limit to how many pull requests Review Raccoon can analyze?",
    answer: "The limits depend on your plan. The Open Source plan allows for a limited number of repositories and analyses per month, while the Pro and Enterprise plans offer higher or unlimited usage."
  },
  {
    question: "Can Review Raccoon be self-hosted for security reasons?",
    answer: "Yes, our Enterprise plan includes the option to self-host Review Raccoon in your own infrastructure for organizations with strict security requirements."
  },
  {
    question: "How does Review Raccoon compare to other code review tools?",
    answer: "Review Raccoon differentiates itself through its speed, accuracy, and developer-friendly approach. Unlike many tools that focus solely on linting, Review Raccoon performs deeper semantic analysis and provides contextual suggestions that help developers learn and improve."
  }
];

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
            {faqs.map((faq, index) => (
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
