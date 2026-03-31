import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; // Adjust this path if your axios config is elsewhere
import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png'; // Make sure this path points to your logo

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer container: Light gray background
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* Main Card Container */}
      <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[550px] max-h-[90vh]">
        
        {/* LEFT COLUMN: Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-10 overflow-y-visible min-h-0 flex flex-col justify-between relative">
          
          {/* Header & Logo */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src={logo} alt="UniVerse logo" className="w-8 h-8 rounded" />
              <span className="font-bold text-xl tracking-tight text-gray-900">UniVerse</span>
            </Link>

            {isSuccess ? (
              // SUCCESS STATE
              <div className="flex flex-col items-start justify-center py-10 animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 text-[#0075D8] rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gray-900 tracking-tight">Check your inbox!</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  We've sent a verification link to <span className="text-gray-900 font-medium">{formData.email}</span>.
                  Please verify your email address to activate your account.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium px-8 py-3 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  Go to Login <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              // REGISTRATION FORM
              <div className="max-w-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
                <p className="text-sm text-gray-500 mb-8">
                  Please enter your details to access the UniVerse Dashboard.
                </p>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2 mb-6">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="eg. John Doe"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] focus:border-transparent transition-all text-sm"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="eg. student@university.edu"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] focus:border-transparent transition-all text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0075D8] focus:border-transparent transition-all text-sm pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-md shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Register'}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/login" className="text-[#0075D8] hover:underline font-medium">
                    Log in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Branding (Hidden on Mobile, Visible on Desktop) */}
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
          {/* Optional Overlay to give it depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0075D8]/20 to-transparent mix-blend-overlay"></div>
          
          {/* Centered Brand Element */}
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

export default Register;