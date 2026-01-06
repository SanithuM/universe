import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Clock, Settings, Plus, FileText, Users, CheckSquare, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import api from '../api/axios';

const SidebarItem = ({ icon, label, active }) => {
    const isEmoji = typeof icon === 'string';
    return (
        <div className={`
      group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors select-none text-sm
      ${active ? 'bg-[#EFEFEF] text-[#37352f] font-medium' : 'text-[#5F5E5B] hover:bg-[#EFEFEF]'}
    `}>
            <div className={`flex items-center justify-center w-5 h-5 flex-shrink-0 ${isEmoji ? 'text-lg leading-none' : 'text-gray-500'}`}>
                {icon}
            </div>
            <span className="truncate flex-1">{label}</span>
        </div>
    );
};

export default function Sidebar({ isOpen, onAddTask, onOpenSettings }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [notes, setNotes] = useState([]);
    const [user, setUser] = useState(null);

    // Fetch Notes
    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to fetch notes", err);
        }
    };

    // Fetch User
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
        fetchUser();
    }, []);

    const handleCreateNote = async () => {
        try {
            const res = await api.post('/notes');
            navigate(`/notes/${res.data._id}`);
        } catch (err) {
            console.error("Failed to create note", err);
        }
    };

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleLogout = () => {
        setShowLogoutDialog(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // FILTER FAVORITES
    const favoriteNotes = notes.filter(note => note.isFavorite);

    return (
        <aside className={`${isOpen ? 'w-60' : 'w-0'} bg-[#F7F7F5] border-r border-[#E9E9E7] flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col h-full`}>

            {/* Header */}
            <div className="p-3 hover:bg-[#EFEFEF] cursor-pointer transition-colors flex items-center gap-2 m-1 rounded-md">
                <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 relative">
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white">
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                </div>
                <span className="text-sm font-medium truncate">
                    {user ? `${user.username}'s Workspace` : 'UniVerse Workspace'}
                </span>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                <SidebarItem icon={<Search size={18} />} label="Search" />
                <SidebarItem icon={<Clock size={18} />} label="Updates" />

                <div onClick={() => onOpenSettings ? onOpenSettings() : navigate('/settings')}>
                    <SidebarItem icon={<Settings size={18} />} label="Settings" active={location.pathname === '/settings'} />
                </div>
                <div onClick={() => navigate('/calendar')}>
                    <SidebarItem icon={<CalendarIcon size={18} />} label="Calendar" active={location.pathname === '/calendar'} />
                </div>
                <div onClick={() => navigate('/groups')}>
                    <SidebarItem icon={<Users size={18} />} label="My Teams" active={location.pathname === '/groups'} />
                </div>

                {/* 👇 FAVORITES SECTION (Dynamic) */}
                <div className="mt-6 mb-1 px-3 text-xs font-semibold text-[#9B9A97]">Favorites</div>

                {favoriteNotes.length === 0 && (
                    <div className="px-3 text-xs text-gray-400 italic mb-2">No favorites yet</div>
                )}

                {favoriteNotes.map(note => (
                    <div key={note._id} onClick={() => navigate(`/notes/${note._id}`)}>
                        <SidebarItem
                            icon={note.icon || <FileText size={18} />} // Default icon if none set
                            label={note.title || "Untitled"}
                            active={location.pathname === `/notes/${note._id}`}
                        />
                    </div>
                ))}

                {/* Private Section */}
                <div className="mt-6 mb-1 px-3 flex items-center justify-between text-xs font-semibold text-[#9B9A97]">
                    <span>Private</span>
                    <button onClick={handleCreateNote} className="hover:bg-gray-200 p-0.5 rounded transition-colors">
                        <Plus size={14} />
                    </button>
                </div>

                <div onClick={onAddTask}>
                    <SidebarItem icon={<Plus size={18} />} label="Add New Task" />
                </div>

                <div onClick={() => navigate('/app')}>
                    <SidebarItem icon={<CheckSquare size={18} className="text-orange-600" />} label="Task List" active={location.pathname === '/app'} />
                </div>

                {/* All Notes List */}
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

            {/* Footer */}
            <div className="p-2 border-t border-[#E9E9E7]">
                <div onClick={handleLogout} className="px-3 py-1 text-xs text-red-500 hover:bg-[#EFEFEF] rounded cursor-pointer flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Log Out</span>
                </div>
            </div>

            {showLogoutDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[320px] overflow-hidden flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 pb-2 flex flex-col items-center text-center">
                            <div className="w-12 h-12 mb-3 relative">
                                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-100">
                                    {user?.profilePic ? (
                                        <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                                    <LogOut size={12} className="text-gray-500" />
                                </div>
                            </div>

                            <h3 className="text-[17px] font-semibold text-[#111] mb-2 leading-tight">
                                Log out of your account?
                            </h3>
                            <p className="text-[13px] text-gray-500 leading-normal mb-2">
                                You will need to log back in to access your UniVerse workspaces.
                            </p>
                        </div>

                        <div className="w-full p-3 pt-0 flex flex-col gap-2">
                            <button
                                onClick={confirmLogout}
                                className="w-full py-2 px-4 bg-[#E03E3E] hover:bg-[#C93535] text-white text-[14px] font-medium rounded transition-colors shadow-sm"
                            >
                                Log out
                            </button>
                            <button
                                onClick={() => setShowLogoutDialog(false)}
                                className="w-full py-2 px-4 bg-white border border-[#D9D9D9] hover:bg-[#F7F7F5] text-[#37352F] text-[14px] font-medium rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    );
}