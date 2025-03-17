'use client'

import React, { useState } from 'react';
import NextNavbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login/signup
    router.push('/dashboard');
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
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
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
