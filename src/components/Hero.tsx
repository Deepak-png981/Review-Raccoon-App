'use client'

import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, GitMerge, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const spotlight = container.querySelector('.spotlight') as HTMLElement;
      if (spotlight) {
        spotlight.style.setProperty('--x', `${e.clientX}px`);
        spotlight.style.setProperty('--y', `${e.clientY}px`);
      }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <section 
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden"
    >
      <div className="spotlight animate-spotlight" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Star size={16} className="text-primary" />
            <span className="text-sm font-medium">Streamline your GitHub code reviews</span>
          </div>
          
          <h1 className="heading-xl mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <span className="text-gradient">Automated code reviews</span> <br />
            that save developer time
          </h1>
          
          <p className="max-w-2xl text-xl text-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Review Raccoon analyzes your pull requests automatically, providing smart suggestions, 
            spotting potential bugs, and ensuring your code quality stays high — all without slowing down your team.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button size="lg" className="w-full sm:w-auto button-glow" onClick={handleLoginClick}>
              Login / Signup
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto group">
              <Github size={18} className="mr-2" />
              <span>Explore GitHub Action</span>
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-foreground/60 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <GitMerge size={14} />
            <span>Works with GitHub Actions. No code changes required.</span>
          </div>
        </div>
        
        <div className="relative mt-16 glass-card rounded-xl p-1 border border-white/10 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="absolute -top-4 left-6 px-4 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-xs font-medium">
            Review Raccoon in action
          </div>
          <div className="bg-card rounded-lg overflow-hidden w-full h-full aspect-[16/9]">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 flex items-center justify-center">
              <div className="glass-card p-8 rounded-xl max-w-2xl w-full text-left">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                    <img src="/raccoon-logo.svg" alt="Raccoon" className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Review Raccoon Analysis Complete</h3>
                    <p className="text-foreground/70 text-sm">Found 3 potential issues in PR #123</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-lg border border-white/5">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Unused variable detected</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Warning</span>
                    </div>
                    <p className="text-xs text-foreground/70">The variable 'user' is declared but never used in 'auth.js:24'</p>
                  </div>
                  
                  <div className="p-3 bg-secondary/50 rounded-lg border border-white/5">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Potential memory leak</span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Critical</span>
                    </div>
                    <p className="text-xs text-foreground/70">Unsubscribed event listener in React component 'Dashboard.jsx:56'</p>
                  </div>
                  
                  <div className="p-3 bg-secondary/50 rounded-lg border border-white/5">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Code style improvement</span>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Suggestion</span>
                    </div>
                    <p className="text-xs text-foreground/70">Consider using array destructuring pattern at 'utils.js:103'</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 flex flex-wrap justify-center gap-10 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2">500+</h3>
            <p className="text-foreground/70">GitHub Repositories</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2">10,000+</h3>
            <p className="text-foreground/70">PRs Analyzed</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2">98%</h3>
            <p className="text-foreground/70">Accuracy Rate</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2">5hrs+</h3>
            <p className="text-foreground/70">Saved Per Developer Weekly</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
