'use client'

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Code, GitBranch, Github, Terminal } from 'lucide-react';
import { REVIEW_RACCOON_WORKFLOW_CONFIG } from '@/constants';

const Documentation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h1 className="heading-lg mb-6">
              Review Raccoon <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Learn how to integrate Review Raccoon into your GitHub workflow to improve code quality.
            </p>
          </div>
          
          <div className="space-y-16">
            {/* Getting Started */}
            <section id="getting-started">
              <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Installation</h3>
                <p className="mb-4">You can install Review Raccoon directly from the GitHub Marketplace:</p>
                
                <ol className="space-y-4 mb-6">
                  <li className="flex gap-3">
                    <div className="bg-primary/20 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">1</span>
                    </div>
                    <div>
                      <p>Navigate to the <a href="https://github.com/marketplace/actions/review-raccoon" className="text-primary underline">Review Raccoon GitHub Marketplace page</a>.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-primary/20 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">2</span>
                    </div>
                    <div>
                      <p>Click the "Install it for free" button.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-primary/20 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">3</span>
                    </div>
                    <div>
                      <p>Select the repositories where you want to use Review Raccoon.</p>
                    </div>
                  </li>
                </ol>
                
                <h3 className="text-xl font-semibold mb-4">Setup Workflow File</h3>
                <p className="mb-4">Create a workflow file in your repository:</p>
                
                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground/70 font-mono">.github/workflows/review-raccoon.yml</span>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Terminal size={14} className="mr-1" /> Copy
                    </Button>
                  </div>
                  <pre className="overflow-x-auto text-sm">
                    <code>{REVIEW_RACCOON_WORKFLOW_CONFIG}</code>
                  </pre>
                </div>
              </div>
            </section>
            
            {/* Configuration */}
            <section id="configuration">
              <h2 className="text-3xl font-bold mb-6">Configuration</h2>
              <div className="glass-card p-6 rounded-xl">
                <p className="mb-4">Create a configuration file in your repository root:</p>
                
                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground/70 font-mono">.reviewraccoon.json</span>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Terminal size={14} className="mr-1" /> Copy
                    </Button>
                  </div>
                  <pre className="overflow-x-auto text-sm">
                    <code>{`{
  "language": "auto",
  "ignorePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**"
  ],
  "maxFiles": 20,
  "commentStyle": "inline",
  "focusAreas": [
    "security",
    "performance",
    "bestPractices",
    "codeStyle"
  ]
}`}</code>
                  </pre>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Configuration Options</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold">language</h4>
                    <p className="text-sm text-foreground/70">Set to "auto" for automatic language detection or specify a language like "javascript", "python", etc.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">ignorePatterns</h4>
                    <p className="text-sm text-foreground/70">Files or directories to ignore during analysis.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">maxFiles</h4>
                    <p className="text-sm text-foreground/70">Maximum number of files to analyze per pull request.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">commentStyle</h4>
                    <p className="text-sm text-foreground/70">Choose between "inline" (comments on specific lines) or "summary" (one comment with all feedback).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">focusAreas</h4>
                    <p className="text-sm text-foreground/70">Specific aspects of code to focus on during review.</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Advanced Usage */}
            <section id="advanced-usage">
              <h2 className="text-3xl font-bold mb-6">Advanced Usage</h2>
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Custom Rules</h3>
                <p className="mb-4">Define custom rules in your configuration file:</p>
                
                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <pre className="overflow-x-auto text-sm">
                    <code>{`{
  // ... other configuration
  "customRules": [
    {
      "pattern": "console\\.log",
      "message": "Remove console.log statements before merging",
      "severity": "warning"
    }
  ]
}`}</code>
                  </pre>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Team Integration</h3>
                <p className="mb-6">For team environments, you can create a central configuration file that all repositories reference.</p>
                
                <h3 className="text-xl font-semibold mb-4">API Integration</h3>
                <p>Access Review Raccoon's API to integrate with your own tools and dashboards. See our API documentation for details.</p>
              </div>
            </section>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-foreground/70 mb-4">Need more help?</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Github size={18} />
                <span>GitHub Issues</span>
              </Button>
              <Button className="button-glow flex items-center gap-2">
                <GitBranch size={18} />
                <span>Community Forum</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Documentation;
