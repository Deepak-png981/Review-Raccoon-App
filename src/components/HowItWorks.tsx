import React from 'react';
import { GitPullRequest, Github, CheckCircle2, Workflow } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { REVIEW_RACCOON_GITHUB_MARKETPLACE_URL, REVIEW_RACCOON_WORKFLOW_CONFIG } from '@/constants';
import { useRouter } from 'next/navigation';

const steps = [
  {
    icon: <Github size={24} className="text-primary" />,
    title: "Install from GitHub Marketplace",
    description: "Add Review Raccoon to your GitHub repository with just a few clicks through the GitHub Marketplace."
  },
  {
    icon: <Workflow size={24} className="text-primary" />,
    title: "Create a workflow file",
    description: "Add a simple YAML configuration file to your repository to define when and how Review Raccoon should run."
  },
  {
    icon: <GitPullRequest size={24} className="text-primary" />,
    title: "Open a Pull Request",
    description: "When a PR is created or updated, Review Raccoon automatically starts analyzing your code changes."
  },
  {
    icon: <CheckCircle2 size={24} className="text-primary" />,
    title: "Receive Intelligent Feedback",
    description: "Get detailed, actionable feedback directly in your PR, helping you improve code quality before merging."
  }
];

const HowItWorks = () => {
  const router = useRouter();

  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Workflow size={16} className="text-primary" />
            <span className="text-sm font-medium">Simple Integration</span>
          </div>
          
          <h2 className="heading-lg mb-6">
            How <span className="text-gradient">Review Raccoon</span> works
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-foreground/80">
            Integrating Review Raccoon into your GitHub workflow is simple and straightforward.
            Start improving your code quality in minutes, not days.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10 transform -translate-x-1/2 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-24 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}
              >
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-foreground/70">{step.description}</p>
                </div>
                
                <div className="md:w-1/2">
                  {index === 0 && (
                    <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <Github size={20} />
                        <span className="font-medium">GitHub Marketplace</span>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-background to-secondary/30">
                        <div className="glass-card p-4 rounded-lg mb-4 flex items-center gap-4">
                          <img src="/raccoon-logo.svg" alt="Review Raccoon" className="w-10 h-10" />
                          <div>
                            <h4 className="font-semibold">Review Raccoon</h4>
                            <p className="text-sm text-foreground/70">Automated code review assistant</p>
                          </div>
                          <a href={REVIEW_RACCOON_GITHUB_MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="ml-auto">Install</Button>
                          </a>
                        </div>
                        {/* <div className="h-36 bg-card/50 rounded-lg"></div> */}
                      </div>
                    </div>
                  )}
                  
                  {index === 1 && (
                    <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <span className="font-mono text-sm">.github/workflows/review-raccoon.yml</span>
                      </div>
                      <div className="p-6 bg-black/30">
                        <pre className="text-sm overflow-x-auto">
                          <code className="text-foreground/90">{REVIEW_RACCOON_WORKFLOW_CONFIG}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {index === 2 && (
                    <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <GitPullRequest size={20} />
                        <span className="font-medium">Pull Request #123: Add new feature</span>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-background to-secondary/30">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                          <div>
                            <p className="text-sm font-medium">Deepak Joshi added 3 commits</p>
                            <p className="text-xs text-foreground/60">2 hours ago</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="glass-card p-3 rounded-lg">
                            <p className="text-sm font-mono">feat: add user authentication</p>
                          </div>
                          <div className="glass-card p-3 rounded-lg">
                            <p className="text-sm font-mono">test: add tests for authentication</p>
                          </div>
                          <div className="glass-card p-3 rounded-lg">
                            <p className="text-sm font-mono">docs: update README with auth info</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {index === 3 && (
                    <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <img src="/raccoon-logo.svg" alt="Review Raccoon" className="w-5 h-5" />
                        <span className="font-medium">Review Raccoon Comment</span>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-background to-secondary/30">
                        <div className="glass-card p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Review Raccoon Analysis</h4>
                          
                          <div className="space-y-4">
                            <div className="p-3 bg-secondary/50 rounded-lg border border-white/5">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Potential memory leak</span>
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Critical</span>
                              </div>
                              <p className="text-xs text-foreground/70 mb-2">MAJOR: Unsubscribed event listener in React component 'Dashboard.jsx:56'</p>
                              <div className="text-xs bg-black/30 p-2 rounded font-mono">
                                useEffect(() =&gt; &#123;<br/>
                                &nbsp;&nbsp;window.addEventListener('resize', handleResize);<br/>
                                &nbsp;&nbsp;// Missing return cleanup function<br/>
                                &#125;, [])
                              </div>
                              <div className="mt-2 text-xs text-foreground/70">
                                <strong>Suggestion:</strong> Add a cleanup function to remove the event listener.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 text-center">
          <Button 
            size="lg" 
            className="button-glow"
            onClick={() => router.push('/login')}
          >
            Get Started with Review Raccoon
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
