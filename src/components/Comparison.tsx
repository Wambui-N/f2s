"use client";

import { motion } from "framer-motion";
import { CheckCircle, X, Crown } from "lucide-react";

export default function Comparison() {
  const features = [
    {
      feature: "Google Sheets Integration",
      shelfcue: { status: "✓", text: "Native Database", highlight: true },
      zapier: { status: "✗", text: "Add-on Only" },
      manual: { status: "✗", text: "No Integration" },
    },
    {
      feature: "Two-way Sync",
      shelfcue: { status: "✓", text: "Edit in Sheets → Form Updates", highlight: true },
      zapier: { status: "✗", text: "One-way Only" },
      manual: { status: "✗", text: "No Sync" },
    },
    {
      feature: "Beautiful Forms",
      shelfcue: { status: "✓", text: "Branded by Default", highlight: true },
      zapier: { status: "✗", text: "Ugly Forms" },
      manual: { status: "✗", text: "Basic HTML" },
    },
    {
      feature: "File Uploads",
      shelfcue: { status: "✓", text: "Auto-organized in Drive", highlight: true },
      zapier: { status: "✗", text: "Complex Setup" },
      manual: { status: "✗", text: "Manual Handling" },
    },
    {
      feature: "Conditional Logic",
      shelfcue: { status: "✓", text: "Visual Flow Builder", highlight: true },
      zapier: { status: "✗", text: "Complex Rules" },
      manual: { status: "✗", text: "Not Possible" },
    },
    {
      feature: "Setup Time",
      shelfcue: { status: "✓", text: "2 Minutes", highlight: true },
      zapier: { status: "✗", text: "30+ Minutes" },
      manual: { status: "✗", text: "Hours" },
    },
    {
      feature: "Small Business Focus",
      shelfcue: { status: "✓", text: "Built for SMBs", highlight: true },
      zapier: { status: "✗", text: "Enterprise Focus" },
      manual: { status: "✗", text: "DIY Approach" },
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-16 left-10 w-24 h-24 rounded-full opacity-8"
          style={{ backgroundColor: "#fcd4f0" }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-16 w-32 h-32 rounded-full opacity-6"
          style={{ backgroundColor: "#fff8e8" }}
          animate={{ 
            y: [-15, 15, -15],
            x: [-8, 8, -8]
          }}
          transition={{ 
            duration: 8,
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
            Shelfcue vs Other Tools
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
          >
            While others treat Google Sheets as an add-on, we make it your native database. 
            See the difference that real integration makes.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div 
          className="rounded-3xl shadow-2xl border-2 overflow-hidden max-w-6xl mx-auto"
          style={{ borderColor: "#2c5e2a" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead style={{ backgroundColor: "#fff8e8" }}>
                <tr>
                  <th className="px-8 py-6 text-left text-lg font-bold" style={{ color: "#442c02" }}>
                    Feature
                  </th>
                  <th 
                    className="px-8 py-6 text-center text-lg font-bold text-white relative"
                    style={{ backgroundColor: "#2c5e2a" }}
                  >
                    <motion.div 
                      className="flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Shelfcue
                    </motion.div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: "#f95716", color: "white" }}
                      >
                        BEST
                      </div>
                    </div>
                  </th>
                  <th 
                    className="px-8 py-6 text-center text-lg font-semibold border-l-2"
                    style={{ color: "#442c02", borderColor: "#2c5e2a" }}
                  >
                    Zapier
                  </th>
                  <th 
                    className="px-8 py-6 text-center text-lg font-semibold border-l-2"
                    style={{ color: "#442c02", borderColor: "#2c5e2a" }}
                  >
                    Manual Entry
                  </th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody>
                {features.map((item, index) => (
                  <motion.tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : ""}
                    style={{ backgroundColor: index % 2 === 1 ? "#fff8e8" : "white" }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                    viewport={{ once: true }}
                    whileHover={{ backgroundColor: "#fcd4f0" }}
                  >
                    <td 
                      className="px-8 py-6 text-lg font-semibold border-r-2"
                      style={{ color: "#442c02", borderColor: "#2c5e2a" }}
                    >
                      {item.feature}
                    </td>
                    <td 
                      className="px-8 py-6 text-center font-bold text-white border-r-2"
                      style={{ backgroundColor: "#2c5e2a", borderColor: "#2c5e2a" }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{item.shelfcue.text}</span>
                      </motion.div>
                    </td>
                    <td 
                      className="px-8 py-6 text-center border-r-2"
                      style={{ color: "#442c02", borderColor: "#2c5e2a" }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <X className="w-5 h-5 text-red-500" />
                        <span>{item.zapier.text}</span>
                      </div>
                    </td>
                    <td 
                      className="px-8 py-6 text-center"
                      style={{ color: "#442c02" }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <X className="w-5 h-5 text-red-500" />
                        <span>{item.manual.text}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Key Differentiators */}
        <motion.div 
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            {
              title: "Native Database",
              description: "Google Sheets isn't an add-on—it's your database. Two-way sync, real-time updates, and validations from Sheets.",
              color: "#f95716",
              bgColor: "#fff8e8"
            },
            {
              title: "Beautiful by Default", 
              description: "Every form looks professional and branded. No ugly Google Forms styling or paid plan restrictions.",
              color: "#2c5e2a",
              bgColor: "#fcd4f0"
            },
            {
              title: "Visual Flow Builder",
              description: "Drag boxes, connect arrows, done. Conditional logic that small businesses understand without a manual.",
              color: "#442c02",
              bgColor: "#fff8e8"
            }
          ].map((differentiator, index) => (
            <motion.div 
              key={index}
              className="text-center p-8 rounded-3xl border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-500 group"
              style={{ backgroundColor: differentiator.bgColor }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + (index * 0.2) }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                scale: 1.02
              }}
            >
              <motion.div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: differentiator.color }}
                whileHover={{ rotate: 5 }}
              >
                <div className="w-10 h-10 bg-white rounded-xl"></div>
              </motion.div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: "#442c02" }}
              >
                {differentiator.title}
              </h3>
              <p 
                className="leading-relaxed"
                style={{ color: "#442c02" }}
              >
                {differentiator.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}