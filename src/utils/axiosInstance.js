import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/v1', // Your backend URL
    withCredentials: true, // CRITICAL: This allows cookies to be sent and received
});

export default axiosInstance;