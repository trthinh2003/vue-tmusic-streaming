import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export default axiosInstance;