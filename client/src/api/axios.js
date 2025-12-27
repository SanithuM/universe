import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Automatically add the Token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // We will save the token here on Login
    if (token) {
        config.headers['auth-token'] = token;
    }
    return config;
});

export default api;