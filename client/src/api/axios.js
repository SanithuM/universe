import axios from 'axios';

const api = axios.create({
    baseURL: 'https://universe-backend-wufi.onrender.com',
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
