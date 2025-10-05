import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login - will be replaced with real auth
    setTimeout(() => {
      toast.success("Login successful! (Backend needed)");
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock signup - will be replaced with real auth
    setTimeout(() => {
      toast.success("Signup successful! Check your email for verification. (Backend needed)");
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock forgot password - will be replaced with real auth
    setTimeout(() => {
      toast.success("Password reset email sent! (Backend needed)");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-2">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Concept X</CardTitle>
          <CardDescription>Connect and collaborate with creators</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Sign In"}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => {
                    const forgotTab = document.querySelector('[value="forgot"]');
                    if (forgotTab instanceof HTMLElement) forgotTab.click();
                  }}
                >
                  Forgot password?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name" 
                    type="text" 
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input 
                    id="forgot-email" 
                    type="email" 
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Reset Password"}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => {
                    const loginTab = document.querySelector('[value="login"]');
                    if (loginTab instanceof HTMLElement) loginTab.click();
                  }}
                >
                  Back to login
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
