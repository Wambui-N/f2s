"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Chrome, Loader2 } from "lucide-react";

interface GoogleConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleConnectButton({
  onSuccess,
  onError,
}: GoogleConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/calendar",
          ].join(" "),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        onError?.(error.message);
      } else {
        // The redirect will happen automatically
        console.log("OAuth initiated successfully");
      }
    } catch (error) {
      console.error("Connection error:", error);
      onError?.("Failed to connect to Google");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleConnect}
      disabled={isConnecting}
      className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Chrome className="w-4 h-4" />
      )}
      <span>{isConnecting ? "Connecting..." : "Connect Google Account"}</span>
    </Button>
  );
}
