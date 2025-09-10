"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from './types';
import { RefreshCw, AlertTriangle, CheckCircle, ExternalLink, X } from 'lucide-react';

interface SheetMappingProps {
  fields: FormField[];
  sheetHeaders: string[];
  fieldMappings: Record<string, string>;
  onUpdateMappings: (mappings: Record<string, string>) => void;
  onSyncHeaders: () => void;
  sheetUrl?: string;
}

export function SheetMapping({ 
  fields, 
  sheetHeaders, 
  fieldMappings, 
  onUpdateMappings, 
  onSyncHeaders,
  sheetUrl 
}: SheetMappingProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncHeaders = async () => {
    setIsSyncing(true);
    try {
      await onSyncHeaders();
    } finally {
      setIsSyncing(false);
    }
  };

  const updateMapping = (fieldId: string, columnName: string) => {
    onUpdateMappings({
      ...fieldMappings,
      [fieldId]: columnName
    });
  };

  const getMappingStatus = (fieldId: string) => {
    const mapping = fieldMappings[fieldId];
    if (!mapping) return 'unmapped';
    if (sheetHeaders.includes(mapping)) return 'mapped';
    return 'invalid';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'invalid':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'mapped':
        return 'Mapped to sheet';
      case 'invalid':
        return 'Column not found';
      default:
        return 'Not mapped';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Google Sheets Mapping</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncHeaders}
              disabled={isSyncing}
            >
              <RefreshCw size={16} className={`mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Headers
            </Button>
            {sheetUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(sheetUrl, '_blank')}
              >
                <ExternalLink size={16} className="mr-1" />
                Open Sheet
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <div className="space-y-4">
          {sheetHeaders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No sheet headers found.</p>
              <p className="text-sm">Connect to your Google Sheet to see available columns.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Map form fields to Google Sheets columns. Data will be saved to the corresponding columns.
              </div>
              
              {fields.map((field) => {
                const status = getMappingStatus(field.id);
                const currentMapping = fieldMappings[field.id] || '';
                
                return (
                  <div key={field.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">{field.label}</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(status)}
                          <span className="text-sm text-muted-foreground">
                            {getStatusText(status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Select
                        value={currentMapping || undefined}
                        onValueChange={(value) => updateMapping(field.id, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {sheetHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={currentMapping}
                        onChange={(e) => updateMapping(field.id, e.target.value)}
                        placeholder="Or type column name"
                        className="flex-1"
                      />
                      
                      {currentMapping && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMapping(field.id, '')}
                          className="h-10 w-10 p-0"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
