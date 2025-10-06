"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  BookOpen,
  Play,
  FileText,
  ExternalLink,
  ArrowRight,
  Star,
  Clock,
  Users,
} from "lucide-react";

const resources = [
  {
    id: "traffic-starter",
    title: "Traffic Starter Kit",
    description: "Complete guide to driving traffic to your forms and maximizing conversions",
    icon: <FileText className="w-6 h-6" />,
    type: "Guide",
    duration: "15 min read",
    difficulty: "Beginner",
    href: "/dashboard/resources/traffic-starter",
    featured: true,
  },
  {
    id: "tutorials",
    title: "Video Tutorials",
    description: "Step-by-step video tutorials to help you master ShelfCue",
    icon: <Play className="w-6 h-6" />,
    type: "Video",
    duration: "2-5 min each",
    difficulty: "All Levels",
    href: "/dashboard/resources/tutorials",
    featured: true,
  },
  {
    id: "best-practices",
    title: "Best Practices",
    description: "Proven strategies and tips from successful form creators",
    icon: <Star className="w-6 h-6" />,
    type: "Tips",
    duration: "10 min read",
    difficulty: "Intermediate",
    href: "/dashboard/resources/best-practices",
    featured: false,
  },
];

const quickLinks = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics in 5 minutes",
    href: "#",
    icon: <ArrowRight className="w-4 h-4" />,
  },
  {
    title: "Form Templates",
    description: "Ready-to-use form templates",
    href: "#",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    title: "API Documentation",
    description: "Integrate ShelfCue with your apps",
    href: "#",
    icon: <ExternalLink className="w-4 h-4" />,
  },
  {
    title: "Community Forum",
    description: "Connect with other users",
    href: "#",
    icon: <Users className="w-4 h-4" />,
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Learn how to get the most out of ShelfCue with our guides, tutorials, and best practices"
      />

      {/* Featured Resources */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Resources</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {resources.filter(r => r.featured).map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2c5e2a]/10 rounded-lg text-[#2c5e2a]">
                      {resource.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{resource.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <Button asChild className="w-full bg-[#2c5e2a] hover:bg-[#234b21]">
                  <Link href={resource.href}>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Resources */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Resources</h2>
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                      {resource.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {resource.duration}
                        </div>
                        <div className="text-xs text-gray-500">
                          {resource.difficulty}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={resource.href}>
                      View
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={link.href}>
                      {link.icon}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
