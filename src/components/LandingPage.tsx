"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/sections/Hero";
import { Benefits } from "@/components/sections/Benefits";
import { Demo } from "@/components/sections/Demo";
import { Comparison } from "@/components/sections/Comparison";
import { Pricing } from "@/components/sections/Pricing";
import { CTASection } from "@/components/sections/CTASection";
import { FAQs } from "@/components/sections/FAQs";
import { Footer } from "@/components/sections/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Benefits Section */}
        <Benefits />

        {/* Demo Section */}
        <Demo />

        {/* Comparison Section */}
        <Comparison />

        {/* Pricing Section */}
        <Pricing />

        {/* CTA Section */}
        <CTASection />

        {/* FAQs Section */}
        <FAQs />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}