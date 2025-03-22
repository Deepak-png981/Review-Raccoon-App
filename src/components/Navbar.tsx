'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Menu, X, Github, LogIn, LayoutDashboard, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { REVIEW_RACCOON_GITHUB_MARKETPLACE_URL } from '@/constants';
import { useSession } from 'next-auth/react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  const handleLoginClick = () => {
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const handleDashboardClick = () => {
    setIsMobileMenuOpen(false);
    router.push('/dashboard');
  };

  const handleGitHubClick = () => {
    window.open(REVIEW_RACCOON_GITHUB_MARKETPLACE_URL, '_blank');
    setIsMobileMenuOpen(false);
  };

  const renderAuthButton = () => {
    if (status === 'loading') {
      return (
        <Button disabled className="button-glow flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </Button>
      );
    }

    if (status === 'authenticated' && session) {
      return (
        <Button className="button-glow flex items-center gap-2" onClick={handleDashboardClick}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Button>
      );
    }

    return (
      <Button className="button-glow flex items-center gap-2" onClick={handleLoginClick}>
        <LogIn size={18} />
        <span>Login / Signup</span>
      </Button>
    );
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-8 transition-all duration-300 ${
        isScrolled ? 'py-4 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 animate-fade-in">
          <Image 
            src="/raccoon-logo.svg"
            alt="Review Raccoon Logo"
            width={120}
            height={20}
            className="w-[12px] h-auto sm:w-[60px]"
            priority
          />
          <span className="font-display font-bold text-xl">Review Raccoon</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            <li>
              <a 
                href="/#features" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('features');
                }}
                className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="/#how-it-works" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('how-it-works');
                }}
                className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                How It Works
              </a>
            </li>
            <li>
              <a 
                href="/#pricing" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('pricing');
                }}
                className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                Pricing
              </a>
            </li>
            <li>
              <Link href="/documentation" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                Documentation
              </Link>
            </li>
          </ul>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2" onClick={handleGitHubClick}>
              <Github size={18} />
              <span>GitHub</span>
            </Button>
            {renderAuthButton()}
          </div>
        </nav>
        
        <button 
          className="md:hidden text-foreground/80 hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col h-full p-6 pt-24">
            <ul className="flex flex-col gap-6 mb-8">
              <li>
                <a 
                  href="/#features" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('features');
                  }}
                  className="text-lg font-medium"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="/#how-it-works" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('how-it-works');
                  }}
                  className="text-lg font-medium"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="/#pricing" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('pricing');
                  }}
                  className="text-lg font-medium"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/documentation" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Documentation
                </Link>
              </li>
            </ul>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 w-full" 
                onClick={handleGitHubClick}
              >
                <Github size={18} />
                <span>GitHub</span>
              </Button>
              {renderAuthButton()}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar; 