import React, { useState } from 'react';
import { Check, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface PricingPlan {
  name: string;
  price: {
    monthly: string;
    yearly: string;
  };
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Open Source",
    price: { 
      monthly: "Free", 
      yearly: "Free" 
    },
    description: "Perfect for open source projects and small teams getting started.",
    features: [
      "Up to 5 repositories",
      "Basic code analysis",
      "GitHub integration",
      "Community support",
      "Pull request comments"
    ],
    highlighted: false,
    buttonText: "Get Started"
  },
  {
    name: "Pro",
    price: { 
      monthly: "$19", 
      yearly: "$15" 
    },
    description: "Ideal for growing teams that need more advanced features.",
    features: [
      "Up to 20 repositories",
      "Advanced code analysis",
      "Custom rule configuration",
      "Team dashboard",
      "Priority support",
      "Advanced security scanning",
      "API access"
    ],
    highlighted: true,
    buttonText: "Get Pro"
  },
  {
    name: "Enterprise",
    price: { 
      monthly: "$49", 
      yearly: "$39" 
    },
    description: "For organizations requiring maximum security and customization.",
    features: [
      "Unlimited repositories",
      "Enterprise-grade security",
      "Self-hosted option",
      "Custom integrations",
      "Dedicated support",
      "Audit logs & compliance",
      "SSO authentication",
      "Advanced analytics"
    ],
    highlighted: false,
    buttonText: "Contact Sales"
  }
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Package size={16} className="text-primary" />
            <span className="text-sm font-medium">Simple Pricing</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            Choose the right plan for your <span className="text-gradient">team</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-foreground/80">
            Whether you're an open source project, a growing startup, or an enterprise organization, 
            we have a plan that fits your needs.
          </p>
          
          <div className="mt-8 inline-flex items-center gap-3 p-1 bg-secondary/50 rounded-full">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-foreground/70'}`} onClick={() => setBillingCycle('monthly')}>
              Monthly
            </span>
            <Switch 
              checked={billingCycle === 'yearly'} 
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-white' : 'text-foreground/70'}`} onClick={() => setBillingCycle('yearly')}>
              Yearly
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`glass-card rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-5px] relative z-10 ${plan.highlighted ? 'ring-2 ring-primary md:scale-105' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}</span>
                  {plan.price.monthly !== "Free" && (
                    <span className="text-foreground/70 ml-1">/mo</span>
                  )}
                </div>
                
                <p className="text-foreground/70 mb-6">
                  {plan.description}
                </p>
                
                <Button 
                  variant={plan.highlighted ? "default" : "outline"}
                  className={`w-full mb-8 ${plan.highlighted ? "button-glow" : ""}`}
                >
                  {plan.buttonText}
                </Button>
                
                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={18} className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-foreground/70 mb-2">Need a custom plan?</p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = 'mailto:deepakashujoshi@gmail.com?subject=Review%20Raccoon%20Enterprise%20Inquiry'}
          >
            Contact our Sales Team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
