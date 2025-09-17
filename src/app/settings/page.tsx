"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  Sheet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SheetConnection {
  id: string;
  sheet_id: string;
  sheet_name: string;
  sheet_url: string;
  created_at: string;
  last_synced: string | null;
  is_active: boolean;
}

function SettingsContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sheetConnections, setSheetConnections] = useState<SheetConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingSheet, setConnectingSheet] = useState(false);
  const [newSheetUrl, setNewSheetUrl] = useState('');
  const [newSheetName, setNewSheetName] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [createNewSheet, setCreateNewSheet] = useState(false);

  useEffect(() => {
    if (user) {
      loadSheetConnections();
      
      // Check if user returned from OAuth with sheets permissions
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('connect_sheets') === 'true') {
        // Remove the parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Show success message or automatically try to connect
        console.log('User returned with Sheets permissions');
      }
    }
  }, [user]);

  const loadSheetConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('sheet_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSheetConnections(data || []);
    } catch (error) {
      console.error('Failed to load sheet connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectToGoogle = async () => {
    try {
      setConnectingSheet(true);
      
      // Redirect to Google OAuth with Sheets scope
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
          redirectTo: `${window.location.origin}/settings?connect_sheets=true`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        setConnectingSheet(false);
      }
    } catch (error) {
      console.error('Failed to connect to Google:', error);
      setConnectingSheet(false);
    }
  };

  const handleConnectExistingSheet = async () => {
    if (!newSheetUrl.trim()) return;

    try {
      setConnectingSheet(true);
      
      // Get fresh tokens from current session
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Session data:', {
        hasSession: !!session,
        hasProviderToken: !!session?.provider_token,
        hasRefreshToken: !!session?.provider_refresh_token,
        provider: session?.app_metadata?.provider
      });

      if (!session?.provider_token || !session?.provider_refresh_token) {
        alert('Please reconnect your Google account with Sheets permissions.');
        handleConnectToGoogle();
        return;
      }

      const response = await fetch('/api/sheets/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sheetUrl: newSheetUrl,
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewSheetUrl('');
        setShowConnectForm(false);
        loadSheetConnections();
        alert('Sheet connected successfully!');
      } else {
        alert(`Failed to connect sheet: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to connect sheet:', error);
      alert('Failed to connect sheet. Please try again.');
    } finally {
      setConnectingSheet(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!newSheetName.trim()) return;

    try {
      setConnectingSheet(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Create sheet - Session data:', {
        hasSession: !!session,
        hasProviderToken: !!session?.provider_token,
        hasRefreshToken: !!session?.provider_refresh_token,
        provider: session?.app_metadata?.provider,
        scopes: session?.provider_token ? 'token exists' : 'no token'
      });
      
      if (!session?.provider_token || !session?.provider_refresh_token) {
        alert('Please reconnect your Google account with Sheets permissions.');
        handleConnectToGoogle();
        return;
      }

      const response = await fetch('/api/sheets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sheetName: newSheetName,
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewSheetName('');
        setCreateNewSheet(false);
        setShowConnectForm(false);
        loadSheetConnections();
        alert('New sheet created and connected successfully!');
      } else {
        alert(`Failed to create sheet: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to create sheet:', error);
      alert('Failed to create sheet. Please try again.');
    } finally {
      setConnectingSheet(false);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this Google Sheet? Forms using this sheet will no longer sync submissions.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sheet_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSheetConnections(prev => prev.filter(conn => conn.id !== connectionId));
      alert('Sheet disconnected successfully.');
    } catch (error) {
      console.error('Failed to delete connection:', error);
      alert('Failed to disconnect sheet. Please try again.');
    }
  };

  const handleSyncHeaders = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/sheets/${connectionId}/sync-headers`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        loadSheetConnections(); // Reload to get updated last_synced
        alert('Headers synced successfully!');
      } else {
        alert(`Failed to sync headers: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to sync headers:', error);
      alert('Failed to sync headers. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account and Google Sheets connections
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.full_name || 'User'}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {user?.user_metadata?.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Badge variant="default" className="w-fit">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Google Sheets Connections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sheet className="mr-2" />
                    Google Sheets Connections
                  </CardTitle>
                  <Button
                    onClick={() => setShowConnectForm(!showConnectForm)}
                    disabled={connectingSheet}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Sheet
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connect Form */}
                {showConnectForm && (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant={!createNewSheet ? "default" : "outline"}
                            onClick={() => setCreateNewSheet(false)}
                            size="sm"
                          >
                            Connect Existing Sheet
                          </Button>
                          <Button
                            variant={createNewSheet ? "default" : "outline"}
                            onClick={() => setCreateNewSheet(true)}
                            size="sm"
                          >
                            Create New Sheet
                          </Button>
                        </div>

                        {createNewSheet ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="sheet-name">Sheet Name</Label>
                              <Input
                                id="sheet-name"
                                placeholder="My FormToSheets Data"
                                value={newSheetName}
                                onChange={(e) => setNewSheetName(e.target.value)}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleCreateNewSheet}
                                disabled={connectingSheet || !newSheetName.trim()}
                              >
                                {connectingSheet ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4 mr-2" />
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
                              <Label htmlFor="sheet-url">Google Sheets URL</Label>
                              <Input
                                id="sheet-url"
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                value={newSheetUrl}
                                onChange={(e) => setNewSheetUrl(e.target.value)}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleConnectExistingSheet}
                                disabled={connectingSheet || !newSheetUrl.trim()}
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

                        <div className="text-sm text-muted-foreground">
                          <p className="mb-2">
                            <strong>First time connecting?</strong> You'll need to authorize FormToSheets to access your Google Sheets.
                          </p>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleConnectToGoogle}
                              disabled={connectingSheet}
                            >
                              Authorize Google Sheets Access
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const { data: { session } } = await supabase.auth.getSession();
                                console.log('Debug session:', session);
                                alert(`Debug: Has provider token: ${!!session?.provider_token}, Has refresh token: ${!!session?.provider_refresh_token}`);
                              }}
                            >
                              Debug Session
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Connections */}
                {sheetConnections.length === 0 ? (
                  <div className="text-center py-8">
                    <Sheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Google Sheets Connected</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect a Google Sheet to automatically save form submissions
                    </p>
                    <Button onClick={() => setShowConnectForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Connect Your First Sheet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sheetConnections.map((connection) => (
                      <Card key={connection.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <Sheet className="h-5 w-5 text-green-600" />
                                <div>
                                  <h4 className="font-semibold">{connection.sheet_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Connected {new Date(connection.created_at).toLocaleDateString()}
                                  </p>
                                  {connection.last_synced && (
                                    <p className="text-xs text-muted-foreground">
                                      Last synced: {new Date(connection.last_synced).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={connection.is_active ? "default" : "secondary"}
                              >
                                {connection.is_active ? "Active" : "Inactive"}
                              </Badge>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(connection.sheet_url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncHeaders(connection.id)}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteConnection(connection.id)}
                                className="text-red-600 hover:text-red-700"
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
