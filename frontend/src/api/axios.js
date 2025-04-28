import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using HTTP-only cookies
  timeout: 10000, // 10 second timeout
});

// Function to get token with validation
const getAuthToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Optional: Add JWT validation logic here
    // For example, check if token is expired based on decoded payload

    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// Add a request interceptor to add the auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      // You could dispatch to a global error state here
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        originalError: error
      });
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 401: // Unauthorized
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login?session=expired';
        }
        break;

      case 403: // Forbidden
        console.error('Permission denied:', error.response.data);
        break;

      case 404: // Not Found
        console.error('Resource not found:', error.response.data);
        break;

      case 500: // Server Error
        console.error('Server error:', error.response.data);
        break;

      default:
        console.error(`Error ${error.response.status}:`, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
