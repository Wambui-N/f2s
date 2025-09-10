"use client";

export default function Comparison() {
  const features = [
    {
      feature: "Google Sheets Integration",
      formToSheets: "✓ Native Database",
      zapier: "✗ Add-on Only",
      googleForms: "✓ Built-in",
      typeform: "✗ Manual Export",
      jotform: "✗ Manual Export"
    },
    {
      feature: "Two-way Sync",
      formToSheets: "✓ Edit in Sheets → Form Updates",
      zapier: "✗ One-way Only",
      googleForms: "✗ No Sync",
      typeform: "✗ No Sync",
      jotform: "✗ No Sync"
    },
    {
      feature: "Beautiful Forms",
      formToSheets: "✓ Branded by Default",
      zapier: "✗ Ugly Forms",
      googleForms: "✗ Google Styling",
      typeform: "✓ Paid Plans Only",
      jotform: "✓ Paid Plans Only"
    },
    {
      feature: "File Uploads",
      formToSheets: "✓ Auto-organized in Drive",
      zapier: "✗ Complex Setup",
      googleForms: "✗ Limited Storage",
      typeform: "✓ Paid Plans",
      jotform: "✓ Paid Plans"
    },
    {
      feature: "Conditional Logic",
      formToSheets: "✓ Visual Flow Builder",
      zapier: "✗ Complex Rules",
      googleForms: "✗ Basic Only",
      typeform: "✓ Complex Setup",
      jotform: "✓ Complex Setup"
    },
    {
      feature: "Sheet-based Validations",
      formToSheets: "✓ Dropdowns from Sheets",
      zapier: "✗ No Integration",
      googleForms: "✗ Limited Options",
      typeform: "✗ No Integration",
      jotform: "✗ No Integration"
    },
    {
      feature: "Small Business Focus",
      formToSheets: "✓ Built for SMBs",
      zapier: "✗ Enterprise Focus",
      googleForms: "✓ Free but Ugly",
      typeform: "✗ Enterprise Focus",
      jotform: "✗ Enterprise Focus"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Google Sheets Native vs. Everyone Else
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            While others treat Google Sheets as an add-on, we make it your native database. 
            See the difference that real integration makes.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 bg-blue-100">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🏆</span>
                      FormToSheets
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Zapier</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Google Forms</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Typeform</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Jotform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {features.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.feature}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-blue-600 bg-blue-50">
                      {item.formToSheets}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{item.zapier}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{item.googleForms}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{item.typeform}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{item.jotform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Native Database</h3>
            <p className="text-gray-600">
              Google Sheets isn't an add-on—it's your database. Two-way sync, real-time updates, and validations from Sheets.
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful by Default</h3>
            <p className="text-gray-600">
              Every form looks professional and branded. No ugly Google Forms styling or paid plan restrictions.
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Flow Builder</h3>
            <p className="text-gray-600">
              Drag boxes, connect arrows, done. Conditional logic that small businesses understand without a manual.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Make the Switch?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of users who've simplified their workflow with FormToSheets
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
