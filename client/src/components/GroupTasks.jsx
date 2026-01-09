import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, User } from 'lucide-react';
import api from '../api/axios';

const GroupTasks = ({ groupId, members }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedUser, setAssignedUser] = useState(''); // Stores User ID
  const [loading, setLoading] = useState(true);

  // 1. Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await api.get(`/group-tasks/${groupId}`);
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load group tasks", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchTasks();
  }, [groupId]);

  // 2. Add New Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !assignedUser) return alert("Please select a user and enter a title");

    try {
      await api.post('/group-tasks', {
        groupId,
        title: newTaskTitle,
        assignedToId: assignedUser,
        dueDate: new Date() // Default to today for now, can add date picker later
      });
      setNewTaskTitle('');
      setAssignedUser('');
      fetchTasks(); // Refresh list
    } catch (err) {
      alert("Failed to assign task");
    }
  };

  // 3. Toggle Status (Done / To-Do)
  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Done' ? 'To-Do' : 'Done';
    try {
      // Optimistic Update (update UI instantly)
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      
      await api.put(`/group-tasks/${task._id}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status");
      fetchTasks(); // Revert on error
    }
  };

  // 4. Delete Task
  const handleDelete = async (taskId) => {
    if(!window.confirm("Delete this task?")) return;
    try {
      setTasks(prev => prev.filter(t => t._id !== taskId));
      await api.delete(`/group-tasks/${taskId}`);
    } catch (err) {
      console.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-blue-500" /> 
          Group Tasks
        </h3>
        <span className="text-xs text-gray-400 font-medium">{tasks.filter(t => t.status !== 'Done').length} Pending</span>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px] max-h-[400px]">
        {loading ? (
            <div className="text-center py-4 text-gray-400 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm italic">
                No tasks yet. Assign one below!
            </div>
        ) : (
            tasks.map(task => (
                <div key={task._id} className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    {/* Checkbox */}
                    <button onClick={() => toggleStatus(task)} className="text-gray-400 hover:text-blue-600 transition-colors">
                        {task.status === 'Done' ? <CheckCircle2 size={20} className="text-blue-500" /> : <Circle size={20} />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                            {task.title}
                        </p>
                    </div>

                    {/* Assignee Avatar */}
                    <div className="flex-shrink-0" title={`Assigned to ${task.assignedTo?.username}`}>
                        {task.assignedTo?.profilePic ? (
                            <img src={task.assignedTo.profilePic} alt="User" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                        ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                {task.assignedTo?.username?.[0] || "?"}
                            </div>
                        )}
                    </div>

                    {/* Delete (Hover only) */}
                    <button onClick={() => handleDelete(task._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))
        )}
      </div>

      {/* Add Task Input */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <form onSubmit={handleAddTask} className="flex gap-2">
           {/* Member Selector */}
           <div className="relative">
              <select 
                value={assignedUser} 
                onChange={(e) => setAssignedUser(e.target.value)}
                className="h-9 w-12 appearance-none opacity-0 absolute inset-0 cursor-pointer z-10"
                required
              >
                <option value="" disabled>Select User</option>
                {members.map(m => (
                    <option key={m._id} value={m._id}>{m.username}</option>
                ))}
              </select>
              
              {/* Custom Select UI (User Icon) */}
              <div className={`h-9 w-9 flex items-center justify-center rounded border transition-colors ${assignedUser ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-400'}`}>
                 <User size={16} />
              </div>
           </div>

           {/* Text Input */}
           <input 
             type="text" 
             placeholder="New task..." 
             className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
             value={newTaskTitle}
             onChange={(e) => setNewTaskTitle(e.target.value)}
           />

           {/* Submit */}
           <button 
             type="submit" 
             disabled={!newTaskTitle || !assignedUser}
             className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             <Plus size={18} />
           </button>
        </form>
        <div className="text-[10px] text-gray-400 mt-1 pl-1">
            {assignedUser ? `Assigning to: ${members.find(m => m._id === assignedUser)?.username}` : "Select a member to assign"}
        </div>
      </div>

    </div>
  );
};

export default GroupTasks;