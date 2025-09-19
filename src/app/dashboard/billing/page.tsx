"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  Crown,
  Zap,
  Users,
  FileText,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

function BillingContent() {
  const router = useRouter();
  const [currentPlan] = useState("pro"); // Mock current plan

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 forms",
        "100 submissions/month",
        "Basic Google Sheets integration",
        "Email support"
      ],
      current: currentPlan === "free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Best for growing businesses",
      features: [
        "Unlimited forms",
        "10,000 submissions/month",
        "Advanced Google Sheets integration",
        "Custom branding",
        "Priority support",
        "Advanced analytics"
      ],
      current: currentPlan === "pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Unlimited submissions",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced security"
      ],
      current: currentPlan === "enterprise",
      popular: false
    }
  ];

  const invoices = [
    {
      id: "INV-001",
      date: "2024-01-01",
      amount: "$19.00",
      status: "paid",
      downloadUrl: "#"
    },
    {
      id: "INV-002",
      date: "2024-02-01",
      amount: "$19.00",
      status: "paid",
      downloadUrl: "#"
    },
    {
      id: "INV-003",
      date: "2024-03-01",
      amount: "$19.00",
      status: "pending",
      downloadUrl: "#"
    }
  ];

  return (
    <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription, view invoices, and upgrade your plan"
        backButton={{
          onClick: () => router.push("/dashboard"),
          label: "Back to Dashboard"
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-3 h-5 w-5 text-yellow-500" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                  <Crown className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">$19<span className="text-sm text-muted-foreground">/month</span></p>
                <Badge className="mt-2 bg-green-100 text-green-700">Active</Badge>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Forms Created</span>
                  <span className="font-medium">12 / ∞</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Submissions This Month</span>
                  <span className="font-medium">1,247 / 10,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Next Billing Date</span>
                  <span className="font-medium">Mar 15, 2024</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-3 h-5 w-5" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{invoice.amount}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Zap className="mr-3 h-5 w-5" />
                Available Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${plan.current ? 'bg-blue-50 border-blue-200' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        className={`w-full ${plan.current ? 'bg-gray-400 cursor-not-allowed' : plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Current Plan' : plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                        {!plan.current && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Analytics */}
          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-3 h-5 w-5" />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Active Forms</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-muted-foreground">Submissions This Month</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return <BillingContent />;
}
