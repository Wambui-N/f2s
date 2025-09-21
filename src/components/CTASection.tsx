"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Calendar, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CTASection() {
  const { signInWithGoogle } = useAuth();

  const handleGetStarted = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-8"
          style={{ background: "linear-gradient(135deg, #f95716 0%, #fcd4f0 100%)" }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-16 w-48 h-48 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg, #2c5e2a 0%, #fff8e8 100%)" }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #fcd4f0 0%, #fff8e8 100%)" }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Main CTA Content */}
          <motion.div
            className="p-12 rounded-3xl shadow-2xl border-4 relative overflow-hidden"
            style={{ 
              backgroundColor: "#2c5e2a",
              borderColor: "#f95716"
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Floating Elements Inside Card */}
            <motion.div 
              className="absolute top-6 right-6 w-12 h-12 rounded-full opacity-20"
              style={{ backgroundColor: "#fcd4f0" }}
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-6 left-6 w-8 h-8 rounded-full opacity-25"
              style={{ backgroundColor: "#fff8e8" }}
              animate={{ 
                rotate: [360, 0],
                scale: [1.1, 1, 1.1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Ready to automate your workflow?
              </h2>
              <p className="text-xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of businesses who've eliminated manual data entry and 
                transformed their forms into powerful data collection machines.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="text-xl font-bold px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  style={{ 
                    backgroundColor: "#f95716",
                    color: "white"
                  }}
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="text-xl font-bold px-12 py-6 rounded-2xl border-2 transition-all duration-300"
                  style={{ 
                    backgroundColor: "#fff8e8",
                    borderColor: "white",
                    color: "#2c5e2a"
                  }}
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Book a Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-green-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                "✓ 14-day free trial",
                "✓ No credit card required", 
                "✓ Cancel anytime",
                "✓ 99.9% uptime"
              ].map((item, index) => (
                <motion.div 
                  key={item}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};