"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How quickly can I set up my first form?",
      answer: "You can have your first form connected to Google Sheets in under 2 minutes. Simply sign in with Google, create a form using our drag-and-drop builder, and start collecting submissions immediately."
    },
    {
      question: "Do I need any technical knowledge to use Shelfcue?",
      answer: "Not at all! Shelfcue is designed for non-technical users. If you can use Google Sheets, you can use Shelfcue. Our visual form builder and automatic integrations handle all the technical complexity for you."
    },
    {
      question: "How does the Google Sheets integration work?",
      answer: "Shelfcue treats Google Sheets as your native database. When someone submits your form, the data appears instantly in your connected Google Sheet. You can even edit data in the sheet and see changes reflected in your form analytics."
    },
    {
      question: "Can I customize the look of my forms?",
      answer: "Yes! Every form is beautiful by default and automatically matches your brand. You can customize colors, fonts, logos, and even add custom CSS if needed. No more ugly Google Forms styling."
    },
    {
      question: "What happens to file uploads?",
      answer: "File uploads are automatically organized in your Google Drive with smart naming and folder structures. You can customize how files are organized and even share them automatically with form submitters."
    },
    {
      question: "Is there a limit on form submissions?",
      answer: "The Starter plan includes 100 submissions per month, Pro includes 10,000, and Business has unlimited submissions. All plans include unlimited forms and Google Sheets connections."
    },
    {
      question: "Can I use conditional logic in my forms?",
      answer: "Yes! Our visual flow builder lets you create conditional logic by dragging boxes and connecting arrows. Show or hide fields based on user responses without any coding required."
    },
    {
      question: "How secure is my data?",
      answer: "Your data is encrypted in transit and at rest. We use enterprise-grade security and are GDPR compliant. Your Google Sheets data stays in your Google account - we never store your form submissions on our servers."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id="faqs" 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#fff8e8" }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-16 right-16 w-32 h-32 rounded-full opacity-8"
          style={{ backgroundColor: "#fcd4f0" }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-24 left-20 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "#f95716" }}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "#2c5e2a" }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: "#442c02" }}
          >
            Frequently Asked Questions
          </h2>
          <p 
            className="text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
          >
            Everything you need to know about Shelfcue and how it can transform your workflow.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-lg border-2 overflow-hidden"
              style={{ borderColor: "#2c5e2a" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(44, 94, 42, 0.15)"
              }}
            >
              {/* Question */}
              <motion.button
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none"
                onClick={() => toggleFAQ(index)}
                whileTap={{ scale: 0.98 }}
              >
                <h3 
                  className="text-lg font-bold pr-4"
                  style={{ color: "#2c5e2a" }}
                >
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown 
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: "#2c5e2a" }}
                  />
                </motion.div>
              </motion.button>

              {/* Answer */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div 
                      className="px-8 pb-6 border-t-2"
                      style={{ borderColor: "#fff8e8" }}
                    >
                      <motion.p 
                        className="text-base leading-relaxed pt-4"
                        style={{ color: "#442c02" }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p 
            className="text-lg mb-6"
            style={{ color: "#442c02" }}
          >
            Still have questions? We're here to help!
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 transition-all duration-300"
              style={{ 
                borderColor: "#2c5e2a",
                color: "#2c5e2a",
                backgroundColor: "white"
              }}
            >
              Contact Support
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};