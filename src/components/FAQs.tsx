"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQs() {
  const faqs = [
    {
      question: "How does FormToSheets work?",
      answer: "FormToSheets connects your forms directly to Google Sheets. When someone submits a form, the data is automatically validated and added to your specified Google Sheet in real-time. No manual exports or complex setup required."
    },
    {
      question: "What types of forms are supported?",
      answer: "We support all major form platforms including Google Forms, Typeform, Jotform, Gravity Forms, Contact Form 7, and custom HTML forms. You can also use our API to connect any form or application."
    },
    {
      question: "How long does setup take?",
      answer: "Setup typically takes less than 5 minutes. You'll need to connect your Google account, select your form, choose your Google Sheet, and configure your field mappings. Our guided setup wizard makes it incredibly simple."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security with encrypted data transmission, secure Google Sheets integration, and never store your form data on our servers. All data flows directly from your form to your Google Sheet."
    },
    {
      question: "Can I customize how data appears in Google Sheets?",
      answer: "Yes! You can customize headers, formatting, data validation rules, and even create custom formulas. You have full control over how your data is organized and presented in your Google Sheets."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "We'll notify you when you're approaching your limits. You can upgrade your plan anytime, or we can work with you to find a solution that fits your needs. We never cut off service without notice."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes! We offer email support for all plans, priority support for Professional plans, and 24/7 phone support for Enterprise customers. Our support team is known for being responsive and helpful."
    },
    {
      question: "Can I connect multiple forms to the same Google Sheet?",
      answer: "Yes, you can connect unlimited forms to the same Google Sheet or different sheets. This is perfect for businesses that collect data from multiple sources and want everything organized in one place."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to start. You can test everything before committing to a paid plan."
    },
    {
      question: "Can I export my data if I cancel?",
      answer: "Absolutely. Your data always belongs to you. You can export all your data at any time, and we provide easy export tools. When you cancel, we'll help you transition your data to another solution if needed."
    },
    {
      question: "Do you integrate with other tools?",
      answer: "Yes! We integrate with Zapier, webhooks, and offer a robust API. You can connect FormToSheets to your CRM, email marketing tools, project management software, and more."
    },
    {
      question: "What if I need help with setup?",
      answer: "We provide comprehensive documentation, video tutorials, and our support team is always ready to help. For Enterprise customers, we offer custom setup assistance and training sessions."
    }
  ];

  return (
    <section id="faqs" className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about FormToSheets. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Items */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <Card>
                <AccordionTrigger className="px-6 py-6 text-left hover:no-underline">
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help. Get in touch and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Contact Support
                </Button>
                <Button variant="outline">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Setup Guide</h4>
              <p className="text-muted-foreground text-sm">Step-by-step instructions to get started</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Community</h4>
              <p className="text-muted-foreground text-sm">Connect with other users and experts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Feature Requests</h4>
              <p className="text-muted-foreground text-sm">Suggest new features and improvements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
