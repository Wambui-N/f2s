"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How quickly can I set up my first form?",
      answer: "You can have your first form connected to Google Sheets in under 2 minutes. Simply sign in with Google, create a form using our drag-and-drop builder, and start collecting submissions immediately."
    },
    {
      question: "Do I need any technical knowledge?",
      answer: "Not at all! ShelfCue is designed for non-technical users. If you can use Google Sheets, you can use ShelfCue. Our visual form builder and automatic integrations handle all the technical complexity for you."
    },
    {
      question: "How does the Google Sheets integration work?",
      answer: "ShelfCue treats Google Sheets as your native database. When someone submits your form, the data appears instantly in your connected Google Sheet. You can even edit data in the sheet and see changes reflected in your form analytics."
    },
    {
      question: "Can I customize the look of my forms?",
      answer: "Yes! Every form is beautiful by default and automatically matches your brand. You can customize colors, fonts, logos, and even add custom CSS if needed."
    },
    {
      question: "What happens to file uploads?",
      answer: "File uploads are automatically organized in your Google Drive with smart naming and folder structures. You can customize how files are organized and even share them automatically with form submitters."
    },
    {
      question: "Is there a limit on form submissions?",
      answer: "The Starter plan includes 100 submissions per month, Pro includes 10,000, and Business has unlimited submissions. All plans include unlimited forms and Google Sheets connections."
    }
  ];

  return (
    <section id="faqs" className="py-24 bg-[#fff8e8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-[#2c5e2a]">
            Common Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about ShelfCue.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
              >
                <span className="text-lg font-medium text-[#2c5e2a]">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#2c5e2a]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <Button
            variant="outline"
            className="h-12 px-8 text-[#2c5e2a] border-[#2c5e2a] hover:bg-[#2c5e2a] hover:text-white"
          >
            Contact Support
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
