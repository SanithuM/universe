import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GroupRoom = () => {
    const { id } = useParams(); // Get group ID from URL
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState('');
    const navigate = useNavigate();

    // Fetch Group Data
    const fetchGroupData = async () => {
        try {
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data);
            setLoading(false);
        } catch (err) {
            alert("Access Denied or Group Not Found");
            navigate('/groups');
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    // Add Task Function
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            await api.post(`/groups/${id}/tasks`, { title: newTask });
            setNewTask('');
            fetchGroupData(); // Refresh to see new task
        } catch (err) {
            console.error(err);
        }
    };

    // Toggle Task Function
    const handleToggleTask = async (taskId) => {
        try {
            await api.put(`/groups/${id}/tasks/${taskId}`);
            fetchGroupData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Team Data...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">

            {/* SIDEBAR: Info & Members */}
            <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6 flex-shrink-0">
                <button onClick={() => navigate('/groups')} className="text-sm text-gray-500 hover:text-indigo-600 mb-6">
                    ← Back to Lobby
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 break-words">{group.name}</h1>
                    <div className="mt-4 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-center">
                        <p className="text-xs text-indigo-500 uppercase font-bold tracking-wider">Invite Code</p>
                        <p className="text-xl font-mono font-bold text-indigo-700">{group.inviteCode}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Team Members ({group.members.length})</h3>
                    <ul className="space-y-2">
                        {group.members.map(member => (
                            <li key={member._id} className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                                {member.username}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* MAIN: Shared Tasks */}
            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span>🚀</span> Project Tasks
                    </h2>

                    {/* Add Task Input */}
                    <form onSubmit={handleAddTask} className="mb-8 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="What does the team need to do?"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">
                            Add
                        </button>
                    </form>

                    {/* Task List */}
                    <div className="space-y-3">
                        {group.tasks.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                                No tasks yet. Start collaborating!
                            </div>
                        )}

                        {group.tasks.map(task => (
                            <div
                                key={task._id}
                                className={`flex items-center p-4 bg-white border rounded-lg transition-all ${task.status === 'Done' ? 'opacity-50 bg-gray-50' : 'hover:shadow-md border-gray-200'
                                    }`}
                            >
                                <button
                                    onClick={() => handleToggleTask(task._id)}
                                    className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-green-500'
                                        }`}
                                >
                                    {task.status === 'Done' && <span className="text-white text-xs">✓</span>}
                                </button>

                                <span className={`flex-1 font-medium ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {task.title}
                                </span>

                                <span className="text-xs text-gray-400">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default GroupRoom;