import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { CheckCircle2, Lock } from 'lucide-react';
import logo from '../assets/logo.png';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Grabs the dynamic :token from the React Router URL
    const { token } = useParams(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.put(`/auth/reset-password/${token}`, { password });
            setMessage(res.data.message || 'Password successfully updated!');
            
            // Auto-redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[550px] max-h-[90vh]">
                
                <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-10 flex flex-col justify-between relative overflow-y-auto">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <img src={logo} alt="UniVerse logo" className="w-8 h-8 rounded" />
                            <span className="font-bold text-xl tracking-tight text-gray-900">UniVerse</span>
                        </Link>

                        <div className="max-w-md">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
                            <p className="text-sm text-gray-500 mb-6">
                                Your new password must be different from previous used passwords.
                            </p>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2 mb-4">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {message ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Password Reset Successfully</h3>
                                    <p className="text-sm text-gray-500 mb-6">Redirecting you to the login page...</p>
                                    <Link to="/login" className="text-[#0075D8] font-medium hover:underline text-sm">
                                        Click here if you are not redirected
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] transition-all text-sm"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength="6"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] transition-all text-sm"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-2 bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-md shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Updating Password...' : 'Reset Password'}
                                        {!loading && <Lock size={16} />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between text-xs text-gray-400">
                        <p>Copyright © {new Date().getFullYear()} UniVerse Dashboard</p>
                    </div>
                </div>

                <div 
                    className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden"
                    style={{
                        backgroundColor: '#0a2c6e',
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0075D8]/20 to-transparent mix-blend-overlay"></div>
                    <div className="relative z-10 flex items-center gap-3 bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                        <img src={logo} alt="UniVerse logo" className="w-12 h-12 rounded shadow-2xl" />
                        <div className="flex flex-col">
                            <span className="font-bold text-3xl tracking-tight text-white leading-none">UniVerse</span>
                            <span className="text-blue-200 text-sm tracking-widest uppercase mt-1">Security</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;