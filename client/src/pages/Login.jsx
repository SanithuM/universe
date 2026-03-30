import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/app');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                            <p className="text-sm text-gray-500 mb-6">
                                Please enter your email and password to access the UniVerse Dashboard.
                            </p>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2 mb-4">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email <span className="text-red-500">*</span>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] focus:border-transparent transition-all text-sm pr-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-end mt-2">
                                        <Link to="#" className="text-xs text-[#0075D8] hover:underline font-medium">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-md shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing in...' : 'Login'}
                                    {!loading && <ArrowRight size={16} />}
                                </button>
                            </form>

                            <div className="mt-5 text-center text-sm text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#0075D8] hover:underline font-medium">
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div 
                    className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden"
                    style={{
                        backgroundColor: '#0a2c6e',
                        backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0075D8]/20 to-transparent mix-blend-overlay"></div>
                    
                    <div className="relative z-10 flex items-center gap-3 bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                        <img src={logo} alt="UniVerse logo" className="w-12 h-12 rounded shadow-2xl" />
                        <div className="flex flex-col">
                            <span className="font-bold text-3xl tracking-tight text-white leading-none">UniVerse</span>
                            <span className="text-blue-200 text-sm tracking-widest uppercase mt-1">Workspace</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;