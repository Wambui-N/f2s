"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Target,
  Share2,
  BarChart3,
  Users,
  Mail,
} from "lucide-react";

const sections = [
  {
    title: "1. Optimize Your Form Design",
    icon: <Target className="w-5 h-5" />,
    tips: [
      "Keep forms short and focused - only ask for essential information",
      "Use clear, action-oriented button text like 'Get Started' instead of 'Submit'",
      "Add social proof or testimonials near your form",
      "Use contrasting colors to make your CTA button stand out",
      "Test different form layouts on mobile devices"
    ]
  },
  {
    title: "2. Strategic Form Placement",
    icon: <Share2 className="w-5 h-5" />,
    tips: [
      "Place forms above the fold on your landing pages",
      "Use exit-intent popups to capture leaving visitors",
      "Add forms to your blog posts and resource pages",
      "Include forms in your email signature",
      "Create dedicated landing pages for specific campaigns"
    ]
  },
  {
    title: "3. Drive Targeted Traffic",
    icon: <Users className="w-5 h-5" />,
    tips: [
      "Share forms on relevant social media platforms",
      "Include forms in your email newsletters",
      "Partner with complementary businesses for cross-promotion",
      "Use Google Ads to target specific keywords",
      "Create valuable content that naturally leads to your form"
    ]
  },
  {
    title: "4. Track and Optimize",
    icon: <BarChart3 className="w-5 h-5" />,
    tips: [
      "Monitor your form analytics in the ShelfCue dashboard",
      "A/B test different form headlines and descriptions",
      "Track conversion rates by traffic source",
      "Use heatmaps to see where users drop off",
      "Regularly review and update your forms based on data"
    ]
  }
];

const quickWins = [
  "Add a form to your website footer",
  "Create a simple 'Contact Us' form",
  "Set up a newsletter signup form",
  "Add forms to your social media bio links",
  "Include forms in your email campaigns"
];

export default function TrafficStarterPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Traffic Starter Kit"
        description="Complete guide to driving traffic to your forms and maximizing conversions"
      />

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This guide will help you drive more traffic to your forms and increase your conversion rates. 
            Follow these proven strategies to get more leads and grow your business.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Pro Tip:</strong> Start with one strategy and master it before moving to the next. 
              Consistency is key to success!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-[#2c5e2a]/10 rounded-lg text-[#2c5e2a]">
                  {section.icon}
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Wins */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Quick Wins (Start Here!)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            These are simple actions you can take today to start getting more form submissions:
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {quickWins.map((win, index) => (
              <div key={index} className="flex items-center gap-2 text-green-800">
                <ArrowRight className="w-4 h-4" />
                <span>{win}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to put these strategies into action? Here's what to do next:
            </p>
            <ol className="space-y-2 list-decimal list-inside text-gray-700">
              <li>Create your first form using our form builder</li>
              <li>Choose one traffic strategy from above and implement it</li>
              <li>Set up analytics to track your results</li>
              <li>Test and optimize based on your data</li>
              <li>Scale successful strategies and try new ones</li>
            </ol>
            <div className="pt-4">
              <a 
                href="/dashboard/forms" 
                className="inline-flex items-center gap-2 text-[#2c5e2a] hover:text-[#234b21] font-medium"
              >
                Create Your First Form
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
