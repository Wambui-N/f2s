"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-24 bg-[#fff8e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="demo" className="text-4xl font-bold mb-6 text-[#2c5e2a]">
            See It in Action
          </h2>
          <p className="text-xl text-gray-600 mx-auto">
            Watch how easy it is to create a form and connect it to Google Sheets.
          </p>
        </motion.div>

        {/* Demo Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-[#2c5e2a] bg-white shadow-2xl">
            {/* Video Placeholder - Replace with actual video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-full bg-[#f95716] flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </motion.button>
            </div>

            {/* Demo Steps */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex space-x-4">
                  {[
                    "Create Form",
                    "Connect Sheet",
                    "Customize",
                    "Share & Collect"
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex-1 text-center"
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${
                        index === 0 ? "bg-[#2c5e2a] text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              title: "Drag & Drop Builder",
              description: "Build your form visually with our intuitive interface"
            },
            {
              title: "Real-time Preview",
              description: "See exactly how your form will look as you build it"
            },
            {
              title: "Instant Connection",
              description: "Connect to Google Sheets with just two clicks"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-xl bg-white/50"
            >
              <h3 className="text-lg font-semibold mb-2 text-[#2c5e2a]">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
