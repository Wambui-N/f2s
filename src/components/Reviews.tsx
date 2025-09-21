"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function Reviews() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechFlow Inc.",
      content: "Shelfcue has revolutionized how we handle lead generation. What used to take hours of manual data entry now happens automatically. Our team can focus on what matters most - closing deals.",
      rating: 5,
      avatar: "SJ",
      color: "#f95716"
    },
    {
      name: "Michael Chen", 
      role: "Operations Manager",
      company: "StartupXYZ",
      content: "The setup was incredibly simple. Within minutes, our contact forms were automatically populating our Google Sheets. The real-time sync feature is a game-changer for our small team.",
      rating: 5,
      avatar: "MC",
      color: "#2c5e2a"
    },
    {
      name: "Emily Rodriguez",
      role: "Event Coordinator", 
      company: "EventPro Solutions",
      content: "Managing event registrations became so much easier with Shelfcue. We can see all our attendees in one organized spreadsheet instantly. Customer support is also fantastic!",
      rating: 5,
      avatar: "ER",
      color: "#442c02"
    },
    {
      name: "David Park",
      role: "CEO",
      company: "InnovateLab", 
      content: "As a startup founder, I needed a solution that was both powerful and easy to use. Shelfcue delivers exactly that. It's saved us countless hours and eliminated human error.",
      rating: 5,
      avatar: "DP",
      color: "#f95716"
    },
    {
      name: "Lisa Thompson",
      role: "HR Manager",
      company: "GlobalTech",
      content: "We use Shelfcue for our job applications and employee feedback forms. The automatic organization into Google Sheets makes our HR processes so much more efficient.",
      rating: 5,
      avatar: "LT", 
      color: "#2c5e2a"
    },
    {
      name: "Alex Kumar",
      role: "Sales Manager",
      company: "SalesForce Pro",
      content: "The integration with Google Sheets is seamless. Our sales team can access lead data instantly, and the automatic formatting makes everything look professional and organized.",
      rating: 5,
      avatar: "AK",
      color: "#442c02"
    },
  ];

  const stats = [
    { value: "4.9/5", label: "Average Rating", color: "#f95716" },
    { value: "10K+", label: "Happy Customers", color: "#2c5e2a" },
    { value: "99.9%", label: "Uptime", color: "#442c02" },
    { value: "24/7", label: "Support", color: "#f95716" }
  ];

  return (
    <section
      id="reviews"
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#fcd4f0" }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-16 w-40 h-40 rounded-full opacity-15"
          style={{ backgroundColor: "#fff8e8" }}
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
          className="absolute bottom-32 right-20 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: "#2c5e2a" }}
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: "#442c02" }}
          >
            Loved by Thousands
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: "#442c02" }}
          >
            See what our customers are saying about Shelfcue. Join thousands of satisfied users 
            who've transformed their workflow.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="text-center p-6 bg-white rounded-2xl shadow-lg border-2 border-white"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div 
                className="font-medium"
                style={{ color: "#442c02" }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-xl border-2 border-white hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                scale: 1.02
              }}
            >
              {/* Quote Icon */}
              <motion.div 
                className="absolute top-4 right-4 opacity-10"
                whileHover={{ scale: 1.2, opacity: 0.2 }}
              >
                <Quote className="w-12 h-12" style={{ color: testimonial.color }} />
              </motion.div>

              {/* Rating */}
              <motion.div 
                className="flex mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                viewport={{ once: true }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) + (i * 0.05) }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Content */}
              <motion.p 
                className="text-base leading-relaxed mb-8"
                style={{ color: "#442c02" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                viewport={{ once: true }}
              >
                "{testimonial.content}"
              </motion.p>

              {/* Author */}
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 + (index * 0.1) }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg"
                  style={{ backgroundColor: testimonial.color }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <div 
                    className="font-bold text-lg"
                    style={{ color: "#442c02" }}
                  >
                    {testimonial.name}
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: "#442c02" }}
                  >
                    {testimonial.role}
                  </div>
                  <div 
                    className="text-sm font-semibold"
                    style={{ color: testimonial.color }}
                  >
                    {testimonial.company}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p 
            className="text-lg mb-8 font-medium"
            style={{ color: "#442c02" }}
          >
            Trusted by companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {["Google Partner", "Microsoft Certified", "Salesforce Ready", "HubSpot Connect", "Zapier Compatible"].map((badge, index) => (
              <motion.div 
                key={badge}
                className="text-2xl font-bold"
                style={{ color: "#442c02" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                viewport={{ once: true }}
                whileHover={{ y: -3, opacity: 0.8 }}
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}