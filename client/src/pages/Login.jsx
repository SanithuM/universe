import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 1. Send credentials to backend
            const res = await api.post('/auth/login', { email, password });

            // 2. Save the token securely
            localStorage.setItem('token', res.data.token);

            // 3. Redirect to the Dashboard
            navigate('/app');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

        return (
                <div className="min-h-screen bg-white flex flex-col font-sans text-[#37352f]">

                    {/* Header (Logo Top Left) */}
                    <div className="px-6 py-4 flex items-center gap-2">
                        <img src={logo} alt="UniVerse logo" className="w-8 h-8 rounded object-cover" />
                        <span className="font-semibold text-lg tracking-tight">UniVerse</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-start p-4 mt-6">

                        {/* Headlines */}
                        <div className="text-center mb-8 w-full max-w-4xl">
                                <h1 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight text-black">Welcome back to UniVerse.</h1>
                                <p className="text-2xl md:text-3xl text-gray-500 font-medium">Sign in with your student email</p>
                        </div>

                        <div className="w-full max-w-[380px]">
                            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded">{error}</div>}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    Sign In
                                    <ArrowRight size={16} />
                                </button>

                                <div className="mt-6 text-center text-sm text-gray-500">
                                    <p>Don't have an account?</p>
                                    <Link to="/register" className="text-[#0075D8] hover:underline font-medium mt-1 inline-block">
                                        Sign up here
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
        );
};

export default Login;