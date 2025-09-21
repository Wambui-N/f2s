"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Pricing = () => {
  const { signInWithGoogle } = useAuth();

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 forms",
        "100 submissions/month", 
        "Basic Google Sheets integration",
        "Email support",
        "Mobile-responsive forms"
      ],
      buttonText: "Start Free",
      popular: false,
      color: "#fff8e8",
      textColor: "#442c02",
      borderColor: "#2c5e2a"
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
        "Advanced analytics",
        "File uploads to Google Drive",
        "Conditional logic"
      ],
      buttonText: "Start Pro Trial",
      popular: true,
      color: "#f95716",
      textColor: "white",
      borderColor: "#f95716"
    },
    {
      name: "Business",
      price: "$99", 
      period: "per month",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Unlimited submissions",
        "Custom integrations",
        "Dedicated account manager", 
        "SLA guarantee",
        "Advanced security",
        "White-label options",
        "API access"
      ],
      buttonText: "Contact Sales",
      popular: false,
      color: "#2c5e2a",
      textColor: "white",
      borderColor: "#2c5e2a"
    }
  ];

  const handleGetStarted = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <section 
      id="pricing" 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#fff8e8" }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-40 h-40 rounded-full opacity-10"
          style={{ backgroundColor: "#f95716" }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-24 w-32 h-32 rounded-full opacity-12"
          style={{ backgroundColor: "#2c5e2a" }}
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: "#442c02" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
          >
            Choose the plan that works best for your business. Start free, upgrade when you're ready.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + (index * 0.2) }}
                  viewport={{ once: true }}
                >
                  <Badge 
                    className="px-4 py-2 text-sm font-bold text-white shadow-lg"
                    style={{ backgroundColor: "#f95716" }}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </motion.div>
              )}

              {/* Card */}
              <div 
                className={`p-8 rounded-3xl border-4 shadow-xl hover:shadow-2xl transition-all duration-500 h-full ${
                  plan.popular ? 'ring-4 ring-opacity-20' : ''
                }`}
                style={{ 
                  backgroundColor: plan.color,
                  borderColor: plan.borderColor,
                  ringColor: plan.popular ? "#f95716" : "transparent"
                }}
              >
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ 
                      backgroundColor: plan.popular ? "white" : plan.borderColor,
                      color: plan.popular ? plan.color : "white"
                    }}
                  >
                    {plan.popular ? <Crown className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                  </motion.div>
                  
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: plan.textColor }}
                  >
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span 
                      className="text-5xl font-bold"
                      style={{ color: plan.textColor }}
                    >
                      {plan.price}
                    </span>
                    <span 
                      className="text-lg ml-2 opacity-80"
                      style={{ color: plan.textColor }}
                    >
                      /{plan.period}
                    </span>
                  </div>
                  
                  <p 
                    className="opacity-90"
                    style={{ color: plan.textColor }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div 
                      key={featureIndex}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.0 + (index * 0.2) + (featureIndex * 0.1) }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle 
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: plan.popular ? "white" : "#2c5e2a" }}
                      />
                      <span 
                        className="text-sm font-medium"
                        style={{ color: plan.textColor }}
                      >
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    className="w-full text-lg font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: plan.popular ? "white" : plan.borderColor,
                      color: plan.popular ? plan.color : "white",
                      border: `2px solid ${plan.popular ? "white" : plan.borderColor}`
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <p 
            className="text-lg font-medium"
            style={{ color: "#442c02" }}
          >
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};