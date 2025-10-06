"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  Users,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const bestPractices = [
  {
    category: "Form Design",
    icon: <Target className="w-5 h-5" />,
    practices: [
      {
        title: "Keep forms short and focused",
        description: "Only ask for essential information. Every extra field reduces conversion rates by 5-10%.",
        type: "do",
      },
      {
        title: "Use clear, action-oriented labels",
        description: "Instead of 'Name', use 'Full Name'. Instead of 'Email', use 'Email Address'.",
        type: "do",
      },
      {
        title: "Make your CTA button stand out",
        description: "Use contrasting colors and action words like 'Get Started' or 'Join Now'.",
        type: "do",
      },
      {
        title: "Don't use generic placeholder text",
        description: "Avoid 'Enter your information here' - be specific about what you want.",
        type: "dont",
      },
    ],
  },
  {
    category: "User Experience",
    icon: <Users className="w-5 h-5" />,
    practices: [
      {
        title: "Test on mobile devices",
        description: "Over 60% of form submissions come from mobile. Always test your forms on phones and tablets.",
        type: "do",
      },
      {
        title: "Show progress for long forms",
        description: "Use progress bars or step indicators to show users how much is left.",
        type: "do",
      },
      {
        title: "Provide clear error messages",
        description: "Tell users exactly what went wrong and how to fix it.",
        type: "do",
      },
      {
        title: "Don't make fields required unless necessary",
        description: "Every required field is a barrier to conversion. Only require truly essential information.",
        type: "dont",
      },
    ],
  },
  {
    category: "Conversion Optimization",
    icon: <BarChart3 className="w-5 h-5" />,
    practices: [
      {
        title: "Add social proof near your form",
        description: "Show testimonials, user counts, or trust badges to build credibility.",
        type: "do",
      },
      {
        title: "Use exit-intent popups",
        description: "Capture visitors who are about to leave with a compelling offer.",
        type: "do",
      },
      {
        title: "A/B test different headlines",
        description: "Test variations like 'Get Started' vs 'Join 10,000+ Users' to see what converts better.",
        type: "do",
      },
      {
        title: "Don't ask for sensitive information upfront",
        description: "Avoid asking for credit card info, SSN, or other sensitive data unless absolutely necessary.",
        type: "dont",
      },
    ],
  },
  {
    category: "Technical Best Practices",
    icon: <Zap className="w-5 h-5" />,
    practices: [
      {
        title: "Set up proper analytics tracking",
        description: "Track form views, conversion rates, and drop-off points to optimize performance.",
        type: "do",
      },
      {
        title: "Use HTTPS for all forms",
        description: "Security is crucial for user trust. Always use secure connections.",
        type: "do",
      },
      {
        title: "Implement proper validation",
        description: "Validate email formats, phone numbers, and other data on both client and server side.",
        type: "do",
      },
      {
        title: "Don't ignore form performance",
        description: "Slow-loading forms have lower conversion rates. Optimize images and minimize JavaScript.",
        type: "dont",
      },
    ],
  },
];

const quickTips = [
  "Use single-column layouts for better mobile experience",
  "Place important fields above the fold",
  "Use autocomplete for common fields like email and phone",
  "Include a privacy policy link near your form",
  "Test your form with real users, not just yourself",
  "Use conditional logic to show/hide fields based on user input",
  "Send confirmation emails after form submission",
  "Follow up with users who don't complete the form",
];

export default function BestPracticesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Best Practices"
        description="Proven strategies and tips from successful form creators"
      />

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Why Best Practices Matter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Following these best practices can increase your form conversion rates by 20-50%. 
            These tips come from analyzing thousands of successful forms and A/B tests.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Pro Tip:</strong> Don't try to implement everything at once. 
              Pick 2-3 practices that apply to your situation and test them first.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices by Category */}
      <div className="space-y-8">
        {bestPractices.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="p-2 bg-[#2c5e2a]/10 rounded-lg text-[#2c5e2a]">
                {category.icon}
              </div>
              {category.category}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {category.practices.map((practice, practiceIndex) => (
                <Card key={practiceIndex} className={`${
                  practice.type === 'do' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {practice.type === 'do' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className={`font-semibold mb-1 ${
                          practice.type === 'do' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {practice.title}
                        </h3>
                        <p className={`text-sm ${
                          practice.type === 'do' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {practice.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="w-5 h-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Here are some quick wins you can implement right away:
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {quickTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-blue-800">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Implement These Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to improve your forms? Follow this step-by-step approach:
            </p>
            <ol className="space-y-3 list-decimal list-inside text-gray-700">
              <li>
                <strong>Audit your current forms:</strong> Review existing forms against these best practices
              </li>
              <li>
                <strong>Pick your priorities:</strong> Choose 2-3 practices that will have the biggest impact
              </li>
              <li>
                <strong>Test before implementing:</strong> Use A/B testing to validate changes
              </li>
              <li>
                <strong>Measure results:</strong> Track conversion rates before and after changes
              </li>
              <li>
                <strong>Iterate and improve:</strong> Continue testing and optimizing based on data
              </li>
            </ol>
            <div className="pt-4">
              <a 
                href="/dashboard/forms" 
                className="inline-flex items-center gap-2 text-[#2c5e2a] hover:text-[#234b21] font-medium"
              >
                Start Improving Your Forms
                <Shield className="w-4 h-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
