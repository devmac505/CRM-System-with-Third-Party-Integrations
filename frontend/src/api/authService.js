import axios from './axios';

/**
 * Store authentication data securely
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
const storeAuthData = (token, user) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('auth_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error storing auth data:', error);
    // Fallback to session storage if localStorage fails
    try {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    } catch (sessionError) {
      console.error('Error storing auth data in session storage:', sessionError);
    }
  }
};

/**
 * Clear all authentication data
 */
const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_timestamp');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} - Registration response
 */
export const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);

    if (response.data && response.data.success && response.data.token) {
      storeAuthData(response.data.token, response.data.user);
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {object} userData - User login credentials
 * @returns {Promise<object>} - Login response
 */
export const login = async (userData) => {
  try {
    const response = await axios.post('/auth/login', userData);

    if (response.data && response.data.success && response.data.token) {
      storeAuthData(response.data.token, response.data.user);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuthData();
  // Optional: Call backend logout endpoint if needed
  // return axios.post('/auth/logout');
};

/**
 * Get current user data from server
 * @returns {Promise<object>} - Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;

    // Optional: Check token expiration
    const timestamp = parseInt(localStorage.getItem('auth_timestamp') || '0', 10);
    const currentTime = Date.now();
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (currentTime - timestamp > SESSION_DURATION) {
      clearAuthData();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<object>} - Password reset response
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<object>} - Password reset confirmation
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};
