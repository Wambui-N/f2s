"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Eye,
  MousePointer,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserAnalytics, getFormAnalytics } from "@/lib/analytics";

function AnalyticsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    totalViews: 0,
    conversionRate: 0,
    formsThisMonth: 0,
    viewsThisMonth: 0,
    submissionsThisMonth: 0,
    formAnalytics: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch dashboard stats using the analytics utility
        const dashboardStats = await getUserAnalytics(user.id);
        
        if (dashboardStats) {
          setAnalyticsData(prev => ({
            ...prev,
            totalForms: parseInt(dashboardStats.total_forms) || 0,
            totalViews: parseInt(dashboardStats.total_views) || 0,
            totalSubmissions: parseInt(dashboardStats.total_submissions) || 0,
            conversionRate: parseFloat(dashboardStats.conversion_rate) || 0,
            formsThisMonth: parseInt(dashboardStats.forms_this_month) || 0,
            viewsThisMonth: parseInt(dashboardStats.views_this_month) || 0,
            submissionsThisMonth: parseInt(dashboardStats.submissions_this_month) || 0
          }));
        } else {
          // Fallback to basic form count
          const { data: forms, error: formsError } = await supabase
            .from("forms")
            .select("id")
            .eq("user_id", user.id);
          
          if (!formsError) {
            setAnalyticsData(prev => ({
              ...prev,
              totalForms: forms?.length || 0
            }));
          }
        }

        // Fetch individual form analytics
        const formAnalytics = await getFormAnalytics(user.id, 30);
        setAnalyticsData(prev => ({
          ...prev,
          formAnalytics: formAnalytics || []
        }));

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const metrics = [
    {
      title: "Total Forms",
      value: analyticsData.totalForms,
      change: { 
        value: analyticsData.formsThisMonth, 
        type: analyticsData.formsThisMonth > 0 ? "increase" : "neutral",
        label: "this month"
      },
      icon: <FileText className="w-5 h-5" />,
      color: "text-blue-600"
    },
    {
      title: "Form Views",
      value: analyticsData.totalViews.toLocaleString(),
      change: { 
        value: analyticsData.viewsThisMonth, 
        type: analyticsData.viewsThisMonth > 0 ? "increase" : "neutral",
        label: "this month"
      },
      icon: <Eye className="w-5 h-5" />,
      color: "text-green-600"
    },
    {
      title: "Submissions",
      value: analyticsData.totalSubmissions.toLocaleString(),
      change: { 
        value: analyticsData.submissionsThisMonth, 
        type: analyticsData.submissionsThisMonth > 0 ? "increase" : "neutral",
        label: "this month"
      },
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600"
    },
    {
      title: "Conversion Rate",
      value: `${analyticsData.conversionRate}%`,
      change: { 
        value: Math.round(analyticsData.conversionRate * 10) / 10, 
        type: analyticsData.conversionRate > 0 ? "increase" : "neutral",
        label: "overall"
      },
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-600"
    }
  ];

  // Use real form analytics data
  const recentActivity = analyticsData.formAnalytics.map(form => ({
    form: form.form_title || 'Untitled Form',
    submissions: parseInt(form.total_submissions) || 0,
    views: parseInt(form.total_views) || 0,
    conversion: parseFloat(form.conversion_rate) || 0,
    trend: parseFloat(form.conversion_rate) >= 15 ? "up" : "down",
    recent_submissions: parseInt(form.recent_submissions) || 0,
    recent_views: parseInt(form.recent_views) || 0
  }));

  const timeRanges = [
    { label: "Last 7 days", value: "7d", active: true },
    { label: "Last 30 days", value: "30d", active: false },
    { label: "Last 3 months", value: "3m", active: false }
  ];

  if (loading) {
    return (
      <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-8 p-6 sm:p-8 md:gap-12">
      <PageHeader
        title="Analytics"
        description="Track your form performance and understand your audience"
        backButton={{
          onClick: () => router.push("/dashboard"),
          label: "Back to Dashboard"
        }}
      />

      {/* Time Range Selector */}
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Overview</h3>
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <Badge
                  key={range.value}
                  variant={range.active ? "default" : "outline"}
                  className={`cursor-pointer ${range.active ? "bg-blue-600" : ""}`}
                >
                  {range.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  {metric.change.type === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : metric.change.type === "decrease" ? (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className={
                    metric.change.type === "increase" ? "text-green-600" : 
                    metric.change.type === "decrease" ? "text-red-600" : 
                    "text-gray-600"
                  }>
                    {metric.change.value} {metric.change.label}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Performance */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
              Form Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((form, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{form.form}</h4>
                        {form.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">{form.submissions}</span>
                          <p>Submissions</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{form.views}</span>
                          <p>Views</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{form.conversion}%</span>
                          <p>Conversion</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No form data yet</p>
                <p className="text-sm text-muted-foreground">Create your first form to start seeing analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-3 h-5 w-5 text-green-600" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivity.length > 0 ? (
              <>
                {/* Best performing form */}
                {(() => {
                  const bestForm = recentActivity.reduce((best, current) => 
                    current.conversion > best.conversion ? current : best, recentActivity[0]
                  );
                  return (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">Best Performing Form</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            "{bestForm.form}" has the highest conversion rate at {bestForm.conversion}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Total activity insight */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Total Activity</h4>
                      <p className="text-sm text-green-700 mt-1">
                        You've received {analyticsData.totalSubmissions} submissions from {analyticsData.totalViews} views across all forms
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dynamic optimization tip */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900">Optimization Tip</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        {analyticsData.conversionRate < 10 
                          ? "Your conversion rate could be improved. Try simplifying your forms or adding clear call-to-actions."
                          : analyticsData.conversionRate < 20
                          ? "Good conversion rate! Consider A/B testing different form layouts to optimize further."
                          : "Excellent conversion rate! Share your successful forms as templates for new ones."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No insights yet</p>
                <p className="text-sm text-muted-foreground">Insights will appear once you have form data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="shadow-lg border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">More Analytics Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            We're working on advanced charts, detailed reports, and custom date ranges.
          </p>
          <Badge variant="secondary">
            Expected: Q2 2024
          </Badge>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
