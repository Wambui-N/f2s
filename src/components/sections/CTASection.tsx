"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function CTASection() {
  const { signInWithGoogle } = useAuth();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: "#fcd4f0" }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: "#f95716" }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#2c5e2a] to-[#f95716] flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#2c5e2a] to-[#f95716] bg-clip-text text-transparent">
            Ready to Transform Your Forms?
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-12 mx-auto">
            Join thousands of businesses using ShelfCue to streamline their form processes. 
            Start free, no credit card required.
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button
              onClick={signInWithGoogle}
              className="h-16 px-12 text-xl font-semibold bg-[#2c5e2a] hover:bg-[#234b21] text-white rounded-2xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 items-center mx-auto">
            {[
              "100% Free to Start",
              "No Credit Card",
              "Cancel Anytime",
              "24/7 Support"
            ].map((badge) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-sm font-medium text-gray-600"
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
