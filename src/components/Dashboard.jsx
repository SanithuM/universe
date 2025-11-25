import React from 'react';

export default function Dashboard() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="dashboard">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-50 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Your Command Center
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience a unified workspace where your academic life comes together.
            Beautifully designed, intuitively organized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <DashboardCard
            image="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=800&auto=format&fit=crop"
            title="Main Dashboard"
            description="All your tasks, grades, and schedules in one glance."
            color="blue"
          />
          <DashboardCard
            image="https://images.unsplash.com/photo-1596495577886-d920f6a60f0f?q=80&w=800&auto=format&fit=crop"
            title="Calendar View"
            description="Drag-and-drop planning for your semester."
            color="purple"
          />
          <DashboardCard
            image="https://images.unsplash.com/photo-1581090700227-8c57f726ad0c?q=80&w=800&auto=format&fit=crop"
            title="Analytics Hub"
            description="Track your GPA and study habits over time."
            color="indigo"
          />
        </div>
      </div>
    </section>
  );
}

function DashboardCard({ image, title, description, color }) {
  const colorClasses = {
    blue: "group-hover:shadow-blue-200/50",
    purple: "group-hover:shadow-purple-200/50",
    indigo: "group-hover:shadow-indigo-200/50",
  };

  return (
    <div className={`group relative flex flex-col transition-all duration-500 hover:-translate-y-2`}>
      {/* Window Frame */}
      <div className={`relative rounded-2xl overflow-hidden shadow-lg bg-gray-900 border border-gray-200 transition-shadow duration-500 ${colorClasses[color] || ''} group-hover:shadow-2xl`}>
        {/* Window Controls */}
        <div className="absolute top-0 left-0 right-0 h-9 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center px-4 z-20">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="mx-auto text-[10px] font-medium text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            {title}
          </div>
        </div>

        {/* Image Container */}
        <div className="relative pt-9 aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Text Content */}
      <div className="mt-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
