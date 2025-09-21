"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Calendar, FileUp, Bell, Users, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Feature {
  text: string;
  included: boolean;
  soon?: boolean;
}

export function Pricing() {
  const { signInWithGoogle } = useAuth();

  const plans = [
    {
      badge: "For starters",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        { text: "Unlimited forms → Google Sheets", included: true },
        { text: "Dashboard to manage forms", included: true },
        { text: "Mobile-friendly, modern forms", included: true },
        { text: "Automations", included: false },
        { text: "File handling, scheduling, notifications", included: false }
      ] as Feature[],
      cta: "Get Started Free",
      ctaAction: signInWithGoogle,
      scale: 0.95
    },
    {
      badge: "Most Popular",
      name: "Pro",
      price: "$29",
      period: "/mo",
      yearlyPrice: "or $290/year",
      specialOffer: "🎁 Launch Offer: $19/mo for first 100 users",
      trial: "🎉 2-week free trial (no credit card)",
      description: "Everything you need to automate your business",
      features: [
        { text: "Everything in Free", included: true },
        { text: "Real-time email notifications", included: true },
        { text: "Auto-create Google Calendar events", included: true },
        { text: "File uploads auto-sorted in Drive", included: true },
        { text: "Priority support", included: true },
        { text: "Coming Soon: Auto follow-up emails", included: true, soon: true }
      ] as Feature[],
      cta: "Start Free Trial",
      ctaAction: signInWithGoogle,
      popular: true,
      scale: 1
    },
    {
      badge: "Coming Soon 🚀",
      name: "Teams",
      price: "—",
      description: "Advanced features for growing teams",
      features: [
        { text: "Shared workspaces", included: true },
        { text: "Team-based permissions", included: true },
        { text: "Advanced reporting & analytics", included: true },
        { text: "Early access perks", included: true }
      ] as Feature[],
      cta: "Join Waitlist",
      ctaAction: () => window.location.href = "#waitlist",
      comingSoon: true,
      scale: 0.95
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-[#2c5e2a]">
            Simple pricing. Big impact.
          </h2>
          <p className="text-xl text-gray-600  mx-auto">
            Start free, upgrade when you're ready to automate your business.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'md:-mt-8 md:mb-8' : ''}`}
              style={{ scale: plan.scale }}
            >
              <div className={`h-full bg-white rounded-2xl p-8 border-2 ${
                plan.popular 
                  ? 'border-[#2c5e2a] shadow-xl' 
                  : plan.comingSoon
                    ? 'border-[#f95716]/30'
                    : 'border-gray-200'
              }`}>
                {/* Badge */}
                <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-6 ${
                  plan.popular 
                    ? 'bg-[#2c5e2a] text-white' 
                    : plan.comingSoon
                      ? 'bg-[#f95716]/10 text-[#f95716]'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.badge}
                </div>

                {/* Plan Name & Price */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    )}
                  </div>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-gray-500 mt-1">
                      {plan.yearlyPrice}
                    </div>
                  )}
                  {plan.specialOffer && (
                    <div className="text-sm font-medium text-[#f95716] mt-2">
                      {plan.specialOffer}
                    </div>
                  )}
                  {plan.trial && (
                    <div className="text-sm text-[#2c5e2a] mt-1">
                      {plan.trial}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start">
                      {feature.included ? (
                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${
                          feature.soon ? 'text-[#f95716]' : 'text-[#2c5e2a]'
                        }`} />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-gray-600 ${feature.soon ? 'text-[#f95716]' : ''}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={plan.ctaAction}
                    className={`w-full py-6 text-lg font-medium rounded-xl ${
                      plan.popular
                        ? 'bg-[#2c5e2a] hover:bg-[#234b21] text-white'
                        : plan.comingSoon
                          ? 'bg-[#f95716]/10 hover:bg-[#f95716]/20 text-[#f95716]'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 mt-12"
        >
          No hidden fees. Cancel anytime. Your forms and data are always yours.
        </motion.p>
      </div>
    </section>
  );
}