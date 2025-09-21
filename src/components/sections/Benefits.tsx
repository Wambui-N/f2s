"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Clock, 
  Palette, 
  Sheet, 
  Zap, 
  Shield 
} from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: "2-Minute Setup",
      description: "Connect your form to Google Sheets in under 2 minutes. No technical knowledge required."
    },
    {
      icon: Palette,
      title: "Beautiful by Default",
      description: "Professional-looking forms that automatically match your brand colors."
    },
    {
      icon: Sheet,
      title: "Native Integration",
      description: "Your Google Sheet becomes your database. Edit data directly in sheets."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Form submissions instantly appear in your connected Google Sheet."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays in your Google account. We never store your submissions."
    },
    {
      icon: Sparkles,
      title: "Smart Features",
      description: "Conditional logic, file uploads, and automated notifications built-in."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold mb-6 text-[#2c5e2a]">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 mx-auto">
            Powerful features wrapped in a simple interface. Focus on your business while we handle the complexity.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border-2 border-[#2c5e2a]/10 hover:border-[#2c5e2a]/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2c5e2a]/10 flex items-center justify-center mb-6">
                <benefit.icon className="w-6 h-6 text-[#2c5e2a]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2c5e2a]">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
