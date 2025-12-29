import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to UniVerse</h2>

                {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 mt-1 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 mt-1 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 font-bold"
                    >
                        Sign In
                    </button>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                            Sign up for free
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;