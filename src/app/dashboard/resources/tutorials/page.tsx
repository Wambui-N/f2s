"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const tutorials = [
  {
    id: "getting-started",
    title: "Getting Started with ShelfCue",
    description: "Learn the basics of creating your first form and connecting it to Google Sheets",
    duration: "5:30",
    difficulty: "Beginner",
    views: "2.1k",
    rating: 4.8,
    thumbnail: "🎯",
    href: "#",
    featured: true,
  },
  {
    id: "form-builder",
    title: "Master the Form Builder",
    description: "Deep dive into all the form builder features and customization options",
    duration: "12:45",
    difficulty: "Intermediate",
    views: "1.8k",
    rating: 4.9,
    thumbnail: "🛠️",
    href: "#",
    featured: true,
  },
  {
    id: "google-sheets",
    title: "Google Sheets Integration",
    description: "Set up and manage your Google Sheets connection for automatic data sync",
    duration: "8:20",
    difficulty: "Beginner",
    views: "1.5k",
    rating: 4.7,
    thumbnail: "📊",
    href: "#",
    featured: false,
  },
  {
    id: "analytics",
    title: "Understanding Analytics",
    description: "Learn how to read and use your form analytics to improve performance",
    duration: "6:15",
    difficulty: "Intermediate",
    views: "1.2k",
    rating: 4.6,
    thumbnail: "📈",
    href: "#",
    featured: false,
  },
  {
    id: "advanced-features",
    title: "Advanced Features & Integrations",
    description: "Explore conditional logic, custom CSS, and third-party integrations",
    duration: "15:30",
    difficulty: "Advanced",
    views: "890",
    rating: 4.9,
    thumbnail: "⚡",
    href: "#",
    featured: false,
  },
  {
    id: "mobile-optimization",
    title: "Mobile Form Optimization",
    description: "Best practices for creating forms that work perfectly on mobile devices",
    duration: "7:45",
    difficulty: "Intermediate",
    views: "1.1k",
    rating: 4.8,
    thumbnail: "📱",
    href: "#",
    featured: false,
  },
];

const playlists = [
  {
    title: "Complete Beginner Course",
    description: "Everything you need to know to get started",
    videoCount: 8,
    totalDuration: "45 min",
    href: "#",
  },
  {
    title: "Advanced Techniques",
    description: "Pro tips and advanced features",
    videoCount: 6,
    totalDuration: "32 min",
    href: "#",
  },
  {
    title: "Integration Guides",
    description: "Connect ShelfCue with other tools",
    videoCount: 4,
    totalDuration: "28 min",
    href: "#",
  },
];

export default function TutorialsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Video Tutorials"
        description="Step-by-step video tutorials to help you master ShelfCue"
      />

      {/* Featured Tutorials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Tutorials</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {tutorials.filter(t => t.featured).map((tutorial) => (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{tutorial.thumbnail}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{tutorial.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tutorial.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {tutorial.rating}
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full bg-[#2c5e2a] hover:bg-[#234b21]">
                  <a href={tutorial.href}>
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Tutorials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Tutorials</h2>
        <div className="grid gap-4">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{tutorial.thumbnail}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{tutorial.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{tutorial.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {tutorial.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {tutorial.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={tutorial.href}>
                      <Play className="w-4 h-4 mr-2" />
                      Watch
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Playlists */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Learning Paths</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {playlists.map((playlist, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{playlist.title}</CardTitle>
                <p className="text-sm text-gray-600">{playlist.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Videos</span>
                    <span>{playlist.videoCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Duration</span>
                    <span>{playlist.totalDuration}</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <a href={playlist.href}>
                    Start Learning Path
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Need More Help?
            </h3>
            <p className="text-blue-700 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <a href="/dashboard/help">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Help Center
                </a>
              </Button>
              <Button asChild>
                <a href="/dashboard/support">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
