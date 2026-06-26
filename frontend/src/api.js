import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

const resolveApiBaseUrl = () => {
  const configuredUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL || '');

  if (configuredUrl) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredUrl)) {
      return window.location.origin;
    }

    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: resolveApiBaseUrl()
});

export default API;
