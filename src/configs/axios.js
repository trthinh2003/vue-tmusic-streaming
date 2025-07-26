import axios from 'axios';

const axiosInstance = axios.create({
    // baseURL: 'http://localhost:5298/api',
    baseURL: 'https://tmusic-streaming-net.onrender.com/api', //Môi trường production
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export default axiosInstance;