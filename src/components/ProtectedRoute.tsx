"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Chrome, Shield, Sparkles } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <LoadingSpinner size="lg" text="Checking your authentication..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 animate-scale-in">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-3">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-center mb-8 leading-relaxed">
              Sign in with your Google account to access your dashboard and manage your forms
            </p>
            
            <div className="w-full space-y-4">
              <Button 
                onClick={signInWithGoogle} 
                className="w-full btn-primary group"
                size="lg"
              >
                <Chrome className="w-5 h-5 mr-3" />
                Sign In with Google
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full btn-secondary"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t w-full">
              <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Chrome className="w-3 h-3" />
                  <span>Google OAuth</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}