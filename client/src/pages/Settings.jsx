import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    User,
    Settings as SettingsIcon,
    Bell,
    CreditCard,
    Users,
    Globe,
    X,
    Menu,
    Palette,
    DownloadCloud,
    CheckCircle
} from 'lucide-react';

const Settings = ({ onClose }) => {
    const navigate = useNavigate();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/app');
        }
    };

    // Initialize with empty strings to avoid "uncontrolled input" warnings
    const [user, setUser] = useState({ username: '', email: '', profilePic: '' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-account');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '' });

    // Feedback Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    const [imageFile, setImageFile] = useState(null);

    // Preference states
    const [notifications, setNotifications] = useState({
        taskAssigned: true,
        meetingInvites: true,
        groupUpdates: false,
        marketing: false
    });

    const [preferences, setPreferences] = useState({
        language: 'English (US)',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startofWeek: 'Monday'
    });

    // Appearance State
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [accentColor, setAccentColor] = useState('blue');
    const [isExporting, setIsExporting] = useState(false);

    // runs every time 'theme' changes
    useEffect(() => {
        const root = document.documentElement; // This grabs the <html> tag

        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark'); // Save it so it remembers next time!
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    // The Export Data Function
    const handleExportData = async () => {
        setIsExporting(true);
        setMessage({ type: 'info', text: 'Gathering your data...' });

        try {
            // Fetch all user data concurrently
            const [tasksRes, groupsRes] = await Promise.all([
                api.get('/assignments').catch(() => ({ data: [] })),
                api.get('/groups').catch(() => ({ data: [] }))
            ]);

            // Format it cleanly
            const exportPayload = {
                userInfo: {
                    username: user.username,
                    email: user.email,
                    exportDate: new Date().toISOString()
                },
                tasks: tasksRes.data,
                groups: groupsRes.data
            };

            // Create a downloadable JSON file in the browser
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `UniVerse_Data_${user.username.replace(/\s+/g, '_')}.json`);

            // Trigger the download
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            setMessage({ type: 'success', text: 'Data exported successfully!' });
        } catch (error) {
            console.error("Export failed", error);
            setMessage({ type: 'error', text: 'Failed to compile data export.' });
        } finally {
            setIsExporting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    // Workspace Members State
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Fetch Workspace Members (Only when "Members" tab is active)
    useEffect(() => {
        if (activeTab === 'members') {
            const fetchMembers = async () => {
                setLoadingMembers(true);
                try {
                    const res = await api.get('/groups');
                    const groups = res.data;

                    // Deduplicate memers and aggregate their shared groups
                    const memberMap = {};
                    groups.forEach(group => {
                        if (group.members && group.members.length > 0 && group.members[0].username) {
                            group.members.forEach(member => {
                                // Skip showing the current logged-in user in the members list
                                if (member.email === user.email) return;

                                if (!memberMap[member._id]) {
                                    memberMap[member._id] = { ...member, sharedGroups: [group.name] };
                                } else {
                                    memberMap[member._id].sharedGroups.push(group.name);
                                }
                            });
                        }
                    });

                    setWorkspaceMembers(Object.values(memberMap));
                } catch (err) {
                    console.error("Failed to load workspace members", err);
                } finally {
                    setLoadingMembers(false);
                }
            };
            fetchMembers();
        }
    }, [activeTab, user.email]);

    // Fetch Current User Data (THE FIX IS HERE)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Fetch the current data so inputs aren't empty
                const res = await api.get('/auth/me');
                setUser({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    profilePic: res.data.profilePic || ''
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to load user settings", err);
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Initialize sidebar visibility based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle File Selection (Instant Local Preview, No Lag!)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Store the actual file in state for later upload, but show the preview immediately
            setImageFile(file);

            // Create a temporary local URL so the user sees the picture instantly!
            setUser(prev => ({ ...prev, profilePic: URL.createObjectURL(file) }));
        }
    };

    // Save Profile Changes (Uploads to Cloudinary, then saves to DB)
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // Let the user know it's working since uploads take a second
        setMessage({ type: 'info', text: 'Uploading and saving...' });

        try {
            let finalProfilePicUrl = user.profilePic;

            // If they picked a new image, send it to Cloudinary first
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);

                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Grab the tiny Cloudinary URL from the backend
                finalProfilePicUrl = uploadRes.data.imageUrl;
            }

            // Send the final data to the Auth route
            await api.put('/auth/update', {
                username: user.username,
                profilePic: finalProfilePicUrl // This is a clean Cloudinary URL
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Reload window to reflect changes in Sidebar/Header immediately
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                window.location.reload();
            }, 1000);

        } catch (err) {
            console.error("Profile update error:", err);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    // Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ current: '', new: '' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data || 'Failed to change password';
            setMessage({
                type: 'error',
                text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg
            });
        }
    };

    // Delete Account
    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure? This action cannot be undone!")) {
            try {
                await api.delete('/auth/delete');
                localStorage.removeItem('token');
                navigate('/');
            } catch (err) {
                alert("Failed to delete account");
            }
        }
    };

    // Sidebar Item Component
    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors mb-0.5
                ${activeTab === id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    // Reusable Toggle Component
    const Toggle = ({ label, description, checked, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors">
            <div className="pr-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    if (loading) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-[1000px] h-[85vh] rounded-xl shadow-2xl flex overflow-hidden ring-1 ring-black/5 relative dark:bg-[#191919] text-[#37352f] dark:text-gray-100">

                {/* Mobile toggle (left) */}
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="absolute top-4 left-4 p-1 rounded hover:bg-gray-100 text-gray-600 md:hidden z-20">
                    <Menu size={20} />
                </button>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 z-10 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Left Sidebar */}
                {isSidebarOpen && (
                    <div className="w-64 bg-[#F7F7F5] dark:bg-[#202020] border-r border-[#EBEBEB] dark:border-[#333333] flex flex-col overflow-y-auto p-3 md:relative md:block fixed top-0 left-0 bottom-0 z-40">

                        <div className="md:hidden p-2 flex justify-end">
                            <button onClick={() => setSidebarOpen(false)} className="text-sm text-gray-500">Close</button>
                        </div>

                        {/* User Profile Summary */}
                        <div className="px-3 py-3 mb-2 flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-gray-300 overflow-hidden shrink-0">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                        {user.username ? user.username[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {user.username || 'Current User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>

                        {/* Account Section */}
                        <div className="mb-6">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 mb-2 mt-2">Account</h3>
                            <SidebarItem id="my-account" label="My account" icon={User} />
                            <SidebarItem id="appearance" label="Appearance" icon={Palette} />
                            <SidebarItem id="notifications" label="Notifications" icon={Bell} />
                            <SidebarItem id="language" label="Language & region" icon={Globe} />
                        </div>

                        {/* Workspace Section */}
                        <div className="mb-6">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 mb-2">Workspace</h3>
                            <SidebarItem id="members" label="Members" icon={Users} />
                            <SidebarItem id="data-privacy" label="Data & Privacy" icon={DownloadCloud} />
                            <SidebarItem id="upgrade" label="Upgrade plan" icon={CreditCard} />
                        </div>
                    </div>
                )}

                {/* Right Content Area */}
                <div className="flex-1 overflow-y-auto min-w-0">
                    <div className="max-w-[640px] mx-auto py-12 px-4 md:px-12">

                        {message.text && (
                            <div className={`mb-6 p-3 rounded-md text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'my-account' && (
                            <div className="space-y-12">
                                {/* Header */}
                                <div className="border-b border-gray-200 pb-4 mb-8">
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">My account</h2>
                                </div>

                                {/* Profile Photo & Name */}
                                <section>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group cursor-pointer w-20 h-20">
                                                <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xl text-gray-400">
                                                    {user.profilePic ? (
                                                        <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{user.username?.[0] || '?'}</span>
                                                    )}
                                                </div>
                                                <label className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <span className="text-xs font-medium">Change</span>
                                                    <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                                </label>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Photo</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-300">Upload a new avatar</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={user.username}
                                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                                placeholder="Enter your name"
                                                className="flex-1 max-w-sm px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                            <button
                                                onClick={handleUpdateProfile}
                                                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {/* Password Section */}
                                <section className="pt-8 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-700 mb-4">Password</h3>
                                    <div className="space-y-4 max-w-sm">
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 dark:bg-[#202020] dark:text-gray-100 text-sm font-medium rounded hover:bg-gray-50 transition-colors dark:hover:bg-[#333333]"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                </section>

                                {/* Danger Zone */}
                                <section className="pt-8 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Permanently delete your account and all of your content.
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 bg-red-50 dark:bg-red-200 text-red-600 border border-red-200 text-sm font-medium rounded hover:bg-red-100 dark:hover:bg-red-300 transition-colors"
                                    >
                                        Delete My Account
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* --- APPEARANCE TAB --- */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Appearance</h2>
                                    <p className="text-sm text-gray-500 mt-1">Customize how UniVerse looks on your device.</p>
                                </div>

                                <section>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
                                    <div className="grid grid-cols-2 gap-4 max-w-md">
                                        {/* Light Mode Card */}
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 border-2 rounded-xl text-left transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500'}`}
                                        >
                                            <div className="w-full h-24 bg-gray-50 rounded-lg border border-gray-200 mb-3 flex items-start p-2 gap-2 shadow-sm">
                                                <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0"></div>
                                                <div className="space-y-1.5 w-full">
                                                    <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                                                    <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Light</p>
                                        </button>

                                        {/* Dark Mode Card */}
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 border-2 rounded-xl text-left transition-all ${theme === 'dark' ? 'border-blue-500 bg-[#202020]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="w-full h-24 bg-gray-900 rounded-lg border border-gray-700 mb-3 flex items-start p-2 gap-2 shadow-sm">
                                                <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0"></div>
                                                <div className="space-y-1.5 w-full">
                                                    <div className="h-2 w-3/4 bg-gray-700 rounded"></div>
                                                    <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Dark</p>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">* Full dark mode support coming in v2.0</p>
                                </section>

                                <section className="pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Accent Color</h3>
                                    <div className="flex gap-3">
                                        {['blue', 'purple', 'green', 'orange', 'red'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setAccentColor(color)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${accentColor === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                                                style={{
                                                    backgroundColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : color === 'orange' ? '#f97316' : '#ef4444',
                                                    ringColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : color === 'orange' ? '#f97316' : '#ef4444'
                                                }}
                                            >
                                                {accentColor === color && <CheckCircle size={14} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* --- NOTIFICATIONS TAB --- */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Notifications</h2>
                                    <p className="text-sm text-gray-500 mt-1">Choose how UniVerse communicates with you.</p>
                                </div>

                                <section>
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Email Notifications
                                    </h3>
                                    <div className="bg-white dark:bg-[#202020] rounded-lg border border-gray-200 dark:border-gray-700 px-4 transition-colors">
                                        <Toggle
                                            label="Task Assignments"
                                            description="Get an email when someone assigns you a task."
                                            checked={notifications.taskAssigned}
                                            onChange={() => setNotifications({ ...notifications, taskAssigned: !notifications.taskAssigned })}
                                        />
                                        <Toggle
                                            label="Meeting Invites"
                                            description="Get an email when you are added to a meeting."
                                            checked={notifications.meetingInvites}
                                            onChange={() => setNotifications({ ...notifications, meetingInvites: !notifications.meetingInvites })}
                                        />
                                        <Toggle
                                            label="Group Updates"
                                            description="Daily digest of what happened in your groups."
                                            checked={notifications.groupUpdates}
                                            onChange={() => setNotifications({ ...notifications, groupUpdates: !notifications.groupUpdates })}
                                        />
                                    </div>
                                </section>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => {
                                            toast?.success('Notification preferences saved!');
                                            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
                                            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- LANGUAGE & REGION TAB --- */}
                        {activeTab === 'language' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Language & region</h2>
                                    <p className="text-sm text-gray-500 mt-1">Customize your locale and date formatting.</p>
                                </div>

                                <section className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                        <select
                                            value={preferences.language}
                                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                            className="w-full max-w-sm px-3 py-2 bg-white dark:bg-[#202020] border border-gray-300 dark:border-[#404040] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option>English (US)</option>
                                            <option>English (UK)</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                            <option>Japanese</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                        <select
                                            value={preferences.timezone}
                                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                            className="w-full max-w-sm px-3 py-2 bg-white dark:bg-[#202020] border border-gray-300 dark:border-[#404040] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option>{Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
                                            <option>America/New_York</option>
                                            <option>Europe/London</option>
                                            <option>Asia/Tokyo</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Used for reminders and due dates.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start of week</label>
                                        <select
                                            value={preferences.startOfWeek}
                                            onChange={(e) => setPreferences({ ...preferences, startOfWeek: e.target.value })}
                                            className="w-full max-w-sm px-3 py-2 bg-white dark:bg-[#202020] border border-gray-300 dark:border-[#404040] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option>Monday</option>
                                            <option>Sunday</option>
                                        </select>
                                    </div>
                                </section>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setMessage({ type: 'success', text: 'Region settings saved!' });
                                            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Update Settings
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- WORKSPACE MEMBERS TAB --- */}
                        {activeTab === 'members' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200  pb-4 mb-6 flex justify-between items-end">
                                    <div>
                                        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Workspace Members</h2>
                                        <p className="text-sm text-gray-500 mt-1">Everyone you collaborate with across all your groups.</p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {workspaceMembers.length} {workspaceMembers.length === 1 ? 'Member' : 'Members'}
                                    </div>
                                </div>

                                {loadingMembers ? (
                                    <div className="text-center py-12 text-gray-400 text-sm">Loading your team...</div>
                                ) : workspaceMembers.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                                        You aren't collaborating with anyone yet. Create a group and invite some friends!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {workspaceMembers.map(member => (
                                            <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">

                                                {/* Left Side: User Info */}
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-lg font-medium text-gray-500 shrink-0">
                                                        {member.profilePic ? (
                                                            <img src={member.profilePic} alt={member.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.username.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{member.username}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                                    </div>
                                                </div>

                                                {/* Right Side: Shared Groups */}
                                                <div className="flex flex-col sm:items-end">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Shared Groups</span>
                                                    <div className="flex flex-wrap sm:justify-end gap-1.5 max-w-[250px]">
                                                        {member.sharedGroups.map((groupName, i) => (
                                                            <span key={i} className="text-xs bg-blue-50 dark:bg-blue-600 text-blue-600 dark:text-blue-50 border border-blue-100 dark:border-blue-500 px-2 py-0.5 rounded-md truncate max-w-[120px]" title={groupName}>
                                                                {groupName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}



                        {/* --- DATA & PRIVACY TAB --- */}
                        {activeTab === 'data-privacy' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Data & Privacy</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal data and account security.</p>
                                </div>

                                <section>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Export Data</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xl">
                                        Download a complete copy of your academic priorities, completed tasks, and group workspace history as a JSON file.
                                    </p>
                                    <button
                                        onClick={handleExportData}
                                        disabled={isExporting}
                                        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-100 text-sm font-medium rounded transition-colors ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                        <DownloadCloud size={16} className={isExporting ? "animate-bounce" : ""} />
                                        {isExporting ? 'Compiling Export...' : 'Export My Data'}
                                    </button>
                                </section>

                                <section className="pt-8 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Session Management</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xl">
                                        Log out of all other active sessions across your devices.
                                    </p>
                                    <button
                                        className="px-4 py-2 border border-gray-300 text-gray-700  dark:text-gray-100 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                                    >
                                        Sign out of all devices
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* --- THE FALLBACK "COMING SOON" FOR THE REST --- */}
                        {['connections', 'settings', 'upgrade', 'security'].includes(activeTab) && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 animate-in fade-in">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <SettingsIcon size={32} className="text-gray-300" />
                                </div>
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h2>
                                <p className="max-w-xs mx-auto text-sm text-gray-500">
                                    This module is currently in development for the next update.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;