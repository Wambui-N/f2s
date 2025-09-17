import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, Plus, Link, AlertCircle } from 'lucide-react';
import { FormData } from './types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SheetConnection {
  id: string;
  sheet_name: string;
  sheet_url: string;
}

interface IntegrationsPanelProps {
  formData: FormData;
  onConnectionUpdate: () => void; // Callback to refresh form data
}

export function IntegrationsPanel({ formData, onConnectionUpdate }: IntegrationsPanelProps) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<SheetConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectOptions, setShowConnectOptions] = useState(false);
  const [existingConnections, setExistingConnections] = useState<SheetConnection[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!formData.id || !user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from('forms')
        .select(`
          sheet_connections (
            id,
            sheet_name,
            sheet_url
          )
        `)
        .eq('id', formData.id)
        .single();

      if (error) {
        console.error("Error fetching connection status:", error);
        setError("Could not load connection details.");
      } else if (data) {
        setConnection(data.sheet_connections as SheetConnection | null);
      }
      setIsLoading(false);
    };

    fetchConnectionStatus();
  }, [formData.id, user]);

  const handleCreateAndConnect = async () => {
    setIsConnecting(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.provider_token) {
      alert("Google account not connected or permissions missing. Please connect it in settings.");
      setIsConnecting(false);
      return;
    }

    const response = await fetch('/api/sheets/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({
        sheetName: `${formData.title} - Submissions`,
        accessToken: session.provider_token,
        refreshToken: session.provider_refresh_token,
      }),
    });

    const result = await response.json();
    if (result.success) {
      const { data: newConnection } = await supabase
        .from('sheet_connections')
        .select('id')
        .eq('sheet_id', result.sheetId)
        .single();
      
      if (newConnection) {
        await linkFormToSheet(newConnection.id);
      }
    } else {
      alert(`Error: ${result.error}`);
    }
    setIsConnecting(false);
  };

  const handleLinkExisting = async () => {
    if (!selectedSheet) return;
    setIsConnecting(true);
    await linkFormToSheet(selectedSheet);
    setIsConnecting(false);
  };

  const linkFormToSheet = async (connectionId: string) => {
    const { error } = await supabase
      .from('forms')
      .update({ default_sheet_connection_id: connectionId })
      .eq('id', formData.id);

    if (error) {
      alert("Failed to link sheet to form.");
    } else {
      setShowConnectOptions(false);
      onConnectionUpdate(); // This will trigger a re-fetch in the parent
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    const { error } = await supabase
      .from('forms')
      .update({ default_sheet_connection_id: null })
      .eq('id', formData.id);

    if (error) {
      alert("Failed to disconnect sheet.");
    } else {
      onConnectionUpdate();
    }
  };

  const handleShowConnect = async () => {
    // Fetch user's existing connections to offer them as choices
    const { data } = await supabase
      .from('sheet_connections')
      .select('id, sheet_name')
      .eq('user_id', user?.id);
    
    setExistingConnections(data || []);
    setShowConnectOptions(true);
  };

  if (isLoading) {
    return <div>Loading connection status...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Google Sheets Integration</CardTitle>
        <p className="text-muted-foreground pt-2">
          Connect a Google Sheet to automatically send form submissions to a spreadsheet in real-time.
        </p>
      </CardHeader>
      <CardContent>
        {connection ? (
          <Card className="bg-muted/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <Sheet className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{connection.sheet_name}</p>
                    <a 
                      href={connection.sheet_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      View Sheet
                    </a>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDisconnect}>Disconnect</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed bg-transparent">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                  <div className="bg-muted p-4 rounded-full">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Not Connected</h3>
              <p className="text-muted-foreground mb-6">
                Connect a Google Sheet to get started.
              </p>
              <Button onClick={handleShowConnect}>
                <Plus className="mr-2 h-4 w-4" />
                Connect to Google Sheets
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={showConnectOptions} onOpenChange={setShowConnectOptions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect to Google Sheets</DialogTitle>
              <DialogDescription>
                Create a new sheet or link to an existing one. We recommend creating a new sheet for each form.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h4 className="font-semibold">Create a new Google Sheet</h4>
              <p className="text-sm text-muted-foreground">
                This will create a new sheet in your Google Drive named after your form.
              </p>
              <Button onClick={handleCreateAndConnect} disabled={isConnecting}>
                {isConnecting ? 'Creating...' : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create & Connect New Sheet
                  </>
                )}
              </Button>

              <Separator />

              <h4 className="font-semibold">Link to an existing sheet</h4>
              <p className="text-sm text-muted-foreground">
                Choose from sheets you've previously connected to your account.
              </p>
              {existingConnections.length > 0 ? (
                <Select onValueChange={setSelectedSheet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sheet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {existingConnections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.sheet_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground italic">No existing connections found. Connect one in your account settings.</p>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConnectOptions(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleLinkExisting} disabled={!selectedSheet || isConnecting}>
                {isConnecting ? 'Linking...' : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Link Selected Sheet
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
