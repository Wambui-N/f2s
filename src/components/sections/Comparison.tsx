"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function Comparison() {
  const features = [
    {
      name: "Google Sheets Integration",
      shelfcue: "Native & Real-time",
      googleForms: "Basic Export",
      typeform: "Via Zapier"
    },
    {
      name: "Custom Branding",
      shelfcue: true,
      googleForms: false,
      typeform: "Premium Only"
    },
    {
      name: "Conditional Logic",
      shelfcue: true,
      googleForms: "Limited",
      typeform: true
    },
    {
      name: "File Uploads",
      shelfcue: "Direct to Drive",
      googleForms: "Drive Only",
      typeform: "Cloud Storage"
    },
    {
      name: "Data Ownership",
      shelfcue: "100% Yours",
      googleForms: "Google's Terms",
      typeform: "Platform Locked"
    },
    {
      name: "Setup Time",
      shelfcue: "2 Minutes",
      googleForms: "10+ Minutes",
      typeform: "15+ Minutes"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-[#2c5e2a]">
            Why Choose ShelfCue?
          </h2>
          <p className="text-xl text-gray-600 mx-auto">
            See how we compare to other form builders when it comes to Google Sheets integration.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="overflow-hidden rounded-2xl border-2 border-[#2c5e2a]/10">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-[#2c5e2a]/5 p-6">
              <div className="text-lg font-semibold text-[#2c5e2a]">Feature</div>
              <div className="text-lg font-semibold text-[#2c5e2a]">ShelfCue</div>
              <div className="text-lg font-semibold text-gray-600">Google Forms</div>
              <div className="text-lg font-semibold text-gray-600">Typeform</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  viewport={{ once: true }}
                  className="grid grid-cols-4 p-6 hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="text-[#2c5e2a] font-medium">
                    {typeof feature.shelfcue === "boolean" ? (
                      feature.shelfcue ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )
                    ) : (
                      feature.shelfcue
                    )}
                  </div>
                  <div className="text-gray-600">
                    {typeof feature.googleForms === "boolean" ? (
                      feature.googleForms ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )
                    ) : (
                      feature.googleForms
                    )}
                  </div>
                  <div className="text-gray-600">
                    {typeof feature.typeform === "boolean" ? (
                      feature.typeform ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )
                    ) : (
                      feature.typeform
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
