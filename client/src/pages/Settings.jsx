import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', email: '', profilePic: '' });
    const [loading, setLoading] = useState(true);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '' });

    // Feedback Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    // 1. Fetch Current User Data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // 2. Handle File Upload (Convert to Base64)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, profilePic: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // 3. Save Profile Changes
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/update', {
                username: user.username,
                profilePic: user.profilePic
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
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
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to change password' });
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">⚙️ Settings</h1>
                    <button onClick={() => navigate('/app')} className="text-gray-500 hover:text-indigo-600">Back to Dashboard</button>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* SECTION 1: Public Profile */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Public Profile</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">

                        {/* Profile Image Preview */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                                )}
                            </div>
                            <input type="file" onChange={handleImageUpload} className="text-sm text-gray-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Username</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mt-1"
                                placeholder="Enter new username"
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* SECTION 2: Security */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Security</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded mt-1"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded mt-1"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                            Update Password
                        </button>
                    </form>
                </div>

                {/* SECTION 3: Danger Zone */}
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h2>
                    <p className="text-red-600 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                    >
                        Delete Account
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Settings;