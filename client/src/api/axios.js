import axios from 'axios';

// Use Vite environment variable `VITE_API_URL` when provided.
// Fallback to local development server.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL
});

// Automatically add the Token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // save the token here on Login
    if (token) {
        config.headers['auth-token'] = token;
    }
    return config;
});

export default api;
