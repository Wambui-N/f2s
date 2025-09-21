"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, Maximize, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InteractiveDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section 
      id="demo" 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#fff8e8" }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "#fcd4f0" }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-24 h-24 rounded-full opacity-15"
          style={{ backgroundColor: "#f95716" }}
          animate={{ 
            y: [-10, 10, -10],
            x: [-5, 5, -5]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: "#442c02" }}
          >
            See Shelfcue in Action
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
          >
            Watch how easy it is to connect your form to Google Sheets.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative group">
            {/* Video Container */}
            <motion.div 
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4"
              style={{ borderColor: "#2c5e2a" }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Video Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {/* Play Overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={() => setIsPlaying(!isPlaying)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                    style={{ backgroundColor: "#f95716" }}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white ml-1" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-2" />
                    )}
                  </div>
                </motion.div>

                {/* Video Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div className="text-white text-sm font-medium">
                      {isPlaying ? "Playing" : "Paused"} • 3:24
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Demo Content Preview */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                    </motion.div>
                    <p className="text-gray-500 text-lg font-medium">
                      Demo Video Coming Soon
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Click to see how Shelfcue works
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-6 -left-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
              style={{ backgroundColor: "#fcd4f0" }}
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: "#442c02" }} />
            </motion.div>

            <motion.div 
              className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
              style={{ backgroundColor: "#2c5e2a" }}
              animate={{ 
                rotate: [360, 0],
                scale: [1.1, 1, 1.1]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Demo Features */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            { 
              title: "Form Builder", 
              description: "Drag & drop interface",
              color: "#f95716"
            },
            { 
              title: "Real-time Sync", 
              description: "Instant Google Sheets updates",
              color: "#2c5e2a"
            },
            { 
              title: "Zero Setup", 
              description: "Works in under 2 minutes",
              color: "#442c02"
            }
          ].map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="text-center p-6 rounded-2xl border-2 border-white/50 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + (index * 0.2) }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: feature.color }}
              >
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: "#442c02" }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-sm"
                style={{ color: "#442c02" }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};