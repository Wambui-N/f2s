"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Connecting your Google account...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          setMessage("Failed to connect your Google account");
          return;
        }

        if (data.session) {
          console.log("Session data:", data.session);
          console.log("Provider token:", data.session.provider_token);
          console.log("Provider refresh token:", data.session.provider_refresh_token);
          
          // Store the provider tokens
          const providerToken = data.session.provider_token;
          const providerRefreshToken = data.session.provider_refresh_token;

          if (providerToken && providerRefreshToken) {
            console.log("Storing tokens for user:", data.session.user.id);
            
            // Store tokens securely in your database
            const { error: tokenError } = await supabase
              .from("user_google_tokens")
              .upsert({
                user_id: data.session.user.id,
                access_token: providerToken,
                refresh_token: providerRefreshToken,
                expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id'
              });

            if (tokenError) {
              console.error("Error storing tokens:", tokenError);
              setStatus("error");
              setMessage(`Failed to store authentication tokens: ${tokenError.message}`);
              return;
            } else {
              console.log("Tokens stored successfully");
            }
          } else {
            console.error("Missing provider tokens in session");
            setStatus("error");
            setMessage("Google authentication tokens not received. Please try reconnecting.");
            return;
          }

          setStatus("success");
          setMessage("Successfully connected your Google account!");

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            // Store success state in localStorage to show welcome message
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_success', 'true');
            }
            // Check if we came from settings page
            const fromSettings = typeof window !== 'undefined' && 
              (window.location.search.includes('from=settings') || 
               document.referrer.includes('/dashboard/settings'));
            router.push(fromSettings ? "/dashboard/settings" : "/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("No session found");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className=" w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold mb-2 text-green-800">
              Success!
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2 text-red-800">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
