'use client'

import React, { useState } from 'react';
import NextNavbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { toast } from "@/components/ui/use-toast";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to sign in with Google",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Handle form submission logic here
      router.push('/dashboard');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <NextNavbar />
      
      <main className="pt-32 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <Card className="border-border/40 shadow-lg">
              <CardHeader>
                <CardTitle>{activeTab === "login" ? "Welcome back" : "Create an account"}</CardTitle>
                <CardDescription>
                  {activeTab === "login" 
                    ? "Enter your credentials to access your account" 
                    : "Fill in the details below to create your account"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {activeTab === "login" && (
                        <a href="#" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <Input id="password" type="password" placeholder="Enter your password" />
                  </div>
                  
                  {activeTab === "login" ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the <a href="#" className="text-primary hover:underline">terms and conditions</a>
                      </label>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full button-glow">
                    {activeTab === "login" ? "Login" : "Sign Up"}
                  </Button>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 bg-white  text-black border border-gray-300"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    type="button"
                  >
                    <img 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                      alt="Google logo" 
                      className="w-5 h-5"
                    />
                    Sign in with Google
                  </Button>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center border-t border-border/40 pt-4">
                <p className="text-sm text-muted-foreground">
                  {activeTab === "login" ? (
                    <>
                      Don't have an account?{" "}
                      <a 
                        href="#" 
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("signup");
                        }}
                      >
                        Sign up
                      </a>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <a 
                        href="#" 
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("login");
                        }}
                      >
                        Login
                      </a>
                    </>
                  )}
                </p>
              </CardFooter>
            </Card>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
