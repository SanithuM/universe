import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('Invalid link. No token provided.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus(response.data.message);
        
        // Redirect to login after 3 seconds so they can actually log in
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
      <div className="p-8 bg-neutral-800 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Email Verification</h2>
        <p className="text-neutral-300">{status}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;