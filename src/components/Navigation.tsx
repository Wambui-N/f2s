"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = async () => {
    if (user) {
      // User is signed in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not signed in, trigger sign in
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Error signing in:", error);
      }
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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("hero")}
            className="text-xl font-semibold text-[#2c5e2a] hover:text-[#234b21] transition-colors"
          >
            ShelfCue
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Nav Links */}
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={item.action}
                className="text-gray-600 hover:text-[#2c5e2a] transition-colors"
              >
                {item.name}
              </button>
            ))}

            {/* CTA Button */}
            <Button
              onClick={handleGetStarted}
              className="bg-[#2c5e2a] hover:bg-[#234b21] text-white"
            >
              {user ? 'Dashboard' : 'Get Started'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#2c5e2a] transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:text-[#2c5e2a] transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="px-4 pt-2">
                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-[#2c5e2a] hover:bg-[#234b21] text-white"
                  >
                    {user ? 'Dashboard' : 'Get Started'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}