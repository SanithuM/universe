import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Settings from './Settings';
import AddTaskForm from '../components/AddTaskFrom';
import SmartNudge from '../components/SmartNudge';

export default function UserDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  // 1. Fetch Tasks from Backend
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

  useEffect(() => {
    fetchTasks();
  }, []);

  // Initialize sidebar visibility based on screen size and update on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Mark Task as Done/In-Progress
  const handleStatusChange = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'To-Do' : 'Done';
    try {
      await api.put(`/assignments/${taskId}`, { status: newStatus });
      fetchTasks(); // Refresh to update score/color
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // 4. Delete Task
  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/assignments/${taskId}`);
        fetchTasks();
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-[#37352f] font-sans selection:bg-[#cce9ff]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onAddTask={() => setShowAddForm(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-11 flex items-center justify-between px-3 flex-shrink-0 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {/* Mobile: toggle sidebar */}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 rounded md:hidden">
              {isSidebarOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <span className="flex items-center gap-1 cursor-pointer">
              <span className="text-lg">🧠</span>
              <span>Priorities</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto px-4 md:px-12 pb-32 pt-12">

            {/* 2. INSERT SMART NUDGE HERE 👇 */}
            {/* Only show if data is loaded. Nudge filters its own tasks. */}
            {!loading && <SmartNudge assignments={assignments} />}

            {/* Title */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-[#37352f]">
                Academic Priorities
              </h1>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                + New
              </button>
            </div>

            {/* Loading State */}
            {loading && <div className="text-gray-400 italic">Calculating priorities...</div>}

            {/* Real Database Grid */}
            {assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map((task) => (
                  <PriorityCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              !loading && <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">No tasks found. Click "+ New" to add one!</div>
            )}

            <div className="mt-12 text-gray-400 text-sm italic">
              * Scores are calculated based on Grade Weight ÷ Days Remaining
            </div>
          </div>
        </div>

        {/* Integration: The Add Task Modal */}
        {showAddForm && (
          <AddTaskForm
            onCancel={() => setShowAddForm(false)}
            onTaskAdded={() => {
              setShowAddForm(false);
              fetchTasks(); // Refresh list automatically
            }}
          />
        )}
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </main>
    </div>
  );
}

// Modern Card Component
function PriorityCard({ task, onStatusChange, onDelete }) {
  // Calculate days remaining
  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(task.dueDate);

  // Determine Priority Level
  const getPriority = (score) => {
    if (score > 10) return { label: 'HIGH', color: 'bg-red-50 text-red-600 border-red-100', progressColor: 'bg-red-500' };
    if (score > 5) return { label: 'MEDIUM', color: 'bg-orange-50 text-orange-600 border-orange-100', progressColor: 'bg-orange-500' };
    return { label: 'LOW', color: 'bg-green-50 text-green-600 border-green-100', progressColor: 'bg-green-500' };
  };

  const priority = getPriority(task.priorityScore);
  const isDone = task.status === 'Done';

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group ${isDone ? 'opacity-60' : ''}`}>
      {/* Delete Button (Hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onStatusChange(task._id, task.status)}
            className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors
              ${isDone ? 'bg-blue-500 border-blue-500' : 'border-gray-200 hover:border-blue-500'}
            `}
          >
            {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>
          <div>
            <h3 className={`font-bold text-lg text-[#37352f] leading-tight mb-1 ${isDone ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {task.courseName}
            </span>
          </div>
        </div>
        {!isDone && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${priority.color}`}>
            {priority.label}
          </span>
        )}
      </div>

      {/* Row 1: Due Date */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-gray-500 font-medium">Due Date</span>
        <div className={`flex items-center gap-1.5 font-semibold ${daysRemaining < 3 && !isDone ? 'text-red-500' : 'text-gray-700'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isDone ? 'Completed' : daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
        </div>
      </div>

      {/* Row 2: Weight */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <span className="text-gray-500 font-medium">Weight Impact</span>
        <span className="font-bold text-gray-900">{task.academicWeight || 0}%</span>
      </div>

      {/* Row 3: Priority Score */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <span className="text-gray-500 font-medium">Priority Score</span>
        <span className={`font-bold ${daysRemaining < 3 && !isDone ? 'text-red-600' : 'text-gray-900'}`}>
          {typeof task.priorityScore === 'number' ? task.priorityScore.toFixed(1) : task.priorityScore}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${priority.progressColor}`}
          style={{ width: `${Math.min(task.academicWeight || 0, 100)}%` }}
        />
      </div>
    </div>
  );
}