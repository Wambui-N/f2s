"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => scrollToSection("hero")}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:bg-transparent"
            >
              ShelfCue
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Button
                variant="ghost"
                onClick={() => scrollToSection("pricing")}
                className="text-muted-foreground hover:text-primary"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("faqs")}
                className="text-muted-foreground hover:text-primary"
              >
                FAQs
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("reviews")}
                className="text-muted-foreground hover:text-primary"
              >
                Reviews
              </Button>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t">
              <Button
                variant="ghost"
                onClick={() => scrollToSection("pricing")}
                className="w-full justify-start text-muted-foreground hover:text-primary"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("faqs")}
                className="w-full justify-start text-muted-foreground hover:text-primary"
              >
                FAQs
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("reviews")}
                className="w-full justify-start text-muted-foreground hover:text-primary"
              >
                Reviews
              </Button>
              <Button
                onClick={handleGetStarted}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
