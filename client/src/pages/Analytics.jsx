import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { CheckCircle, Clock, TrendingUp, Target } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Analytics() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Tasks from Backend to calculate stats
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/assignments');
        setAssignments(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Initialize sidebar visibility based on screen size and update on resize
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DYNAMIC DATA CALCULATION FOR CHARTS ---
  const completedTasksCount = assignments.filter(t => t.status === 'Done').length;
  const pendingTasksCount = assignments.filter(t => t.status !== 'Done').length;
  
  const taskStatusData = [
    { name: 'Completed', value: completedTasksCount },
    { name: 'To-Do', value: pendingTasksCount },
  ];

  const COLORS = ['#2383e2', '#f59e0b']; // Blue for Completed, Amber for To-Do

  // Calculate Tasks Due by Day of the Week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = [
    { name: 'Mon', tasks: 0 }, { name: 'Tue', tasks: 0 }, { name: 'Wed', tasks: 0 },
    { name: 'Thu', tasks: 0 }, { name: 'Fri', tasks: 0 }, { name: 'Sat', tasks: 0 }, { name: 'Sun', tasks: 0 }
  ];

  let totalScore = 0;
  assignments.forEach(task => {
    if (task.status !== 'Done' && task.dueDate) {
      const date = new Date(task.dueDate);
      const dayName = daysOfWeek[date.getDay()];
      const dayIndex = weeklyData.findIndex(d => d.name === dayName);
      if(dayIndex !== -1) weeklyData[dayIndex].tasks += 1;
    }
    if (task.priorityScore) totalScore += task.priorityScore;
  });

  const averageFocusScore = assignments.length > 0 ? Math.min(Math.round((totalScore / assignments.length) * 10), 100) : 0;

  return (
    <div className="flex h-screen w-full bg-white text-[#37352f] font-sans selection:bg-[#cce9ff]">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-11 flex items-center justify-between px-3 flex-shrink-0 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 rounded md:hidden">
              {isSidebarOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
            <span className="flex items-center gap-1 cursor-pointer">
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-[1000px] mx-auto px-4 md:px-12 pb-32 pt-12">
            
            <div className="mb-8 mt-4">
              <h1 className="text-2xl md:text-4xl font-bold text-[#37352f]">Progress & Analytics</h1>
              <p className="text-gray-500 mt-2">Track your academic velocity and focus levels.</p>
            </div>

            {loading ? (
              <div className="text-gray-400 italic">Crunching the numbers...</div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Target size={20} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tasks</p>
                      <p className="text-xl font-bold text-gray-900">{assignments.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
                      <p className="text-xl font-bold text-gray-900">{completedTasksCount}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Clock size={20} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
                      <p className="text-xl font-bold text-gray-900">{pendingTasksCount}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Focus Score</p>
                      <p className="text-xl font-bold text-gray-900">{averageFocusScore}%</p>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  
                  {/* Bar Chart */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">Pending Tasks Due This Week</h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                          <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="tasks" fill="#2383e2" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Task Status</h3>
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Custom Legend */}
                    <div className="flex justify-center gap-4 mt-2">
                      {taskStatusData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                          <span className="text-xs font-medium text-gray-600">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}