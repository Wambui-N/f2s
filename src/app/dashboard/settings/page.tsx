"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Settings,
  User,
  Trash2,
  Plus,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Sheet,
  Sparkles,
  Shield,
  Zap,
  Chrome,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { SheetConnection } from "@/lib/types";

function SettingsContent() {
  const { user, signOut, reconnectWithGoogle } = useAuth();
  const router = useRouter();
  const [sheetConnections, setSheetConnections] = useState<SheetConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingSheet, setConnectingSheet] = useState(false);
  const [newSheetUrl, setNewSheetUrl] = useState("");
  const [newSheetName, setNewSheetName] = useState("");
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [createNewSheet, setCreateNewSheet] = useState(false);

  useEffect(() => {
    if (user) {
      loadSheetConnections();
    }
  }, [user]);

  const loadSheetConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("sheet_connections")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSheetConnections(data || []);
    } catch (error) {
      console.error("Failed to load sheet connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectExistingSheet = async () => {
    if (!newSheetUrl.trim()) return;

    try {
      setConnectingSheet(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.provider_token || !session?.provider_refresh_token) {
        alert("Please reconnect your Google account with Sheets permissions.");
        return;
      }

      const response = await fetch("/api/sheets/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sheetUrl: newSheetUrl,
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewSheetUrl("");
        setShowConnectForm(false);
        loadSheetConnections();
        // Show success message
      } else {
        alert(`Failed to connect sheet: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to connect sheet:", error);
      alert("Failed to connect sheet. Please try again.");
    } finally {
      setConnectingSheet(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!newSheetName.trim()) return;

    try {
      setConnectingSheet(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.provider_token || !session?.provider_refresh_token) {
        alert("Please reconnect your Google account with Sheets permissions.");
        return;
      }

      const response = await fetch("/api/sheets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sheetName: newSheetName,
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewSheetName("");
        setCreateNewSheet(false);
        setShowConnectForm(false);
        loadSheetConnections();
        // Show success message
      } else {
        alert(`Failed to create sheet: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to create sheet:", error);
      alert("Failed to create sheet. Please try again.");
    } finally {
      setConnectingSheet(false);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this Google Sheet? Forms using this sheet will no longer sync submissions.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("sheet_connections")
        .delete()
        .eq("id", connectionId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setSheetConnections((prev) =>
        prev.filter((conn) => conn.id !== connectionId),
      );
    } catch (error) {
      console.error("Failed to delete connection:", error);
      alert("Failed to disconnect sheet. Please try again.");
    }
  };

  const handleSyncHeaders = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/sheets/sync-headers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      const result = await response.json();

      if (result.success) {
        loadSheetConnections();
        // Show success message
      } else {
        alert(`Failed to sync headers: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to sync headers:", error);
      alert("Failed to sync headers. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
      <PageHeader
        title="Settings"
        description="Manage your account and configure Google Sheets integrations"
        backButton={{
          onClick: () => router.push("/dashboard"),
          label: "Back to Dashboard"
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-3 h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {user?.user_metadata?.full_name || "Unknown User"}
                  </h3>
                  <p className="text-muted-foreground">
                    {user?.email}
                  </p>
                  <StatusBadge status="success" text="Verified Account" className="mt-2" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="mt-2">
                    <StatusBadge status="success" text="Active Premium" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(user?.created_at || "").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              <Button 
                variant="outline" 
                onClick={signOut} 
                className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Google Account Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Chrome className="w-5 h-5 mr-3" />
                Google Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                    <Chrome className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="font-medium">Google Account</Label>
                    <div className="flex items-center mt-1">
                      {user?.app_metadata?.provider === "google" ? (
                        <StatusBadge status="success" text="Connected" />
                      ) : (
                        <StatusBadge status="warning" text="Not Connected" />
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reconnectWithGoogle}
                  className="hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Secure Integration</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your Google account is securely connected with enterprise-grade encryption. 
                      If you're experiencing issues with Google Sheets, try reconnecting to refresh permissions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Google Sheets Connections */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <Sheet className="mr-3 h-5 w-5" />
                  Google Sheets Connections
                </CardTitle>
                <Button
                  onClick={() => setShowConnectForm(!showConnectForm)}
                  disabled={connectingSheet}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Sheet
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connect Form */}
              {showConnectForm && (
                <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant={!createNewSheet ? "default" : "outline"}
                          onClick={() => setCreateNewSheet(false)}
                          size="sm"
                          className={!createNewSheet ? "btn-primary" : ""}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Connect Existing
                        </Button>
                        <Button
                          variant={createNewSheet ? "default" : "outline"}
                          onClick={() => setCreateNewSheet(true)}
                          size="sm"
                          className={createNewSheet ? "btn-primary" : ""}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New
                        </Button>
                      </div>

                      {createNewSheet ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="sheet-name" className="text-sm font-medium">
                              Sheet Name
                            </Label>
                            <Input
                              id="sheet-name"
                              placeholder="My FormToSheets Data"
                              value={newSheetName}
                              onChange={(e) => setNewSheetName(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <Button
                              onClick={handleCreateNewSheet}
                              disabled={connectingSheet || !newSheetName.trim()}
                              className="btn-primary flex-1"
                            >
                              {connectingSheet ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                              )}
                              Create & Connect
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowConnectForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="sheet-url" className="text-sm font-medium">
                              Google Sheets URL
                            </Label>
                            <Input
                              id="sheet-url"
                              placeholder="https://docs.google.com/spreadsheets/d/..."
                              value={newSheetUrl}
                              onChange={(e) => setNewSheetUrl(e.target.value)}
                              className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Paste the full URL of your Google Sheet
                            </p>
                          </div>
                          <div className="flex space-x-3">
                            <Button
                              onClick={handleConnectExistingSheet}
                              disabled={connectingSheet || !newSheetUrl.trim()}
                              className="btn-primary flex-1"
                            >
                              {connectingSheet ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <LinkIcon className="w-4 h-4 mr-2" />
                              )}
                              Connect Sheet
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowConnectForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Connect sheets to forms from the 'Integrations' tab in the form builder. 
                              Each form can have its own dedicated sheet for better organization.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Connections */}
              {sheetConnections.length === 0 ? (
                <EmptyState
                  icon={<Sheet className="h-12 w-12 text-muted-foreground" />}
                  title="No Google Sheets Connected"
                  description="Connect your first Google Sheet to start automatically saving form submissions. Your data will sync in real-time."
                  action={{
                    label: "Connect Your First Sheet",
                    onClick: () => setShowConnectForm(true)
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Connected Sheets</h3>
                    <Badge variant="secondary" className="px-3 py-1">
                      {sheetConnections.length} connected
                    </Badge>
                  </div>
                  
                  {sheetConnections.map((connection) => (
                    <Card key={connection.id} className="border shadow-sm hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                              <Sheet className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{connection.sheet_name}</h4>
                              <div className="flex items-center space-x-4 mt-2">
                                <p className="text-sm text-muted-foreground">
                                  Connected {new Date(connection.created_at).toLocaleDateString()}
                                </p>
                                {connection.last_synced && (
                                  <p className="text-xs text-green-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Last synced: {new Date(connection.last_synced).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="mt-2">
                                <StatusBadge
                                  status={connection.is_active ? "success" : "error"}
                                  text={connection.is_active ? "Active" : "Inactive"}
                                />
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
                              <ExternalLink className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncHeaders(connection.id)}
                              className="hover:bg-blue-50"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteConnection(connection.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Privacy Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-3 h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Two-Factor Authentication</span>
                  <StatusBadge status="success" text="Enabled" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Encryption</span>
                  <StatusBadge status="success" text="AES-256" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GDPR Compliance</span>
                  <StatusBadge status="success" text="Compliant" />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
