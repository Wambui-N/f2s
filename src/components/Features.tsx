"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Palette, 
  Upload, 
  GitBranch, 
  Code, 
  RefreshCw, 
  CheckCircle, 
  Smartphone 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "No Manual Copy-Paste",
      description: "Forms sync directly to Google Sheets in real-time. No more tedious data entry or missed submissions.",
      color: "#f95716",
      bgColor: "#fff8e8"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Beautiful by Default",
      description: "Professional, branded forms that match your website. No ugly Google Forms styling or paid plan restrictions.",
      color: "#2c5e2a",
      bgColor: "#fcd4f0"
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart File Organization",
      description: "File uploads stored neatly in Google Drive with automatic renaming. Dead-simple for teams to access and manage.",
      color: "#442c02",
      bgColor: "#fff8e8"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Visual Flow Builder",
      description: "Drag boxes, connect arrows, done. Simple conditional logic that teams understand without a manual.",
      color: "#f95716",
      bgColor: "#fcd4f0"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Dual Experience",
      description: "Non-tech friendly: drag-and-drop templates. Dev-friendly: custom CSS, scripts, and API hooks.",
      color: "#2c5e2a",
      bgColor: "#fff8e8"
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Real-time Two-way Sync",
      description: "Edit in Sheets → form updates instantly. No more manual exports or data silos.",
      color: "#442c02",
      bgColor: "#fcd4f0"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Sheet-based Validations",
      description: "Set validation rules directly in Google Sheets. Dropdowns, required fields, and data types sync automatically.",
      color: "#f95716",
      bgColor: "#fff8e8"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile-First Design",
      description: "Every form looks perfect on phones and tablets. Your customers get a professional experience everywhere.",
      color: "#2c5e2a",
      bgColor: "#fcd4f0"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 right-10 w-40 h-40 rounded-full opacity-5"
          style={{ backgroundColor: "#f95716" }}
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
          className="absolute bottom-32 left-16 w-32 h-32 rounded-full opacity-8"
          style={{ backgroundColor: "#2c5e2a" }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
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
            Built for Small Business
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
          >
            While others treat Google Sheets as an add-on, we make it your native database. 
            Beautiful forms that live where you already work.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div 
                className="p-8 rounded-3xl border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-500 h-full"
                style={{ backgroundColor: feature.bgColor }}
              >
                {/* Icon */}
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: feature.color }}
                  whileHover={{ rotate: 5 }}
                >
                  <div style={{ color: "white" }}>
                    {feature.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <h3 
                  className="text-xl font-bold mb-4 group-hover:text-opacity-90 transition-all duration-300"
                  style={{ color: "#442c02" }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="leading-relaxed group-hover:text-opacity-80 transition-all duration-300"
                  style={{ color: "#442c02" }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div 
            className="inline-block p-8 rounded-3xl shadow-xl"
            style={{ backgroundColor: "#2c5e2a" }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Everything Small Business Needs
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl">
              Built specifically for teams that live in Google Sheets. No learning curve, no complexity.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
              {[
                "AI Design Helper",
                "Auto File Renaming", 
                "Visual Flow Builder",
                "Custom CSS Support",
                "Sheet-based Dropdowns",
                "API Hooks",
                "Google Drive Integration",
                "Mobile-First Design"
              ].map((item, index) => (
                <motion.div 
                  key={item}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}