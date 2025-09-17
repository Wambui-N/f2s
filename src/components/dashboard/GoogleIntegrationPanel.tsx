"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GoogleConnectButton } from "@/components/auth/GoogleConnectButton";
import { supabase } from "@/lib/supabase";
import {
  Chrome,
  FileSpreadsheet,
  FolderOpen,
  Calendar,
  Unlink,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface GoogleResource {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
}

interface GoogleIntegrationState {
  isConnected: boolean;
  spreadsheets: GoogleResource[];
  folders: GoogleResource[];
  calendars: GoogleResource[];
  selectedSpreadsheet?: string;
  selectedFolder?: string;
  selectedCalendar?: string;
  loading: {
    spreadsheets: boolean;
    folders: boolean;
    calendars: boolean;
  };
}

export function GoogleIntegrationPanel() {
  const [state, setState] = useState<GoogleIntegrationState>({
    isConnected: false,
    spreadsheets: [],
    folders: [],
    calendars: [],
    loading: {
      spreadsheets: false,
      folders: false,
      calendars: false,
    },
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Check if user has Google tokens stored
        const { data: tokens } = await supabase
          .from("user_google_tokens")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (tokens) {
          setState((prev) => ({ ...prev, isConnected: true }));
          loadGoogleResources();
        }
      }
    } catch (error) {
      console.error("Error checking Google connection:", error);
    }
  };

  const loadGoogleResources = async () => {
    await Promise.all([loadSpreadsheets(), loadFolders(), loadCalendars()]);
  };

  const loadSpreadsheets = async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, spreadsheets: true },
    }));

    try {
      const response = await fetch("/api/google/spreadsheets");
      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          spreadsheets: data.spreadsheets,
          loading: { ...prev.loading, spreadsheets: false },
        }));
      }
    } catch (error) {
      console.error("Error loading spreadsheets:", error);
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, spreadsheets: false },
      }));
    }
  };

  const loadFolders = async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, folders: true },
    }));

    try {
      const response = await fetch("/api/google/folders");
      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          folders: data.folders,
          loading: { ...prev.loading, folders: false },
        }));
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, folders: false },
      }));
    }
  };

  const loadCalendars = async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, calendars: true },
    }));

    try {
      const response = await fetch("/api/google/calendars");
      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          calendars: data.calendars,
          loading: { ...prev.loading, calendars: false },
        }));
      }
    } catch (error) {
      console.error("Error loading calendars:", error);
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, calendars: false },
      }));
    }
  };

  const createNewSpreadsheet = async () => {
    try {
      const name = prompt("Enter spreadsheet name:");
      if (!name) return;

      const response = await fetch("/api/google/spreadsheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        await loadSpreadsheets();
        setState((prev) => ({
          ...prev,
          selectedSpreadsheet: data.spreadsheet.spreadsheetId,
        }));
      }
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
    }
  };

  const createNewFolder = async () => {
    try {
      const name = prompt("Enter folder name:");
      if (!name) return;

      const response = await fetch("/api/google/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        await loadFolders();
        setState((prev) => ({
          ...prev,
          selectedFolder: data.folder.id,
        }));
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const disconnectGoogle = async () => {
    try {
      if (
        !confirm("Are you sure you want to disconnect your Google account?")
      ) {
        return;
      }

      // Remove tokens from database
      if (user) {
        await supabase
          .from("user_google_tokens")
          .delete()
          .eq("user_id", user.id);
      }

      // Reset state
      setState({
        isConnected: false,
        spreadsheets: [],
        folders: [],
        calendars: [],
        loading: {
          spreadsheets: false,
          folders: false,
          calendars: false,
        },
      });
    } catch (error) {
      console.error("Error disconnecting Google:", error);
    }
  };

  if (!state.isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Chrome className="w-5 h-5" />
            <span>Google Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your Google account to enable automatic form submissions to
            Google Sheets, file uploads to Google Drive, and calendar event
            creation.
          </p>

          <div className="space-y-2">
            <h4 className="font-medium">Permissions needed:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Read and write Google Sheets</li>
              <li>• Upload files to Google Drive</li>
              <li>• Create calendar events</li>
            </ul>
          </div>

          <GoogleConnectButton
            onSuccess={() => {
              setState((prev) => ({ ...prev, isConnected: true }));
              loadGoogleResources();
            }}
            onError={(error) => {
              console.error("Google connection error:", error);
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Chrome className="w-5 h-5" />
              <span>Google Integration</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectGoogle}
              className="text-red-600 hover:text-red-700"
            >
              <Unlink className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your Google account is connected and ready to use with your forms.
          </p>
        </CardContent>
      </Card>

      {/* Google Sheets Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Google Sheets</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSpreadsheets}
                disabled={state.loading.spreadsheets}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${state.loading.spreadsheets ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewSpreadsheet}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Spreadsheet</label>
              <Select
                value={state.selectedSpreadsheet}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, selectedSpreadsheet: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a spreadsheet..." />
                </SelectTrigger>
                <SelectContent>
                  {state.spreadsheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.id}>
                      {sheet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state.selectedSpreadsheet && (
              <div className="text-sm text-muted-foreground">
                Form submissions will be automatically added to this
                spreadsheet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>Google Drive</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadFolders}
                disabled={state.loading.folders}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${state.loading.folders ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={createNewFolder}>
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Folder</label>
              <Select
                value={state.selectedFolder}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, selectedFolder: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a folder..." />
                </SelectTrigger>
                <SelectContent>
                  {state.folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state.selectedFolder && (
              <div className="text-sm text-muted-foreground">
                File uploads from forms will be saved to this folder.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Google Calendar</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCalendars}
              disabled={state.loading.calendars}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${state.loading.calendars ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Calendar</label>
              <Select
                value={state.selectedCalendar}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, selectedCalendar: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a calendar..." />
                </SelectTrigger>
                <SelectContent>
                  {state.calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state.selectedCalendar && (
              <div className="text-sm text-muted-foreground">
                Calendar events will be created in this calendar when forms
                include date/time fields.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
