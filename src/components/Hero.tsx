"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Play, ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Hero() {
  const { signInWithGoogle } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGetStarted = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: "linear-gradient(135deg, #f95716 0%, #fcd4f0 100%)" }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-16 w-48 h-48 rounded-full opacity-15"
          style={{ background: "linear-gradient(135deg, #2c5e2a 0%, #fff8e8 100%)" }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full opacity-10"
          style={{ background: "#fcd4f0" }}
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge
              variant="secondary"
              className="mb-8 px-6 py-3 text-sm font-medium border border-[#2c5e2a]/20 bg-[#fff8e8] text-[#2c5e2a]"
            >
              <motion.span 
                className="w-2 h-2 rounded-full mr-3"
                style={{ backgroundColor: "#2c5e2a" }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Google Sheets as your native database
            </Badge>
          </motion.div>

          {/* Main Headline with Staggered Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <motion.span 
                className="block"
                style={{ color: "#442c02" }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Automate your forms.
              </motion.span>
              <motion.span 
                className="block"
                style={{ color: "#2c5e2a" }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Organize your data.
              </motion.span>
              <motion.span 
                className="block"
                style={{ color: "#f95716" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                Save time.
              </motion.span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p 
            className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Shelfcue connects forms directly to Google Sheets with zero hassle.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="text-xl font-semibold px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: "#f95716",
                  color: "white"
                }}
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Start Free
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => scrollToSection("demo")}
                size="lg"
                className="text-xl font-semibold px-12 py-6 rounded-2xl border-2 transition-all duration-300"
                style={{ 
                  backgroundColor: "#fff8e8",
                  borderColor: "#2c5e2a",
                  color: "#2c5e2a"
                }}
              >
                <Play className="w-6 h-6 mr-3" />
                See it in action
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats with Staggered Animation */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            {[
              { label: "Setup Time", value: "2 minutes", color: "#f95716" },
              { label: "Learning Curve", value: "Zero", color: "#2c5e2a" },
              { label: "Manual Work", value: "Eliminated", color: "#442c02" }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 + (index * 0.2) }}
                whileHover={{ y: -5 }}
              >
                <div 
                  className="text-4xl font-bold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-[#442c02] font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div 
          className="w-6 h-10 border-2 rounded-full flex justify-center"
          style={{ borderColor: "#2c5e2a" }}
        >
          <motion.div 
            className="w-1 h-3 rounded-full mt-2"
            style={{ backgroundColor: "#2c5e2a" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}