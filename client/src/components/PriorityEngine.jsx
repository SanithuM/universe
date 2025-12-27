import React from 'react';

export default function PriorityEngine() {
  const tasks = [
    { id: 1, name: 'Assignment 1', due: '2 days', weight: 30, priority: 'High', color: 'red' },
    { id: 2, name: 'Lab Report', due: '7 days', weight: 10, priority: 'Medium', color: 'yellow' },
    { id: 3, name: 'Group Project', due: '14 days', weight: 40, priority: 'High', color: 'red' },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gray-50" id="priority">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 blur-3xl"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/30 blur-3xl"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-200/30 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Academic Priority Engine
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            UniVerse automatically calculates a Priority Score for each task based on its weight and due date, nudging you to focus on what matters most.
          </p>
        </div>

        {/* Dashboard Container */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl ring-1 ring-black/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 hover:border-indigo-100"
              >
                {/* Priority Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${task.priority === 'High'
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                    : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                  }`}>
                  {task.priority}
                </div>

                {/* Task Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">{task.name}</h3>

                {/* Details */}
                <div className="space-y-5 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Due Date</span>
                    <span className={`font-semibold flex items-center gap-1.5 ${task.priority === 'High' ? 'text-red-600' : 'text-gray-700'
                      }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {task.due}
                    </span>
                  </div>

                  {/* Weight Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500 font-medium">Weight Impact</span>
                      <span className="font-bold text-gray-900">{task.weight}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${task.priority === 'High'
                            ? 'bg-gradient-to-r from-red-500 to-pink-500'
                            : 'bg-gradient-to-r from-amber-400 to-orange-400'
                          }`}
                        style={{ width: `${task.weight}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Hint */}
                  <div className="pt-4 border-t border-gray-50 flex items-center text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer / Legend */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> High Priority
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span> Medium Priority
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
