"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import Comparison from "@/components/Comparison";
import Reviews from "@/components/Reviews";
import { Pricing } from "@/components/Pricing";
import { FAQs } from "@/components/FAQs";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">
        <Hero />
        <Features />
        <InteractiveDemo />
        <Comparison />
        <Reviews />
        <Pricing />
        <FAQs />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}