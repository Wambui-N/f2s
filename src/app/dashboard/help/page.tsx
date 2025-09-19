"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  BookOpen,
  Search,
  ExternalLink,
  Play,
  FileText,
  Zap,
  Settings,
  Users,
  MessageCircle,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

function HelpContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const quickStartGuides = [
    {
      title: "Create Your First Form",
      description: "Learn how to build and publish your first form in under 5 minutes",
      duration: "5 min read",
      icon: <FileText className="w-5 h-5" />,
      popular: true
    },
    {
      title: "Connect Google Sheets",
      description: "Set up automatic data sync with Google Sheets",
      duration: "3 min read", 
      icon: <Zap className="w-5 h-5" />,
      popular: true
    },
    {
      title: "Customize Form Design",
      description: "Make your forms match your brand with custom styling",
      duration: "7 min read",
      icon: <Settings className="w-5 h-5" />,
      popular: false
    },
    {
      title: "Manage Form Submissions",
      description: "View, export, and organize your form responses",
      duration: "4 min read",
      icon: <Users className="w-5 h-5" />,
      popular: false
    }
  ];

  const videoTutorials = [
    {
      title: "FormToSheets Overview",
      description: "Get a complete overview of all features and capabilities",
      duration: "8:32",
      thumbnail: "/api/placeholder/320/180",
      views: "2.1K"
    },
    {
      title: "Advanced Form Builder",
      description: "Learn advanced techniques for building complex forms",
      duration: "12:45",
      thumbnail: "/api/placeholder/320/180",
      views: "1.8K"
    },
    {
      title: "Google Sheets Integration",
      description: "Deep dive into Google Sheets integration and automation",
      duration: "6:21",
      thumbnail: "/api/placeholder/320/180",
      views: "3.2K"
    }
  ];

  const faqItems = [
    {
      question: "How many forms can I create?",
      answer: "Free plan allows 3 forms, Pro plan allows unlimited forms.",
      category: "Billing"
    },
    {
      question: "Can I customize the form design?",
      answer: "Yes, you can customize colors, fonts, and layout to match your brand.",
      category: "Design"
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade encryption and comply with GDPR standards.",
      category: "Security"
    },
    {
      question: "How does Google Sheets sync work?",
      answer: "Data syncs automatically in real-time when someone submits your form.",
      category: "Integration"
    }
  ];

  const categories = [
    { name: "Getting Started", count: 12, icon: <BookOpen className="w-5 h-5" /> },
    { name: "Form Builder", count: 8, icon: <FileText className="w-5 h-5" /> },
    { name: "Integrations", count: 6, icon: <Zap className="w-5 h-5" /> },
    { name: "Account & Billing", count: 4, icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
      <PageHeader
        title="Help Center"
        description="Find answers, tutorials, and guides to get the most out of FormToSheets"
        backButton={{
          onClick: () => router.push("/dashboard"),
          label: "Back to Dashboard"
        }}
      />

      {/* Search Bar */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Browse by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50"
                >
                  {category.icon}
                  <span className="ml-3 flex-1 text-left">{category.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/support')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Community Forum
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Start Guides */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Zap className="mr-3 h-5 w-5 text-blue-500" />
                Quick Start Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickStartGuides.map((guide, index) => (
                  <Card key={index} className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${guide.popular ? 'ring-1 ring-blue-200 bg-blue-50/30' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          {guide.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{guide.title}</h3>
                            {guide.popular && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{guide.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {guide.duration}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Play className="mr-3 h-5 w-5 text-red-500" />
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videoTutorials.map((video, index) => (
                  <Card key={index} className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
                    <div className="relative">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                        {video.duration}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                      <p className="text-xs text-muted-foreground">{video.views} views</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageCircle className="mr-3 h-5 w-5 text-green-500" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((faq, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{faq.question}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function HelpPage() {
  return <HelpContent />;
}
