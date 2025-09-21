"use client";

import { motion } from "framer-motion";
import { FileText, Mail, Twitter, Github, Linkedin, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", action: () => scrollToSection("features") },
        { name: "Pricing", action: () => scrollToSection("pricing") },
        { name: "Demo", action: () => scrollToSection("demo") },
        { name: "Comparison", action: () => scrollToSection("comparison") }
      ]
    },
    {
      title: "Support", 
      links: [
        { name: "Help Center", action: () => scrollToSection("faqs") },
        { name: "Documentation", action: () => {} },
        { name: "Contact Us", action: () => {} },
        { name: "Status Page", action: () => {} }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", action: () => {} },
        { name: "Blog", action: () => {} },
        { name: "Careers", action: () => {} },
        { name: "Press", action: () => {} }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Mail className="w-5 h-5" />, href: "mailto:hello@shelfcue.com", label: "Email" },
    { icon: <Twitter className="w-5 h-5" />, href: "https://twitter.com/shelfcue", label: "Twitter" },
    { icon: <Github className="w-5 h-5" />, href: "https://github.com/shelfcue", label: "GitHub" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com/company/shelfcue", label: "LinkedIn" }
  ];

  return (
    <motion.footer 
      className="relative overflow-hidden"
      style={{ backgroundColor: "#2c5e2a" }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-10 right-20 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "#fcd4f0" }}
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
          className="absolute bottom-16 left-16 w-24 h-24 rounded-full opacity-15"
          style={{ backgroundColor: "#fff8e8" }}
          animate={{ 
            y: [-10, 10, -10],
            x: [-5, 5, -5]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Section */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="mb-6 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-10 w-10 text-white mr-3" />
              </motion.div>
              <span className="text-3xl font-bold text-white">
                Shelfcue
              </span>
            </motion.div>
            
            <p className="text-green-100 mb-8 text-lg leading-relaxed max-w-md">
              Transform any form submission into organized Google Sheets automatically. 
              No coding required. No complex setup. Just pure simplicity.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.1, 
                    y: -3,
                    backgroundColor: "rgba(255, 255, 255, 0.2)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  viewport={{ once: true }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (sectionIndex * 0.1) }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                    viewport={{ once: true }}
                  >
                    <motion.button
                      onClick={link.action}
                      className="text-green-100 hover:text-white transition-all duration-300 text-left"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-green-700 mt-16 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-green-100 text-lg mb-4 md:mb-0">
              © 2024 Shelfcue. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex space-x-6">
                {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="text-green-100 hover:text-white text-sm transition-all duration-300"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.0 + (index * 0.1) }}
                    viewport={{ once: true }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
              
              {/* Scroll to Top Button */}
              <motion.button
                onClick={scrollToTop}
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                whileHover={{ 
                  scale: 1.1, 
                  y: -3,
                  backgroundColor: "rgba(255, 255, 255, 0.2)"
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                viewport={{ once: true }}
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="mt-12 pt-8 border-t border-green-700"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <p className="text-green-100 text-sm mb-6">
              Trusted by thousands of businesses worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["SOC 2 Compliant", "GDPR Ready", "99.9% Uptime", "24/7 Support"].map((badge, index) => (
                <motion.div 
                  key={badge}
                  className="text-green-100 font-semibold text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + (index * 0.1) }}
                  viewport={{ once: true }}
                  whileHover={{ y: -2 }}
                >
                  {badge}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}