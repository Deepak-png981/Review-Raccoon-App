
import React from 'react';
import { Check, GitPullRequest, Shield, Zap, BarChart, Code, AlertCircle } from 'lucide-react';

const features = [
  {
    icon: <GitPullRequest size={24} className="text-primary" />,
    title: "Automated PR Reviews",
    description: "Review Raccoon automatically analyzes pull requests, highlighting issues before they reach human reviewers."
  },
  {
    icon: <Shield size={24} className="text-primary" />,
    title: "Code Quality Assurance",
    description: "Detect code smells, anti-patterns, and potential bugs with our intelligent static analysis engine."
  },
  {
    icon: <Zap size={24} className="text-primary" />,
    title: "Lightning Fast Analysis",
    description: "Get results in seconds, not minutes, so developers can iterate quickly without interruptions."
  },
  {
    icon: <BarChart size={24} className="text-primary" />,
    title: "Team Insights",
    description: "Track your team's code quality trends and identify improvement opportunities over time."
  },
  {
    icon: <Code size={24} className="text-primary" />,
    title: "Language Support",
    description: "Works with JavaScript, TypeScript, Python, Java, Go, Ruby, and many more programming languages."
  },
  {
    icon: <AlertCircle size={24} className="text-primary" />,
    title: "Security Scanning",
    description: "Identify potential security vulnerabilities early in the development process."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Check size={16} className="text-primary" />
            <span className="text-sm font-medium">Powerful Features</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            Everything you need for <span className="text-gradient">better code reviews</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-foreground/80">
            Review Raccoon provides comprehensive tools to automate the tedious parts of code reviews, 
            so your team can focus on what matters most: building great software.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              
              <p className="text-foreground/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 md:mt-24 p-8 glass-card rounded-xl border border-white/10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-8 md:mb-0 md:w-1/2 md:pr-12">
              <h3 className="heading-md mb-6">Custom Rules and Integrations</h3>
              
              <p className="text-foreground/80 mb-6">
                Tailor Review Raccoon to your team's specific needs with custom rules, 
                linting configurations, and integration with your existing workflow.
              </p>
              
              <ul className="space-y-3">
                {[
                  "Define custom code quality standards",
                  "Integrate with existing CI/CD pipelines",
                  "Compatible with all major linters and formatters",
                  "Apply different rule sets for different projects"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:w-1/2">
              <div className="glass-card rounded-lg p-5 border border-white/10 bg-card">
                <div className="text-xs font-mono mb-3 text-foreground/60"># Example of a custom rule configuration</div>
                <pre className="text-sm overflow-x-auto p-3 bg-black/30 rounded-md">
                  <code className="text-foreground/90">{`{
  "reviewRaccoon": {
    "rules": {
      "complexity": {
        "max": 15,
        "severity": "warning"
      },
      "duplicateCode": {
        "threshold": 5,
        "severity": "error"
      },
      "security": {
        "level": "high",
        "ignorePaths": ["test/**"]
      }
    },
    "integrations": {
      "jira": true,
      "slack": true
    }
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
