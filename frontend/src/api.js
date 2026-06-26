import axios from 'axios';

// Create a single reusable Axios instance configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export default API;
