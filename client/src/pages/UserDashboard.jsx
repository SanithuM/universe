import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AddTaskForm from '../components/AddTaskFrom';

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

    // 2. Logout Function
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full bg-white text-[#37352f] font-sans selection:bg-[#cce9ff]">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-60' : 'w-0'} bg-[#F7F7F5] border-r border-[#E9E9E7] flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}>
                {/* Sidebar Header */}
                <div className="p-3 hover:bg-[#EFEFEF] cursor-pointer transition-colors flex items-center gap-2 m-1 rounded-md">
                    <div className="w-5 h-5 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">U</div>
                    <span className="text-sm font-medium truncate">UniVerse Workspace</span>
                </div>

                {/* Sidebar Menu */}
                <div className="flex-1 overflow-y-auto px-1 py-2 space-y-0.5">
                    <SidebarItem icon="🔍" label="Search" />
                    <SidebarItem icon="🕒" label="Updates" />
                    <SidebarItem icon="⚙️" label="Settings" />
                    
                    {/* Trigger Add Task Modal */}
                    <div onClick={() => setShowAddForm(true)}> 
                        <SidebarItem icon="➕" label="Add New Task" />
                    </div>

                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500">Private</div>
                    <SidebarItem icon="✅" label="Task List" active />
                    <SidebarItem icon="📅" label="Course Schedule" />
                </div>

                {/* Sidebar Footer (Logout) */}
                <div className="p-2 border-t border-[#E9E9E7]">
                    <div onClick={handleLogout} className="px-3 py-1 text-xs text-red-500 hover:bg-[#EFEFEF] rounded cursor-pointer flex items-center gap-2">
                        🚪 Log Out
                    </div>
                </div>
            </aside>

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

// --- Sub Components ---

function SidebarItem({ icon, label, active }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1 min-h-[28px] text-sm rounded cursor-pointer select-none transition-colors ${active ? 'bg-[#EFEFEF] text-[#37352f] font-medium' : 'text-gray-600 hover:bg-[#EFEFEF]'
            }`}>
            <span className="text-base opacity-80">{icon}</span>
            <span className="truncate">{label}</span>
        </div>
    );
}

// Updated Row to match your Data Model
function DatabaseRow({ name, course, date, score }) {
    // Dynamic color for Priority Score
    const getScoreColor = (s) => {
        if (s > 10) return "text-red-600 font-bold";
        if (s > 5) return "text-orange-600 font-semibold";
        return "text-green-600";
    };

    return (
        <div className="flex px-3 py-3 border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors items-center">
            <div className="w-1/3 font-medium text-gray-800">{name}</div>
            <div className="w-1/4">
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs border border-gray-200">
                    {course}
                </span>
            </div>
            <div className="w-1/6 text-gray-500 text-xs">{date}</div>
            <div className={`w-1/6 ${getScoreColor(score)}`}>
                {score}
            </div>
        </div>
    )
}