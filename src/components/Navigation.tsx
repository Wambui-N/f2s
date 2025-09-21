"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Menu, X, Sparkles } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signInWithGoogle } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: "Features", action: () => scrollToSection("features") },
    { name: "Demo", action: () => scrollToSection("demo") },
    { name: "Pricing", action: () => scrollToSection("pricing") },
    { name: "FAQ", action: () => scrollToSection("faqs") }
  ];

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b-2"
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#2c5e2a"
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              onClick={() => scrollToSection("hero")}
              className="flex items-center space-x-3 text-2xl font-bold hover:bg-transparent p-0"
              style={{ color: "#442c02" }}
            >
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#2c5e2a" }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="bg-gradient-to-r from-[#2c5e2a] to-[#f95716] bg-clip-text text-transparent">
                Shelfcue
              </span>
            </Button>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
                >
                  <Button
                    variant="ghost"
                    onClick={item.action}
                    className="text-lg font-medium hover:bg-transparent relative group"
                    style={{ color: "#442c02" }}
                  >
                    {item.name}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: "#f95716" }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                className="text-lg font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ 
                  backgroundColor: "#f95716",
                  color: "white"
                }}
              >
                Start Free
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.div
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
                style={{ color: "#442c02" }}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden border-t-2"
              style={{ borderColor: "#2c5e2a" }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="px-4 pt-4 pb-6 space-y-4 rounded-b-2xl"
                style={{ backgroundColor: "#fff8e8" }}
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={item.action}
                      className="w-full justify-start text-lg font-medium py-3 rounded-xl hover:bg-white/50"
                      style={{ color: "#442c02" }}
                    >
                      {item.name}
                    </Button>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="pt-4"
                >
                  <Button
                    onClick={handleGetStarted}
                    className="w-full text-lg font-semibold py-4 rounded-2xl shadow-lg"
                    style={{ 
                      backgroundColor: "#f95716",
                      color: "white"
                    }}
                  >
                    Start Free
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}