import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Trash2, Mail, Calendar, Users, AlertCircle, Menu, Clock, ExternalLink, X } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const Inbox = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load inbox", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Initialize sidebar visibility based on screen size and update on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actions
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Get Icon based on type
  const getIcon = (type) => {
    switch (type) {
      case 'meeting': return <Calendar size={18} className="text-blue-500" />;
      case 'group': return <Users size={18} className="text-purple-500" />;
      case 'deadline': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Filter Logic
  const filteredList = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="flex h-screen w-full bg-white text-[#37352f] font-sans dark:bg-[#191919] dark:text-gray-100">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-[#191919] dark:text-gray-100">

        {/* Header */}
        {/* Header - Matches NoteEditor style */}
        <header className="flex items-center justify-between px-4 h-12 sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-100 dark:bg-[#191919] dark:text-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 rounded text-gray-500  md:hidden">
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-100">
              <Mail size={18} />
              <span>Inbox</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={markAllRead}
              className="text-xs text-gray-500 dark:text-gray-300 hover:text-gray-900 flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full dark:bg-[#191919] dark:text-gray-100">

          {/* Page Title & Tabs */}
            <div className="mb-8 dark:text-gray-100">
            <h1 className="text-3xl font-bold text-[#37352f] dark:text-gray-100 mb-6">Inbox</h1>

            <div className="flex gap-1 border-b border-gray-200">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${filter === 'all' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
              >
                All Updates
                {filter === 'all' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-gray-300"></div>}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${filter === 'unread' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
              >
                Unread
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
                {filter === 'unread' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-gray-300"></div>}
              </button>
            </div>
          </div>

          {/* Notification List */}
          {loading ? (
            <div className="text-gray-400 italic text-sm">Loading updates...</div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <CheckCheck size={32} className="opacity-20" />
              </div>
              <p className="text-sm">You're all caught up!</p>
            </div>
            ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-[#191919] dark:text-gray-100">
              <div className="divide-y divide-gray-100">
                {filteredList.map(item => (
                  <div
                    key={item._id}
                    onClick={() => markAsRead(item._id)}
                    className={`group flex gap-4 p-4 sm:px-6 hover:bg-[#F9F9F8] dark:hover:bg-[#3C3D3D] transition-colors cursor-pointer relative dark:bg-[#191919] dark:text-gray-100`}
                  >
                    {/* Unread Indicator - Vertical Bar */}
                    {!item.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500"></div>
                    )}

                    {/* Avatar / Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {item.sender ? (
                        <img src={item.sender.profilePic || "https://via.placeholder.com/40"} alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${!item.isRead ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                          {getIcon(item.type)}
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`text-[15px] truncate mr-2 ${item.isRead ? 'font-medium text-gray-700 dark:text-gray-400' : 'font-bold text-[#37352f]'}`}>
                          {item.title}
                        </h4>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0 font-medium tracking-wide layer-text">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <p className={`text-[13px] leading-snug line-clamp-2 ${item.isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-blue-600 group-hover:underline w-fit">
                          <span>Open</span>
                          <ExternalLink size={10} />
                        </div>
                      )}
                    </div>

                    {/* Actions (Visible on Hover) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center pl-2">
                      {!item.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(item._id); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotification(e, item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Inbox;