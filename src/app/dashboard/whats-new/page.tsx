"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import {
  Megaphone,
  Sparkles,
  Zap,
  Shield,
  Palette,
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  ArrowRight,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

function WhatsNewContent() {
  const router = useRouter();

  const updates = [
    {
      version: "2.3.0",
      date: "March 15, 2024",
      type: "major",
      title: "Enhanced Form Builder & Real-time Collaboration",
      description: "Major improvements to the form building experience with new collaboration features",
      features: [
        {
          title: "Real-time Collaboration",
          description: "Multiple team members can now edit forms simultaneously",
          icon: <Users className="w-4 h-4" />,
          type: "new"
        },
        {
          title: "Advanced Form Logic",
          description: "Create complex conditional logic with multiple conditions",
          icon: <Zap className="w-4 h-4" />,
          type: "new"
        },
        {
          title: "Custom CSS Support",
          description: "Add custom CSS to make your forms truly unique",
          icon: <Palette className="w-4 h-4" />,
          type: "new"
        },
        {
          title: "Performance Improvements",
          description: "50% faster form loading and submission processing",
          icon: <Sparkles className="w-4 h-4" />,
          type: "improvement"
        }
      ],
      isLatest: true
    },
    {
      version: "2.2.5",
      date: "March 8, 2024",
      type: "minor",
      title: "Google Sheets Integration Enhancements",
      description: "Improved reliability and new features for Google Sheets sync",
      features: [
        {
          title: "Bulk Data Sync",
          description: "Sync large amounts of historical data to Google Sheets",
          icon: <BarChart3 className="w-4 h-4" />,
          type: "new"
        },
        {
          title: "Connection Health Monitoring",
          description: "Real-time monitoring of Google Sheets connection status",
          icon: <Shield className="w-4 h-4" />,
          type: "improvement"
        },
        {
          title: "Auto-reconnect Feature",
          description: "Automatically reconnect when Google Sheets tokens expire",
          icon: <Settings className="w-4 h-4" />,
          type: "improvement"
        }
      ],
      isLatest: false
    },
    {
      version: "2.2.0",
      date: "February 28, 2024",
      type: "major",
      title: "Analytics Dashboard & Form Templates",
      description: "New analytics insights and pre-built form templates",
      features: [
        {
          title: "Analytics Dashboard",
          description: "Comprehensive analytics with conversion tracking",
          icon: <BarChart3 className="w-4 h-4" />,
          type: "new"
        },
        {
          title: "Form Templates Library",
          description: "20+ professional form templates for different industries",
          icon: <Sparkles className="w-4 h-4" />,
          type: "new"
        },
        {
          title: "Mobile Responsiveness",
          description: "All forms are now fully optimized for mobile devices",
          icon: <Settings className="w-4 h-4" />,
          type: "improvement"
        }
      ],
      isLatest: false
    },
    {
      version: "2.1.8",
      date: "February 20, 2024",
      type: "patch",
      title: "Bug Fixes & Security Updates",
      description: "Important security patches and bug fixes",
      features: [
        {
          title: "Security Enhancements",
          description: "Enhanced data encryption and security protocols",
          icon: <Shield className="w-4 h-4" />,
          type: "security"
        },
        {
          title: "Form Validation Fixes",
          description: "Resolved issues with email and phone number validation",
          icon: <CheckCircle className="w-4 h-4" />,
          type: "fix"
        },
        {
          title: "Performance Optimizations",
          description: "Reduced page load times by 30%",
          icon: <Sparkles className="w-4 h-4" />,
          type: "improvement"
        }
      ],
      isLatest: false
    }
  ];

  const upcomingFeatures = [
    {
      title: "AI Form Builder",
      description: "Generate forms automatically using AI based on your requirements",
      eta: "Q2 2024",
      status: "in_development"
    },
    {
      title: "Advanced Integrations",
      description: "Connect with Slack, Discord, Zapier, and 50+ other tools",
      eta: "Q2 2024",
      status: "planned"
    },
    {
      title: "White-label Solution",
      description: "Complete white-label solution for agencies and enterprises",
      eta: "Q3 2024",
      status: "planned"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'minor': return 'bg-green-100 text-green-700 border-green-200';
      case 'patch': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getFeatureTypeColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'improvement': return 'bg-green-100 text-green-700';
      case 'fix': return 'bg-yellow-100 text-yellow-700';
      case 'security': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
      <PageHeader
        title="What's New"
        description="Stay up to date with the latest features, improvements, and updates to FormToSheets"
        backButton={{
          onClick: () => router.push("/dashboard"),
          label: "Back to Dashboard"
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Release Notes
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Feature Requests
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Megaphone className="w-4 h-4 mr-2" />
                Product Roadmap
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingFeatures.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {feature.eta}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                  <Badge 
                    className={`text-xs ${
                      feature.status === 'in_development' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {feature.status === 'in_development' ? 'In Development' : 'Planned'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {updates.map((update, index) => (
            <Card key={index} className={`shadow-lg ${update.isLatest ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Badge className={`border ${getTypeColor(update.type)}`}>
                      v{update.version}
                    </Badge>
                    <Badge className={`border ${getTypeColor(update.type)}`}>
                      {update.type}
                    </Badge>
                    {update.isLatest && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Latest
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {update.date}
                  </div>
                </div>
                <CardTitle className="text-xl">{update.title}</CardTitle>
                <p className="text-muted-foreground">{update.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {update.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-white border">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{feature.title}</h4>
                          <Badge className={`text-xs ${getFeatureTypeColor(feature.type)}`}>
                            {feature.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More */}
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Want to see older updates?</p>
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                Load More Updates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function WhatsNewPage() {
  return <WhatsNewContent />;
}
