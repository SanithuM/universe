import React from "react";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Content */}
          <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v1.0 is now live
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Organize your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                entire academic life
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              UniVerse is the all-in-one workspace for students. Track assignments, calculate grades, and manage your schedule in one beautiful interface.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Get Started for Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64",
                  "https://images.unsplash.com/photo-1521119989659-a83eee488058?auto=format&fit=crop&w=64&h=64"
                ].map((url, i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src={url}
                    alt={`User ${i + 1}`}
                  />
                ))}
              </div>
              <p>Trusted by 10,000+ students</p>
            </div>
          </div>

          {/* Right Visual (3D Tilt Effect) */}
          <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
            <div className="relative w-full max-w-lg transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out preserve-3d">
              {/* Main App Window */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?q=80&w=1000&auto=format&fit=crop"
                  alt="App Interface"
                  className="w-full h-auto object-cover"
                />

                {/* Floating Elements */}
                <div className="absolute -right-12 top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-float-slow hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Task Completed</p>
                      <p className="text-sm font-bold text-gray-900">Physics Lab Report</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-float-delayed hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Upcoming Deadline</p>
                      <p className="text-sm font-bold text-gray-900">Calculus Final</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Decorative Blur Behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 blur-3xl -z-10 rounded-full"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
