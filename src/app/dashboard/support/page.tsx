"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

function SupportContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "",
    message: "",
    email: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Support ticket submitted:", formData);
  };

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Mon-Fri, 9AM-6PM EST",
      responseTime: "< 2 minutes",
      icon: <MessageCircle className="w-6 h-6" />,
      action: "Start Chat",
      available: true,
      popular: true
    },
    {
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      availability: "24/7",
      responseTime: "< 4 hours",
      icon: <Mail className="w-6 h-6" />,
      action: "Send Email",
      available: true,
      popular: false
    },
    {
      title: "Phone Support",
      description: "Talk directly with our technical experts",
      availability: "Mon-Fri, 9AM-6PM EST",
      responseTime: "Schedule call",
      icon: <Phone className="w-6 h-6" />,
      action: "Schedule Call",
      available: false,
      popular: false
    }
  ];

  const recentTickets = [
    {
      id: "#12345",
      subject: "Google Sheets connection issue",
      status: "resolved",
      created: "2 days ago",
      updated: "1 day ago"
    },
    {
      id: "#12344",
      subject: "Form styling question",
      status: "in_progress",
      created: "5 days ago",
      updated: "3 hours ago"
    },
    {
      id: "#12343",
      subject: "Billing inquiry",
      status: "closed",
      created: "1 week ago",
      updated: "1 week ago"
    }
  ];

  const quickHelp = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of FormToSheets",
      icon: <BookOpen className="w-5 h-5" />,
      link: "/dashboard/help"
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: <Users className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "API Documentation",
      description: "Technical integration guides",
      icon: <Zap className="w-5 h-5" />,
      link: "#"
    }
  ];

  return (
    <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
      <PageHeader
        title="Contact Support"
        description="Get help from our expert support team or find answers in our resources"
        backButton={{
          onClick: () => router.push("/dashboard"),
          label: "Back to Dashboard"
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Options */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Contact Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportOptions.map((option, index) => (
                <Card key={index} className={`cursor-pointer transition-all hover:shadow-md ${option.popular ? 'ring-1 ring-blue-200 bg-blue-50/30' : ''} ${!option.available ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{option.title}</h3>
                          {option.popular && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Popular
                            </Badge>
                          )}
                          {!option.available && (
                            <Badge variant="secondary" className="text-xs">
                              Pro Only
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {option.availability}
                          </div>
                          <p className="text-xs text-green-600">Response: {option.responseTime}</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className={`w-full mt-3 ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!option.available}
                      variant={option.popular ? "default" : "outline"}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickHelp.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50"
                  onClick={() => item.link.startsWith('/') ? router.push(item.link) : window.open(item.link)}
                >
                  {item.icon}
                  <div className="ml-3 text-left">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Support Form and Tickets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Support Ticket */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Send className="mr-3 h-5 w-5" />
                Create Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Account</SelectItem>
                        <SelectItem value="integration">Google Sheets Integration</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="mt-2 min-h-[120px]"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageCircle className="mr-3 h-5 w-5" />
                Your Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTickets.length > 0 ? (
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <Card key={ticket.id} className="border hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                            <Badge 
                              variant={
                                ticket.status === 'resolved' ? 'default' : 
                                ticket.status === 'in_progress' ? 'secondary' : 
                                'outline'
                              }
                              className={
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }
                            >
                              {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            {ticket.status === 'resolved' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                        <h3 className="font-medium mb-2">{ticket.subject}</h3>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Created: {ticket.created}</span>
                          <span>Updated: {ticket.updated}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No support tickets yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function SupportPage() {
  return <SupportContent />;
}
