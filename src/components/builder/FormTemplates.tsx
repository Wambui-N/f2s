"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData } from "./types";
import { X } from "lucide-react";

interface FormTemplatesProps {
  onSelectTemplate: (template: FormData) => void;
  onClose: () => void;
}

export function FormTemplates({
  onSelectTemplate,
  onClose,
}: FormTemplatesProps) {
  const templates = [
    {
      id: "consultation",
      title: "Client Consultation",
      description: "Perfect for consultants, coaches, and service providers",
      fields: [
        {
          id: "1",
          type: "text" as const,
          label: "Full Name",
          columnName: "fullName",
          placeholder: "John Smith",
        },
        {
          id: "2",
          type: "email" as const,
          label: "Email Address",
          columnName: "email",
          placeholder: "john@example.com",
        },
        {
          id: "3",
          type: "text" as const,
          label: "Company/Organization",
          columnName: "company",
          placeholder: "ABC Company",
        },
        {
          id: "4",
          type: "select" as const,
          label: "Service Needed",
          columnName: "serviceType",
          options: [
            "Business Coaching",
            "Strategy Consulting",
            "Marketing Consulting",
            "Other",
          ],
        },
        {
          id: "5",
          type: "select" as const,
          label: "Project Budget",
          columnName: "budget",
          options: [
            "Under $500",
            "$500 - $1,500",
            "$1,500 - $3,000",
            "$3,000+",
          ],
        },
        {
          id: "6",
          type: "textarea" as const,
          label: "Project Description",
          columnName: "projectDescription",
          placeholder: "Tell us about your project goals and challenges...",
        },
        {
          id: "7",
          type: "date" as const,
          label: "Preferred Start Date",
          columnName: "startDate",
          placeholder: "Select a date",
        },
      ],
      theme: {
        primaryColor: "#3b82f6",
        fontFamily: "Inter",
        borderRadius: "8px",
        spacing: "16px",
      },
      settings: {
        submitText: "Submit",
        successMessage: "Thank you! We'll be in touch within 24 hours.",
        errorMessage:
          "There was an error submitting your request. Please try again.",
      },
      status: "draft",
    },
    {
      id: "photography",
      title: "Photography Booking",
      description: "Ideal for photographers and creative professionals",
      fields: [
        {
          id: "1",
          type: "text" as const,
          label: "Client Name",
          columnName: "clientName",
          placeholder: "Jane Doe",
        },
        {
          id: "2",
          type: "email" as const,
          label: "Email Address",
          columnName: "email",
          placeholder: "jane@example.com",
        },
        {
          id: "3",
          type: "text" as const,
          label: "Phone Number",
          columnName: "phone",
          placeholder: "(555) 123-4567",
        },
        {
          id: "4",
          type: "select" as const,
          label: "Session Type",
          columnName: "sessionType",
          options: ["Portrait", "Wedding", "Event", "Commercial", "Other"],
        },
        {
          id: "5",
          type: "date" as const,
          label: "Preferred Date",
          columnName: "preferredDate",
          placeholder: "Select a date",
        },
        {
          id: "6",
          type: "select" as const,
          label: "Location",
          columnName: "location",
          options: ["Studio", "Outdoor", "Client Location", "TBD"],
        },
        {
          id: "7",
          type: "textarea" as const,
          label: "Special Requests",
          columnName: "specialRequests",
          placeholder: "Any specific shots or requirements...",
        },
      ],
      theme: {
        primaryColor: "#3b82f6",
        fontFamily: "Inter",
        borderRadius: "8px",
        spacing: "16px",
      },
      settings: {
        submitText: "Submit",
        successMessage: "Thank you! We'll be in touch within 24 hours.",
        errorMessage:
          "There was an error submitting your request. Please try again.",
      },
      status: "draft",
    },
    {
      id: "event",
      title: "Event Planning Inquiry",
      description: "Great for event planners and venue coordinators",
      fields: [
        {
          id: "1",
          type: "text" as const,
          label: "Event Host Name",
          columnName: "hostName",
          placeholder: "Sarah Johnson",
        },
        {
          id: "2",
          type: "email" as const,
          label: "Email Address",
          columnName: "email",
          placeholder: "sarah@example.com",
        },
        {
          id: "3",
          type: "text" as const,
          label: "Event Name",
          columnName: "eventName",
          placeholder: "Annual Company Retreat",
        },
        {
          id: "4",
          type: "select" as const,
          label: "Event Type",
          columnName: "eventType",
          options: [
            "Corporate",
            "Wedding",
            "Birthday Party",
            "Conference",
            "Other",
          ],
        },
        {
          id: "5",
          type: "date" as const,
          label: "Event Date",
          columnName: "eventDate",
          placeholder: "Select a date",
        },
        {
          id: "6",
          type: "number" as const,
          label: "Number of Guests",
          columnName: "guestCount",
          placeholder: "50",
        },
        {
          id: "7",
          type: "textarea" as const,
          label: "Event Details",
          columnName: "eventDetails",
          placeholder: "Describe your vision for the event...",
        },
      ],
      theme: {
        primaryColor: "#3b82f6",
        fontFamily: "Inter",
        borderRadius: "8px",
        spacing: "16px",
      },
      settings: {
        submitText: "Submit",
        successMessage: "Thank you! We'll be in touch within 24 hours.",
        errorMessage:
          "There was an error submitting your request. Please try again.",
      },
      status: "draft",
    },
    {
      id: "lead",
      title: "Lead Capture",
      description: "Simple lead generation for any business",
      fields: [
        {
          id: "1",
          type: "text" as const,
          label: "First Name",
          columnName: "firstName",
          placeholder: "John",
        },
        {
          id: "2",
          type: "text" as const,
          label: "Last Name",
          columnName: "lastName",
          placeholder: "Smith",
        },
        {
          id: "3",
          type: "email" as const,
          label: "Email Address",
          columnName: "email",
          placeholder: "john@example.com",
        },
        {
          id: "4",
          type: "text" as const,
          label: "Phone Number",
          columnName: "phone",
          placeholder: "(555) 123-4567",
        },
        {
          id: "5",
          type: "select" as const,
          label: "How did you hear about us?",
          columnName: "referralSource",
          options: [
            "Google Search",
            "Social Media",
            "Referral",
            "Advertisement",
            "Other",
          ],
        },
        {
          id: "6",
          type: "textarea" as const,
          label: "Message",
          columnName: "message",
          placeholder: "Tell us how we can help you...",
        },
      ],
      theme: {
        primaryColor: "#3b82f6",
        fontFamily: "Inter",
        borderRadius: "8px",
        spacing: "16px",
      },
      settings: {
        submitText: "Submit",
        successMessage: "Thank you! We'll be in touch within 24 hours.",
        errorMessage:
          "There was an error submitting your request. Please try again.",
      },
      status: "draft",
    },
  ];

  const generateId = () =>
    `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSelectTemplate = (template: any) => {
    const formData: FormData = {
      id: generateId(),
      title: template.title,
      description: template.description,
      fields: template.fields.map((field: any) => ({
        ...field,
        id: generateId(),
      })),
      theme: {
        primaryColor: "#3b82f6",
        fontFamily: "Inter",
        borderRadius: "8px",
        spacing: "16px",
      },
      settings: {
        submitText: "Submit",
        successMessage: "Thank you! We'll be in touch within 24 hours.",
        errorMessage:
          "There was an error submitting your request. Please try again.",
      },
      lastSaved: new Date(),
      status: "draft",
    };
    onSelectTemplate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">Choose a Template</CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {template.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    {template.fields.slice(0, 3).map((field, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {field.label}
                      </div>
                    ))}
                    {template.fields.length > 3 && (
                      <div className="text-sm text-gray-500">
                        + {template.fields.length - 3} more fields
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full"
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
