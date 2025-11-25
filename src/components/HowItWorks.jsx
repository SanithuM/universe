import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Import your Syllabus",
      desc: "Upload your course PDF or manually enter your schedule. UniVerse extracts dates and weights instantly."
    },
    {
      num: "02",
      title: "Get Your Priority Score",
      desc: "Our engine analyzes due dates and grade weights to tell you exactly what to work on right now."
    },
    {
      num: "03",
      title: "Execute & Track",
      desc: "Check off tasks, watch your progress bars fill up, and see your predicted GPA rise in real-time."
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden" id="howitworks">
      {/* Decorative Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent hidden lg:block"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            From Chaos to Clarity
          </h2>
          <p className="text-lg text-gray-600">
            Three simple steps to take control of your semester.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step Number Circle */}
              <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center text-xl font-bold text-indigo-600 mb-8 relative z-10 ring-4 ring-gray-50 group-hover:scale-110 group-hover:ring-indigo-50 transition-all duration-300">
                {step.num}
              </div>

              {/* Content */}
              <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
