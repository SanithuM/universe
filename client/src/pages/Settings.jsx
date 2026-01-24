import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    User,
    Settings as SettingsIcon,
    Bell,
    Link,
    CreditCard,
    Users,
    Monitor,
    Globe,
    X,
    Menu
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

    // 1. Fetch Current User Data (THE FIX IS HERE)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // We fetch the current data so inputs aren't empty
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

    // 2. Handle File Upload (Convert to Base64)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Update state immediately to show preview
                setUser(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // 3. Save Profile Changes
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Send the data currently in state (which includes existing data + changes)
            await api.put('/auth/update', {
                username: user.username,
                profilePic: user.profilePic
            });
            
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // Reload window to reflect changes in Sidebar/Header immediately
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                window.location.reload(); 
            }, 1000);
            
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    // 4. Change Password
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

    // 5. Delete Account
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

    if (loading) return null; // Or a loading spinner

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-[1000px] h-[85vh] rounded-xl shadow-2xl flex overflow-hidden ring-1 ring-black/5 relative">

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
                    <div className="w-64 bg-[#F7F7F5] border-r border-[#EBEBEB] flex flex-col overflow-y-auto p-3 md:relative md:block fixed top-0 left-0 bottom-0 z-40">

                        <div className="md:hidden p-2 flex justify-end">
                            <button onClick={() => setSidebarOpen(false)} className="text-sm text-gray-500">Close</button>
                        </div>

                        {/* User Profile Summary */}
                        <div className="px-3 py-3 mb-2 flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-gray-300 overflow-hidden flex-shrink-0">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                        {user.username ? user.username[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
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
                            <SidebarItem id="notifications" label="Notifications" icon={Bell} />
                            <SidebarItem id="connections" label="Connections" icon={Link} />
                            <SidebarItem id="language" label="Language & region" icon={Globe} />
                        </div>

                        {/* Workspace Section */}
                        <div className="mb-6">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 mb-2">Workspace</h3>
                            <SidebarItem id="settings" label="Settings" icon={SettingsIcon} />
                            <SidebarItem id="members" label="Members" icon={Users} />
                            <SidebarItem id="upgrade" label="Upgrade plan" icon={CreditCard} />
                            <SidebarItem id="sites" label="Sites" icon={Monitor} />
                            <SidebarItem id="security" label="Security & SAML" icon={SettingsIcon} />
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
                                    <h2 className="text-xl font-medium text-gray-900">My account</h2>
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
                                                <h3 className="text-sm font-medium text-gray-900 mb-1">Photo</h3>
                                                <p className="text-sm text-gray-500">Upload a new avatar</p>
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
                                    <h3 className="text-sm font-medium text-gray-900 mb-4">Password</h3>
                                    <div className="space-y-4 max-w-sm">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">New Password</label>
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
                                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
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
                                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded hover:bg-red-100 transition-colors"
                                    >
                                        Delete My Account
                                    </button>
                                </section>
                            </div>
                        )}

                        {activeTab !== 'my-account' && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <SettingsIcon size={32} className="text-gray-300" />
                                </div>
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h2>
                                <p className="max-w-xs mx-auto text-sm text-gray-500">
                                    This section is under development. Please check back later for updates.
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