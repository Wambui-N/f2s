"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormBuilder } from "@/components/builder/FormBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Zap, 
  Shield, 
  Users,
  Star,
  Play,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && shouldRedirect && !loading) {
      setShouldRedirect(false);
      router.push("/dashboard");
    }
  }, [user, shouldRedirect, loading, router]);

  const handleGetStarted = async () => {
    if (user) {
      router.push("/dashboard");
    } else {
      try {
        setShouldRedirect(true);
        await signInWithGoogle();
      } catch (error) {
        console.error("Failed to sign in:", error);
        setShouldRedirect(false);
      }
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  if (showBuilder) {
    return <FormBuilder onBack={() => setShowBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FormToSheets
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("pricing")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reviews
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="btn-primary"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleGetStarted}
                    disabled={loading}
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleGetStarted} 
                    disabled={loading}
                    className="btn-primary"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => scrollToSection("features")}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  Reviews
                </button>
                <div className="pt-4 space-y-2">
                  {user ? (
                    <Button 
                      onClick={() => router.push("/dashboard")}
                      className="w-full btn-primary"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleGetStarted}
                        disabled={loading}
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={handleGetStarted} 
                        disabled={loading}
                        className="w-full btn-primary"
                      >
                        Get Started Free
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <Badge 
              variant="secondary" 
              className="mb-8 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Trusted by 10,000+ businesses worldwide
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-slide-up">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Beautiful Forms
              </span>
              <br />
              <span className="text-foreground">
                Meet Google Sheets
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up">
              Create stunning, professional forms that automatically sync with Google Sheets. 
              Perfect for consultants, coaches, and small businesses who want to impress clients 
              while staying organized.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="btn-primary text-lg font-semibold px-8 py-4 group"
                disabled={loading}
              >
                {user ? "Go to Dashboard" : "Start Building Forms"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg font-semibold px-8 py-4 btn-secondary group"
                onClick={() => scrollToSection("demo")}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Demo Preview */}
      <section id="demo" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch how easy it is to create professional forms that automatically 
              sync with your Google Sheets
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden shadow-2xl card-glass">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm ml-4">FormToSheets Builder</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-8 shadow-xl">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Form Preview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-6 text-center">
                          Client Consultation Form
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="John Smith"
                              value="John Smith"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address *
                            </label>
                            <input 
                              type="email" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="john@example.com"
                              value="john@example.com"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Service Needed
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                              <option>Business Coaching</option>
                              <option>Strategy Consulting</option>
                              <option>Marketing Consulting</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Project Budget
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                              <option>$1,500 - $3,000</option>
                              <option>$3,000+</option>
                            </select>
                          </div>
                          <Button className="w-full btn-primary">
                            Book Consultation
                          </Button>
                        </div>
                      </div>
                      
                      {/* Google Sheets Preview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-6 text-center">
                          Your Google Sheet (Live)
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-green-700 font-medium">Real-time sync active</span>
                          </div>
                          
                          <div className="bg-white rounded border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium">Name</th>
                                  <th className="px-3 py-2 text-left font-medium">Email</th>
                                  <th className="px-3 py-2 text-left font-medium">Service</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t">
                                  <td className="px-3 py-2">John Smith</td>
                                  <td className="px-3 py-2">john@example.com</td>
                                  <td className="px-3 py-2">Business Coaching</td>
                                </tr>
                                <tr className="border-t bg-blue-50 animate-pulse">
                                  <td className="px-3 py-2 text-blue-600 font-medium">New submission...</td>
                                  <td className="px-3 py-2"></td>
                                  <td className="px-3 py-2"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Why Choose FormToSheets
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Modern Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop losing leads in email threads. Capture, organize, and act on client 
              information with forms that work as hard as you do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Real-time Google Sheets Sync",
                description: "Every form submission instantly appears in your Google Sheet. No delays, no manual copying, no lost data.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Beautiful by Default",
                description: "Professional, mobile-first forms that build trust with your clients. No ugly Google Forms styling.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Bank-level encryption, GDPR compliance, and secure data handling. Your client data is always protected.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Team Collaboration",
                description: "Share forms with your team, manage permissions, and collaborate on client data in real-time.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "Smart Validation",
                description: "Built-in form validation, conditional logic, and data quality checks ensure clean, accurate submissions.",
                color: "from-teal-500 to-teal-600"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Premium Support",
                description: "Get help when you need it with our responsive support team and comprehensive documentation.",
                color: "from-pink-500 to-pink-600"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 card-interactive border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Simple, Transparent Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">Free</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Up to 3 forms</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>100 submissions/month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Google Sheets integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Basic templates</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    className="w-full btn-secondary"
                    disabled={loading}
                  >
                    Get Started Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Unlimited forms</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Unlimited submissions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Advanced conditional logic</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Custom branding</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>File uploads to Google Drive</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    className="w-full btn-primary"
                    disabled={loading}
                  >
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Everything in Professional</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>White-label solution</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>Dedicated support</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    className="w-full btn-secondary"
                    disabled={loading}
                  >
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Customer Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how FormToSheets is helping businesses streamline their client intake process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Business Coach",
                company: "Growth Strategies Inc.",
                content: "FormToSheets transformed how I handle client intake. What used to take hours of manual data entry now happens automatically. My clients love the professional forms, and I love having everything organized in Google Sheets.",
                rating: 5,
                avatar: "SC"
              },
              {
                name: "Michael Rodriguez",
                role: "Wedding Photographer",
                company: "Rodriguez Photography",
                content: "The booking forms look amazing and match my brand perfectly. Clients can upload inspiration photos directly, and everything syncs to my Google Drive. It's like having a personal assistant for my business.",
                rating: 5,
                avatar: "MR"
              },
              {
                name: "Emily Watson",
                role: "Marketing Consultant",
                company: "Watson Digital",
                content: "I've tried every form builder out there. FormToSheets is the only one that truly understands how small businesses work. The Google Sheets integration is flawless, and setup took literally 2 minutes.",
                rating: 5,
                avatar: "EW"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 card-interactive">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-sm text-blue-600">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've streamlined their client intake process. 
            Start building beautiful forms in minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold px-8 py-4 group shadow-xl"
              disabled={loading}
            >
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg font-semibold px-8 py-4 border-white/30 text-white hover:bg-white/10"
              onClick={() => scrollToSection("demo")}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          <p className="text-blue-200 mt-6 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FormToSheets
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Transform any form submission into organized Google Sheets automatically. 
                Built for professionals who value their time and their clients' experience.
              </p>
              <div className="flex space-x-4">
                {/* Social Links */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("demo")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Demo
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Status Page
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 FormToSheets. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <ChevronDown className="w-5 h-5 mx-auto rotate-180" />
      </button>
    </div>
  );
}