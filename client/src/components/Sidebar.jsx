import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Clock, Settings, Plus, FileText, Users, CheckSquare, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import api from '../api/axios';

const SidebarItem = ({ icon, label, active }) => {
    // Check if the icon is a string (Emoji) or a Component (SVG)
    const isEmoji = typeof icon === 'string';

    return (
        <div className={`
      group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors select-none text-sm
      ${active ? 'bg-[#EFEFEF] text-[#37352f] font-medium' : 'text-[#5F5E5B] hover:bg-[#EFEFEF]'}
    `}>
            {/* Icon Container */}
            <div className={`
        flex items-center justify-center w-5 h-5 flex-shrink-0
        ${isEmoji ? 'text-lg leading-none' : 'text-gray-500'}
      `}>
                {icon}
            </div>

            {/* Label */}
            <span className="truncate flex-1">
                {label}
            </span>
        </div>
    );
};

export default function Sidebar({ isOpen, onAddTask }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [notes, setNotes] = useState([]);
    
    // State to store user data
    const [user, setUser] = useState(null);

    // Fetch Notes from backend
    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to fetch notes", err);
        }
    };

    // Function to fetch user data
    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user data", err);
        }
    };

    useEffect(() => {
        fetchNotes();
        fetchUser(); // Call fetchUser on mount
    }, []);

    const handleCreateNote = async () => {
        try {
            const res = await api.post('/notes'); // Creates an empty note
            navigate(`/notes/${res.data._id}`); // Redirect to the editor
        } catch (err) {
            console.error("Failed to create note", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <aside className={`${isOpen ? 'w-60' : 'w-0'} bg-[#F7F7F5] border-r border-[#E9E9E7] flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col h-full`}>
            
            {/* Sidebar Header with User Profile & Name */}
            <div className="p-3 hover:bg-[#EFEFEF] cursor-pointer transition-colors flex items-center gap-2 m-1 rounded-md">
                <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 relative">
                    {user?.profilePic ? (
                        // Show profile picture if available
                        <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        // Fallback to initial if no picture
                        <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white">
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                </div>
                <span className="text-sm font-medium truncate">
                    {user ? `${user.username}'s Workspace` : 'UniVerse Workspace'}
                </span>
            </div>

            {/* Sidebar Menu */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">

                {/* UI SECTIONS: Use Lucide Icons */}
                <SidebarItem icon={<Search size={18} />} label="Search" />
                <SidebarItem icon={<Clock size={18} />} label="Updates" />

                <div onClick={() => navigate('/settings')}>
                    <SidebarItem icon={<Settings size={18} />} label="Settings" active={location.pathname === '/settings'} />
                </div>

                <div onClick={() => navigate('/calendar')}>
                    <SidebarItem icon={<CalendarIcon size={18} />} label="Calendar" active={location.pathname === '/calendar'} />
                </div>

                <div onClick={() => navigate('/groups')}>
                    <SidebarItem icon={<Users size={18} />} label="My Teams" active={location.pathname === '/groups'} />
                </div>

                {/* Favorites */}
                <div className="mt-6 mb-1 px-3 text-xs font-semibold text-[#9B9A97]">Favorites</div>
                {/* Example of a Favorite Page */}
                <SidebarItem icon="⛩️" label="Best Anime to Watch" />

                {/* Private */}
                <div className="mt-6 mb-1 px-3 text-xs font-semibold text-[#9B9A97]">Private</div>

                <div onClick={onAddTask}>
                    <SidebarItem icon={<Plus size={18} />} label="Add New Task" />
                </div>

                <div onClick={() => navigate('/app')}>
                    <SidebarItem icon={<CheckSquare size={18} className="text-orange-600" />} label="Task List" active={location.pathname === '/app'} />
                </div>


                {/* Private / Notes Section */}
                <div className="mt-6 mb-1 px-3 flex items-center justify-between text-xs font-semibold text-[#9B9A97]">
                    <span>Private</span>
                    <button onClick={handleCreateNote} className="hover:bg-gray-200 p-0.5 rounded">
                        <Plus size={14} />
                    </button>
                </div>

                {/* List of Notes */}
                {notes.map(note => (
                    <div key={note._id} onClick={() => navigate(`/notes/${note._id}`)}>
                        <SidebarItem
                            icon={note.icon || <FileText size={18} />}
                            label={note.title || "Untitled"}
                            active={location.pathname === `/notes/${note._id}`}
                        />
                    </div>
                ))}
            </div>

            {/* Sidebar Footer (Logout) */}
            <div className="p-2 border-t border-[#E9E9E7]">
                <div onClick={handleLogout} className="px-3 py-1 text-xs text-red-500 hover:bg-[#EFEFEF] rounded cursor-pointer flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Log Out</span>
                </div>
            </div>
        </aside>
    );
}