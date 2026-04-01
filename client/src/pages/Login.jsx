import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight, Eye, EyeOff, Smartphone } from 'lucide-react';
import logo from '../assets/logo.png';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const inputsRef = useRef([]);
    const [codeDigits, setCodeDigits] = useState(new Array(6).fill(''));

    const handleDigitChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
        const next = [...codeDigits];
        next[idx] = val;
        setCodeDigits(next);
        setTwoFactorCode(next.join(''));
        if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            if (codeDigits[idx]) {
                const next = [...codeDigits];
                next[idx] = '';
                setCodeDigits(next);
                setTwoFactorCode(next.join(''));
            } else if (idx > 0) {
                inputsRef.current[idx - 1]?.focus();
                const next = [...codeDigits];
                next[idx - 1] = '';
                setCodeDigits(next);
                setTwoFactorCode(next.join(''));
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        } else if (e.key === 'ArrowRight' && idx < 5) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const digits = pasted.split('');
        const next = [...codeDigits];
        for (let i = 0; i < digits.length; i++) next[i] = digits[i];
        setCodeDigits(next);
        setTwoFactorCode(next.join(''));
        const focusIndex = Math.min(digits.length, 5);
        inputsRef.current[focusIndex]?.focus();
    };
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });

            //if 2FA is required
            if (res.data.requiresTwoFactor) {
            setTempUserId(res.data.userId);
            setRequiresTwoFactor(true);
            setLoading(false);
            return; // Stop here and wait for the user to enter the code!
        }
            // Save JWT and enter the app
            localStorage.setItem('token', res.data.token);
            navigate('/app');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const res = await api.post('/auth/login/2fa', { 
            userId: tempUserId, 
            token: twoFactorCode 
        });

        // Save the token and redirect!
        localStorage.setItem('token', res.data.token);
        navigate('/app'); 

    } catch (err) {
        setError(err.response?.data?.message || 'Invalid 2FA code.');
    } finally {
        setLoading(false);
    }
};

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            // Send the Google token to backend route
            const res = await api.post('/auth/google', {
                token: credentialResponse.credential
            });

            // Save JWT and enter the app
            localStorage.setItem('token', res.data.token);
            navigate('/app');
        } catch (err) {
            setError(err.response?.data?.message || 'Google Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 sm:p-8 font-sans">


            <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[550px] max-h-[90vh]">

                <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-10 flex flex-col justify-center relative overflow-y-visible min-h-0">

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

                            {!requiresTwoFactor ? (
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
                                            <Link to="/forgot-password" className="text-xs text-[#0075D8] hover:underline font-medium">
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

                                    {/* THE "OR" DIVIDER */}
                                    <div className="relative flex items-center justify-center mb-6">
                                        <div className="border-t border-gray-200 w-full"></div>
                                        <span className="bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest absolute">
                                            Or
                                        </span>
                                    </div>

                                    {/* THE GOOGLE BUTTON */}
                                    <div className="mb-6 flex justify-center w-full">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setError('Google Login Failed. Please try again.')}
                                            theme="outline"
                                            size="large"
                                            width="380px"
                                            text="continue_with"
                                            className="w-full mt-2 bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-md shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                </form>
                            ) : (
                                <div className="animate-fade-in-up">
                                    <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                        <Smartphone className="w-6 h-6 text-[#0075D8]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Two-Factor Authentication</h2>
                                    <p className="text-sm text-gray-500 text-center mb-6">
                                        Enter the 6-digit code from your authenticator app to continue.
                                    </p>

                                    {error && (
                                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4 text-center">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* six separate inputs for each digit */}
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => (inputsRef.current[i] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={codeDigits[i]}
                                                    onChange={(e) => handleDigitChange(e, i)}
                                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                                    onPaste={(e) => handlePaste(e)}
                                                    className="w-12 h-12 text-center text-xl font-mono bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0075D8]"
                                                    aria-label={`Digit ${i + 1}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || twoFactorCode.length !== 6}
                                            className="w-full bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-md transition-all disabled:opacity-70"
                                        >
                                            {loading ? 'Verifying...' : 'Verify & Log In'}
                                        </button>

                                        <div className="text-center mt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRequiresTwoFactor(false);
                                                    setCodeDigits(new Array(6).fill(''));
                                                    setTwoFactorCode('');
                                                }}
                                                className="text-sm text-gray-500 hover:text-[#0075D8] transition-colors"
                                            >
                                                Back to login
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

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