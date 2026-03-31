import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { ArrowRight, Mail, ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message || 'If an account exists, a resent link has been sent to your email.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[550px] max-h-[90vh]">
                
                {/* LEFT COLUMN: Form Section */}
                <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-10 flex flex-col justify-between relative overflow-y-auto">
                    <div>
                        <Link to="/login" className="flex items-center gap-2 mb-6">
                            <img src={logo} alt="UniVerse logo" className="w-8 h-8 rounded" />
                            <span className="font-bold text-xl tracking-tight text-gray-900">UniVerse</span>
                        </Link>

                        <div className="max-w-md">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                            <p className="text-sm text-gray-500 mb-6">
                                Enter your student email address and we'll send you a secure link to reset your password.
                            </p>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2 mb-4">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {message && (
                                <div className="text-green-700 text-sm bg-green-50 p-4 rounded-md border border-green-200 flex items-start gap-3 mb-4">
                                    <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold mb-1">Check your inbox</p>
                                        <p>{message}</p>
                                    </div>
                                </div>
                            )}

                            {!message && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="eg. student@university.edu"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] focus:border-transparent transition-all text-sm"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-2 bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-md shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                                        {!loading && <ArrowRight size={16} />}
                                    </button>
                                </form>
                            )}

                            <div className="mt-6 text-center">
                                <Link to="/login" className="text-sm text-gray-500 hover:text-[#0075D8] font-medium inline-flex items-center gap-1.5 transition-colors">
                                    <ArrowLeft size={14} /> Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="mt-auto pt-6 flex items-center justify-between text-xs text-gray-400">
                        <p>Copyright © {new Date().getFullYear()} UniVerse Dashboard</p>
                        <Link to="#" className="hover:text-gray-600 transition-colors">Privacy Notice</Link>
                    </div>
                </div>

                {/* RIGHT COLUMN: Visual Branding */}
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

export default ForgotPassword;