"use client";

export default function Reviews() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechFlow Inc.",
      content:
        "FormToSheets has revolutionized how we handle lead generation. What used to take hours of manual data entry now happens automatically. Our team can focus on what matters most - closing deals.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      company: "StartupXYZ",
      content:
        "The setup was incredibly simple. Within minutes, our contact forms were automatically populating our Google Sheets. The real-time sync feature is a game-changer for our small team.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Event Coordinator",
      company: "EventPro Solutions",
      content:
        "Managing event registrations became so much easier with FormToSheets. We can see all our attendees in one organized spreadsheet instantly. Customer support is also fantastic!",
      rating: 5,
      avatar: "ER",
    },
    {
      name: "David Park",
      role: "CEO",
      company: "InnovateLab",
      content:
        "As a startup founder, I needed a solution that was both powerful and easy to use. FormToSheets delivers exactly that. It's saved us countless hours and eliminated human error.",
      rating: 5,
      avatar: "DP",
    },
    {
      name: "Lisa Thompson",
      role: "HR Manager",
      company: "GlobalTech",
      content:
        "We use FormToSheets for our job applications and employee feedback forms. The automatic organization into Google Sheets makes our HR processes so much more efficient.",
      rating: 5,
      avatar: "LT",
    },
    {
      name: "Alex Kumar",
      role: "Sales Manager",
      company: "SalesForce Pro",
      content:
        "The integration with Google Sheets is seamless. Our sales team can access lead data instantly, and the automatic formatting makes everything look professional and organized.",
      rating: 5,
      avatar: "AK",
    },
  ];

  return (
    <section
      id="reviews"
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Loved by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our customers are saying about FormToSheets. Join thousands
            of satisfied users who've transformed their workflow.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-blue-600">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Trusted by companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">Microsoft</div>
            <div className="text-2xl font-bold text-gray-400">Salesforce</div>
            <div className="text-2xl font-bold text-gray-400">HubSpot</div>
            <div className="text-2xl font-bold text-gray-400">Zapier</div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
            Start Your Free Trial
          </button>
          <p className="text-gray-600 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </div>
    </section>
  );
}
