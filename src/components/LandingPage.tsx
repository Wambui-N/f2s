"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormBuilder } from "@/components/builder/FormBuilder";

export default function LandingPage() {
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return <FormBuilder onBack={() => setShowBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FormToSheets
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.open('/dashboard', '_blank')}>
                Dashboard
              </Button>
              <Button onClick={() => setShowBuilder(true)}>
                Get Beta Access
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Beta - No Auth Required
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Client Forms
              </span>
              <br />
              <span className="text-foreground">
                That Write to Google Sheets
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Perfect for consultants, coaches, photographers, and small businesses. 
              Create professional forms that automatically save client information to your Google Sheets. 
              No coding, no complex setup.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={() => setShowBuilder(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold px-8 py-4"
              >
                Create Your First Client Form
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg font-semibold px-8 py-4"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Demo Preview */}
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                      <h3 className="text-lg font-semibold mb-4">Client Consultation Form</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Business Coaching</option>
                            <option>Photography Session</option>
                            <option>Consulting</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Budget</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Under $500</option>
                            <option>$500 - $1,500</option>
                            <option>$1,500 - $3,000</option>
                            <option>$3,000+</option>
                          </select>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Book Consultation
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Built for Small Business Owners
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop losing client information in messy email threads. Capture leads, bookings, and inquiries 
              directly in your Google Sheets where you already manage your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Direct to Your Sheets</h3>
                <p className="text-muted-foreground">
                  Every form submission automatically appears in your Google Sheet. 
                  No copying, no manual data entry. Your client info is organized from day one.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Professional & Trustworthy</h3>
                <p className="text-muted-foreground">
                  Forms that match your brand and look professional on any device. 
                  Build trust with clients through polished, responsive design.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Works Anywhere</h3>
                <p className="text-muted-foreground">
                  Add forms to your website, share links, or embed anywhere. 
                  Perfect for capturing leads from social media, business cards, or email signatures.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Stop Losing Client Information?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join consultants, coaches, and small business owners who've simplified their client intake process.
            No signup required. Start in 2 minutes.
          </p>
          <Button
            onClick={() => setShowBuilder(true)}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold px-8 py-4"
          >
            Create Your Client Form Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">FormToSheets</h3>
          <p className="text-gray-400 mb-6">
            Beautiful forms that write directly to Google Sheets. No authentication required.
          </p>
          <div className="flex justify-center space-x-6">
            <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => window.open('/dashboard', '_blank')}>
              Dashboard
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Documentation
            </Button>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              © 2024 FormToSheets. Built for simplicity and speed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

