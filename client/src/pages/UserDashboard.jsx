import Sidebar from '../components/Sidebar';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Search, Clock, Settings, Plus, FileText, Users, CheckSquare, Calendar as CalendarIcon, LogOut } from 'lucide-react';

export default function UserDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
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
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onAddTask={() => setShowAddForm(true)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-11 flex items-center justify-between px-3 flex-shrink-0 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-200 rounded">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <span className="flex items-center gap-1 cursor-pointer">
              <span className="text-lg">✅</span>
              <span>Task List</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto px-12 pb-32 pt-12">

            {/* Title */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-[#37352f]">
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

            {/* Real Database Table */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 flex uppercase tracking-wide">
                <div className="w-1/3">Task Name</div>
                <div className="w-1/4">Course</div>
                <div className="w-1/6">Due Date</div>
                <div className="w-1/6">Priority Score</div>
              </div>

              {assignments.length > 0 ? (
                assignments.map((task) => (
                  <DatabaseRow
                    key={task._id}
                    name={task.title}
                    course={task.courseName}
                    date={new Date(task.dueDate).toLocaleDateString()}
                    score={task.priorityScore}
                    task={task} // <--- Pass the whole task object now
                    onStatusChange={handleStatusChange} // <--- Pass function
                    onDelete={handleDelete} // <--- Pass function
                  />
                ))
              ) : (
                !loading && <div className="p-4 text-center text-gray-400 text-sm">No tasks found. Add one!</div>
              )}
            </div>

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
      </main>
    </div>
  );
}



// Updated Row to match your Data Model
function DatabaseRow({ task, onStatusChange, onDelete }) {
  // Dynamic color for Priority Score
  const getScoreColor = (s) => {
    if (task.status === 'Done') return "text-gray-400 line-through"; // Grey out if done
    if (s > 10) return "text-red-600 font-bold";
    if (s > 5) return "text-orange-600 font-semibold";
    return "text-green-600";
  };

  return (
    <div className="flex px-3 py-3 border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors items-center group">
      {/* 1. Name Column with Checkbox */}
      <div className="w-1/3 font-medium text-gray-800 flex items-center gap-3">
        <button
          onClick={() => onStatusChange(task._id, task.status)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${task.status === 'Done' ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-500'}
                    `}
        >
          {task.status === 'Done' && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          )}
        </button>
        <span className={task.status === 'Done' ? "line-through text-gray-400" : ""}>
          {task.title}
        </span>
      </div>

      {/* 2. Course Column */}
      <div className="w-1/4">
        <span className={`px-1.5 py-0.5 rounded text-xs border ${task.status === 'Done' ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
          {task.courseName}
        </span>
      </div>

      {/* 3. Due Date */}
      <div className="w-1/6 text-gray-500 text-xs">
        {new Date(task.dueDate).toLocaleDateString()}
      </div>

      {/* 4. Priority Score */}
      <div className={`w-1/6 ${getScoreColor(task.priorityScore)}`}>
        {task.status === 'Done' ? 'DONE' : task.priorityScore}
      </div>

      {/* 5. Delete Action (Hidden until hover) */}
      <div className="w-10 opacity-0 group-hover:opacity-100 transition-opacity text-right">
        <button
          onClick={() => onDelete(task._id)}
          className="text-gray-400 hover:text-red-500 p-1"
          title="Delete Task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}