import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Sheet, 
  Plus, 
  Link, 
  AlertCircle, 
  ExternalLink,
  Zap,
  CheckCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { FormData } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { SheetConnection } from "@/lib/types";

interface IntegrationsPanelProps {
  formData: FormData;
  onConnectionUpdate: () => void;
}

export function IntegrationsPanel({
  formData,
  onConnectionUpdate,
}: IntegrationsPanelProps) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<SheetConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectOptions, setShowConnectOptions] = useState(false);
  const [existingConnections, setExistingConnections] = useState<SheetConnection[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [newSheetName, setNewSheetName] = useState("");

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!formData.id || !user) return;
      setIsLoading(true);

      try {
        // Get form with sheet connection
        const { data: formWithConnection, error: formError } = await supabase
          .from("forms")
          .select(`
            id,
            default_sheet_connection_id,
            sheet_connections!forms_default_sheet_connection_id_fkey (
              id, sheet_name, sheet_url, is_active, created_at, last_synced
            )
          `)
          .eq("id", formData.id)
          .single();

        if (formError) throw formError;
        
        setConnection((formWithConnection?.sheet_connections as unknown as SheetConnection) || null);

        // Fetch user's existing connections
        const { data: connections, error: connectionsError } = await supabase
          .from("sheet_connections")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (connectionsError) throw connectionsError;
        setExistingConnections(connections || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnectionStatus();
  }, [formData.id, user]);

  const handleCreateAndConnect = async () => {
    setIsConnecting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be signed in to create sheets.");
      }

      // Get Google tokens from database
      const { data: tokens, error: tokensError } = await supabase
        .from("user_google_tokens")
        .select("access_token, refresh_token")
        .eq("user_id", user!.id)
        .single();

      if (tokensError || !tokens) {
        throw new Error("Google account not connected. Please connect in settings.");
      }

      const sheetName = newSheetName.trim() || `${formData.title} - Submissions`;

      const response = await fetch("/api/sheets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sheetName,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to create Google Sheet.");
      }

      await linkFormToSheet(result.connection.id);
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLinkExisting = async () => {
    if (!selectedSheet) return;
    setIsConnecting(true);
    
    try {
      await linkFormToSheet(selectedSheet);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const linkFormToSheet = async (connectionId: string) => {
    const { error } = await supabase
      .from("forms")
      .update({ default_sheet_connection_id: connectionId })
      .eq("id", formData.id);

    if (error) {
      throw new Error("Failed to link sheet to form.");
    }

    setShowConnectOptions(false);
    setNewSheetName("");
    setSelectedSheet("");
    onConnectionUpdate();
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    
    const { error } = await supabase
      .from("forms")
      .update({ default_sheet_connection_id: null })
      .eq("id", formData.id);

    if (error) {
      setError("Failed to disconnect sheet.");
    } else {
      onConnectionUpdate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading integration status..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-medium">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => setError(null)}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Google Sheets Integration
          </CardTitle>
          <p className="text-muted-foreground pt-2 leading-relaxed">
            Connect a Google Sheet to automatically save form submissions in real-time. 
            Your data will be organized and accessible instantly.
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {connection ? (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sheet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-green-900">
                          {connection.sheet_name}
                        </h3>
                        <StatusBadge status="success" text="Connected" />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-green-700">
                        <span>Real-time sync active</span>
                        {connection.last_synced && (
                          <span>
                            Last synced: {new Date(connection.last_synced).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(connection.sheet_url, "_blank")}
                      className="hover:bg-green-50 hover:text-green-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Sheet
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDisconnect}
                      className="hover:bg-red-50 hover:text-red-700"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<AlertCircle className="h-12 w-12 text-muted-foreground" />}
              title="No Google Sheet Connected"
              description="Connect a Google Sheet to automatically save form submissions and keep your data organized in real-time."
              action={{
                label: "Connect Google Sheet",
                onClick: () => setShowConnectOptions(true)
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Connection Options Dialog */}
      <Dialog open={showConnectOptions} onOpenChange={setShowConnectOptions}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sheet className="w-5 h-5 mr-2" />
              Connect to Google Sheets
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to connect your form to Google Sheets. 
              We recommend creating a new sheet for better organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Create New Sheet Option */}
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Create New Sheet</h4>
                    <p className="text-sm text-blue-700">
                      Recommended: Creates a dedicated sheet for this form
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-sheet-name" className="text-sm font-medium">
                      Sheet Name
                    </Label>
                    <Input
                      id="new-sheet-name"
                      value={newSheetName}
                      onChange={(e) => setNewSheetName(e.target.value)}
                      placeholder={`${formData.title} - Submissions`}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateAndConnect} 
                    disabled={isConnecting}
                    className="w-full btn-primary"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create & Connect New Sheet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Link Existing Sheet Option */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Link className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Link Existing Sheet</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect to a sheet you've already created
                    </p>
                  </div>
                </div>
                
                {existingConnections.length > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Select Sheet</Label>
                      <Select onValueChange={setSelectedSheet} value={selectedSheet}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a sheet..." />
                        </SelectTrigger>
                        <SelectContent>
                          {existingConnections.map((conn) => (
                            <SelectItem key={conn.id} value={conn.id}>
                              <div className="flex items-center space-x-2">
                                <Sheet className="w-4 h-4" />
                                <span>{conn.sheet_name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      onClick={handleLinkExisting}
                      disabled={!selectedSheet || isConnecting}
                      variant="outline"
                      className="w-full"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-2" />
                          Link Selected Sheet
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      No existing connections found
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open("/dashboard/settings", "_blank")}
                    >
                      Manage Connections
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnectOptions(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Benefits */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Integration Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Real-time Sync</h4>
                <p className="text-xs text-blue-700">
                  Submissions appear instantly in your Google Sheet
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Auto Organization</h4>
                <p className="text-xs text-green-700">
                  Data is automatically formatted and organized
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">Two-way Sync</h4>
                <p className="text-xs text-purple-700">
                  Edit in Sheets, see changes in your form
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <Sheet className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Native Experience</h4>
                <p className="text-xs text-orange-700">
                  Works like Google Sheets is your database
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}