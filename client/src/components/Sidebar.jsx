import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Inbox, Settings, Plus, FileText, Users, Brain,
    Calendar as CalendarIcon, LogOut, MoreHorizontal, Star, Trash, Edit2, Share2
} from 'lucide-react';
import api from '../api/axios';
import SearchModal from './SearchModal';

const SidebarItem = ({ icon, label, active, count }) => {
    const isEmoji = typeof icon === 'string';
    return (
        <div className={`
      group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors select-none text-sm w-full
      ${active ? 'bg-[#EFEFEF] text-[#37352f] font-medium' : 'text-[#5F5E5B] hover:bg-[#EFEFEF]'}
    `}>
            <div className={`flex items-center justify-center w-5 h-5 shrink-0 ${isEmoji ? 'text-lg leading-none' : 'text-gray-500'}`}>
                {icon}
            </div>
            <span className="truncate flex-1 text-left">{label}</span>
            {count > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </div>
    );
};

export default function Sidebar({ isOpen, onAddTask, onOpenSettings }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [notes, setNotes] = useState([]);
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // State for the active dropdown menu
    const [activeMenuId, setActiveMenuId] = useState(null);
    const menuRef = useRef(null);

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

    // Fetch Unread Notifications
    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications');
            const unread = res.data.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotes();
        fetchUser();
        fetchUnreadCount();
    }, []);

    // Close Menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateNote = async () => {
        try {
            const res = await api.post('/notes');
            navigate(`/notes/${res.data._id}`);
            fetchNotes(); // Refresh list
        } catch (err) {
            console.error("Failed to create note", err);
        }
    };

    // Delete Note
    const handleDeleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (window.confirm("Delete this note permanently?")) {
            try {
                await api.delete(`/notes/${noteId}`);
                fetchNotes();
                if (location.pathname === `/notes/${noteId}`) {
                    navigate('/app');
                }
            } catch (err) {
                console.error("Failed to delete", err);
                alert(err.response?.data?.message || "Failed to delete note");
            }
        }
        setActiveMenuId(null);
    };

    // Toggle Favorite
    const handleToggleFavorite = async (e, note) => {
        e.stopPropagation();
        try {
            await api.put(`/notes/${note._id}`, { isFavorite: !note.isFavorite });
            fetchNotes();
        } catch (err) {
            console.error("Failed to toggle favorite", err);
        }
        setActiveMenuId(null);
    };

    // Rename Note
    const handleRenameNote = async (e, note) => {
        e.stopPropagation();
        const newTitle = prompt("Enter new name:", note.title);
        if (newTitle && newTitle.trim() !== "") {
            try {
                await api.put(`/notes/${note._id}`, { title: newTitle });
                fetchNotes();
            } catch (err) {
                console.error("Failed to rename", err);
            }
        }
        setActiveMenuId(null);
    };

    const handleLogout = () => {
        setShowLogoutDialog(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // FILTERING LOGIC
    // Safely get the user ID as a string
    const currentUserId = String(user?._id || user?.id || ""); 

    const favoriteNotes = notes.filter(note => note.isFavorite);
    
    // Safely compare strings
    const privateNotes = notes.filter(note => {
        if (!user) return false; // Don't show until user loads
        return String(note.userId) === currentUserId;
    });
    
    const sharedNotes = notes.filter(note => {
        if (!user) return false;
        return String(note.userId) !== currentUserId;
    });

    // --- Render Helper for Note List Item ---
    const renderNoteItem = (note) => {
        const isActive = location.pathname === `/notes/${note._id}`;
        const isMenuOpen = activeMenuId === note._id;
        const isOwner = note.userId === currentUserId; // Check ownership

        return (
            <div
                key={note._id}
                className="group relative flex items-center"
            >
                {/* Clickable Area for Navigation */}
                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/notes/${note._id}`)}
                >
                    <SidebarItem
                        icon={note.icon || <FileText size={18} />}
                        label={note.title || "Untitled"}
                        active={isActive}
                    />
                </div>

                {/* Three Dots Button */}
                <div className={`absolute right-1 ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : note._id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                    >
                        <MoreHorizontal size={14} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 top-6 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 p-1 flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => handleToggleFavorite(e, note)}
                                className="group/btn w-full px-2 py-1.5 text-[13px] text-left font-medium text-[#37352F] hover:bg-gray-100 rounded-md flex items-center gap-2.5 transition-colors"
                            >
                                <Star size={15} className={`transition-colors ${note.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400 group-hover/btn:text-gray-600"}`} />
                                {note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            </button>

                            <button
                                onClick={(e) => handleRenameNote(e, note)}
                                className="group/btn w-full px-2 py-1.5 text-[13px] text-left font-medium text-[#37352F] hover:bg-gray-100 rounded-md flex items-center gap-2.5 transition-colors"
                            >
                                <Edit2 size={15} className="text-gray-400 group-hover/btn:text-gray-600" />
                                Rename
                            </button>

                            {/* ONLY SHOW DELETE IF THE USER IS THE OWNER */}
                            {isOwner && (
                                <>
                                    <div className="h-px bg-gray-100 my-1 mx-1"></div>
                                    <button
                                        onClick={(e) => handleDeleteNote(e, note._id)}
                                        className="w-full px-2 py-1.5 text-[13px] text-left font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2.5 transition-colors"
                                    >
                                        <Trash size={15} />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <aside className={`${isOpen ? 'w-60' : 'w-0'} bg-[#F7F7F5] border-r border-[#E9E9E7] shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col h-full`}>

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
                <div onClick={() => setIsSearchOpen(true)}>
                    <SidebarItem icon={<Search size={18} />} label="Search" />
                </div>

                <div onClick={() => navigate('/inbox')}>
                    <SidebarItem icon={<Inbox size={18} />} label="Inbox" count={unreadCount} />
                </div>

                <div onClick={() => onOpenSettings ? onOpenSettings() : navigate('/settings')}>
                    <SidebarItem icon={<Settings size={18} />} label="Settings" active={location.pathname === '/settings'} />
                </div>
                <div onClick={() => navigate('/calendar')}>
                    <SidebarItem icon={<CalendarIcon size={18} />} label="Calendar" active={location.pathname === '/calendar'} />
                </div>
                <div onClick={() => navigate('/groups')}>
                    <SidebarItem icon={<Users size={18} />} label="My Teams" active={location.pathname === '/groups'} />
                </div>

                {/* FAVORITES SECTION */}
                <div className="mt-6 mb-1 px-3 text-xs font-semibold text-[#9B9A97]">Favorites</div>
                {favoriteNotes.length === 0 && (
                    <div className="px-3 text-xs text-gray-400 italic mb-2">No favorites yet</div>
                )}
                {favoriteNotes.map(note => renderNoteItem(note))}

                {/* SHARED SECTION */}
                {sharedNotes.length > 0 && (
                    <>
                        <div className="mt-6 mb-1 px-3 flex items-center justify-between text-xs font-semibold text-[#9B9A97]">
                            <div className="flex items-center gap-1.5">
                                <Share2 size={12} />
                                <span>Shared</span>
                            </div>
                        </div>
                        {sharedNotes.map(note => renderNoteItem(note))}
                    </>
                )}

                {/* PRIVATE SECTION */}
                <div className="mt-6 mb-1 px-3 flex items-center justify-between text-xs font-semibold text-[#9B9A97]">
                    <span>Private</span>
                    <button onClick={handleCreateNote} className="hover:bg-gray-200 p-0.5 rounded transition-colors">
                        <Plus size={14} />
                    </button>
                </div>

                <div onClick={() => navigate('/app')}>
                    <SidebarItem icon={<Brain size={18} className="text-purple-400" />} label="Priorities" active={location.pathname === '/app'} />
                </div>

                {/* Render Private Notes */}
                {privateNotes.map(note => renderNoteItem(note))}
            </div>

            {/* Footer */}
            {isSearchOpen && (
                <SearchModal
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                />
            )}

            <div className="p-2 border-t border-[#E9E9E7]">
                <div onClick={handleLogout} className="px-3 py-1 text-xs text-red-500 hover:bg-[#EFEFEF] rounded cursor-pointer flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Log Out</span>
                </div>
            </div>

            {showLogoutDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
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