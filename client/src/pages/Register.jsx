import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/register', formData);
      // Auto-login logic or redirect
      localStorage.setItem('token', res.data.token);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#37352f]">
      
      {/* 1. Header (Logo Top Left) */}
      <div className="px-6 py-4 flex items-center gap-2">
        <img src={logo} alt="UniVerse logo" className="w-8 h-8 rounded object-cover" />
        <span className="font-semibold text-lg tracking-tight">UniVerse</span>
      </div>

      {/* 2. Main Content (Centered) */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 mt-6">
        
        {/* Headlines */}
        <div className="text-center mb-8 w-full max-w-4xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight text-black">UniVerse: your academic workspace.</h1>
            <p className="text-2xl md:text-3xl text-gray-500 font-medium">Sign up with your student email</p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[380px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                 Preferred Name
               </label>
               <input 
                 type="text" 
                 placeholder="What should we call you?"
                 className="w-full px-3 py-2.5 border border-gray-300 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                 value={formData.username}
                 onChange={(e) => setFormData({...formData, username: e.target.value})}
                 required
               />
            </div>

            {/* Email Input */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                 Email
               </label>
               <input 
                 type="email" 
                 placeholder="name@university.edu"
                 className="w-full px-3 py-2.5 border border-gray-300 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                 value={formData.email}
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
                 required
               />
            </div>

            {/* Password Input */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                 Password
               </label>
               <input 
                 type="password" 
                 placeholder="Create a password"
                 className="w-full px-3 py-2.5 border border-gray-300 rounded shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                 value={formData.password}
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
                 required
               />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                 <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded shadow-sm transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-500">
             <p>Already have an account?</p>
             <button 
               onClick={() => navigate('/login')}
               className="text-[#0075D8] hover:underline font-medium mt-1"
             >
               Log in here
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;