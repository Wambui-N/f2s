"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth() as any;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("You must agree to the Privacy Policy and Terms of Service");
      return;
    }
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      if (error) throw error;
      // Supabase may require email confirmation depending on project settings
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-stretch bg-white">
      <div className="hidden md:flex flex-col justify-center px-12 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="w-full max-w-[48rem] min-w-0">
          <blockquote className="text-2xl font-semibold text-gray-900 leading-snug text-pretty">
            “I had my first form capturing leads in under 2 minutes. This is magic!”
          </blockquote>
          <p className="mt-4 text-gray-700">— User Name, Title</p>
          <p className="mt-8 text-sm text-gray-600">Trusted by 1,000+ founders</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 w-full min-w-0">
        <Card className="w-full max-w-[36rem] shrink-0">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold">Start Your 30-Day Free Trial</h1>

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

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
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
                  placeholder="Create a password"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox checked={agree} onCheckedChange={(v: any) => setAgree(!!v)} />
                <p className="text-sm text-gray-600">
                  I agree to the {" "}
                  <Link href="/privacy" className="underline">Privacy Policy</Link>{" "}
                  and {" "}
                  <Link href="/terms" className="underline">Terms of Service</Link>
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? "Creating..." : "Create My Account"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-600 text-center">
              Already have an account? {" "}
              <Link href="/auth/login" className="underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



