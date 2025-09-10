"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormBuilder } from '@/components/builder/FormBuilder';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Settings, 
  ExternalLink,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface FormData {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  submissions: number;
  status: 'draft' | 'published';
  lastSubmission?: Date;
}

export default function Dashboard() {
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);

  // Mock data for demonstration
  const [forms, setForms] = useState<FormData[]>([
    {
      id: '1',
      title: 'Client Consultation Form',
      description: 'Capture new client inquiries and project details',
      createdAt: new Date('2024-01-15'),
      submissions: 23,
      status: 'published',
      lastSubmission: new Date('2024-01-20')
    },
    {
      id: '2',
      title: 'Photography Booking Form',
      description: 'Book photography sessions and collect client preferences',
      createdAt: new Date('2024-01-10'),
      submissions: 8,
      status: 'published',
      lastSubmission: new Date('2024-01-19')
    },
    {
      id: '3',
      title: 'Event Planning Inquiry',
      description: 'Gather event details and budget information',
      createdAt: new Date('2024-01-12'),
      submissions: 0,
      status: 'draft'
    }
  ]);

  const totalSubmissions = forms.reduce((sum, form) => sum + form.submissions, 0);
  const publishedForms = forms.filter(form => form.status === 'published').length;
  const recentSubmissions = forms.filter(form => 
    form.lastSubmission && 
    (Date.now() - form.lastSubmission.getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length;

  const handleCreateForm = () => {
    setShowFormBuilder(true);
  };

  const handleEditForm = (form: FormData) => {
    setSelectedForm(form);
    setShowFormBuilder(true);
  };

  const handleDeleteForm = (formId: string) => {
    setForms(forms.filter(form => form.id !== formId));
  };

  const handleBackToDashboard = () => {
    setShowFormBuilder(false);
    setSelectedForm(null);
  };

  if (showFormBuilder) {
    return <FormBuilder onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your forms and track submissions
            </p>
          </div>
          <Button onClick={handleCreateForm} size="lg">
            <Plus size={20} className="mr-2" />
            Create New Form
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                  <p className="text-2xl font-bold">{forms.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{publishedForms}</p>
                </div>
                <ExternalLink className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{recentSubmissions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2" />
              Your Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first form to start collecting client information
                </p>
                <Button onClick={handleCreateForm}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Form
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{form.title}</h3>
                        <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                          {form.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {form.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Created {form.createdAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {form.submissions} submissions
                        </div>
                        {form.lastSubmission && (
                          <div className="flex items-center">
                            <TrendingUp size={14} className="mr-1" />
                            Last: {form.lastSubmission.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditForm(form)}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View detailed submission analytics and insights
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your Google Sheets integration
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <ExternalLink className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Help & Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help with forms and Google Sheets setup
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}