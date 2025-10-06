"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-stretch bg-white">
      <div className="hidden md:flex flex-col justify-center px-12 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="w-full max-w-[48rem] min-w-0">
          <blockquote className="text-2xl font-semibold text-gray-900 leading-snug text-pretty max-w-prose">
            “I had my first form capturing leads in under 2 minutes. This is magic!”
          </blockquote>
          <p className="mt-4 text-gray-700">— User Name, Title</p>
          <p className="mt-8 text-sm text-gray-600">Trusted by 1,000+ founders</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 w-full">
        <Card className="w-full max-w-[36rem] shrink-0">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold">Welcome Back</h1>

            <div className="mt-6">
              <Button
                onClick={() => signInWithGoogle?.()}
                className="w-full h-11 text-base bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                variant="outline"
              >
                <Chrome className="w-5 h-5" />
                Continue with Google
              </Button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <Separator className="flex-1" />
              <span className="text-xs text-gray-500">or</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? "Logging in..." : "Log In to My Account"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
              <Link href="/auth/forgot-password" className="underline">Forgot password?</Link>
              <span>
                Don&apos;t have an account? {" "}
                <Link href="/auth/signup" className="underline">Sign up</Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



