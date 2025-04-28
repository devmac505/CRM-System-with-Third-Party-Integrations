import { createContext, useState, useEffect, useCallback } from 'react';
import {
  login,
  logout,
  register,
  getCurrentUser,
  isAuthenticated,
  requestPasswordReset,
  resetPassword
} from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Function to get stored user data
  const getStoredUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }, []);

  // Function to refresh user data from server
  const refreshUserData = useCallback(async () => {
    try {
      setLoading(true);
      const { user: freshUserData } = await getCurrentUser();
      setUser(freshUserData);
      return freshUserData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        if (isAuthenticated()) {
          // First set user from storage for immediate UI update
          const storedUser = getStoredUser();
          setUser(storedUser);

          // Then try to get fresh data from server
          try {
            await refreshUserData();
          } catch (refreshError) {
            // If server refresh fails but we have stored user data, continue with stored data
            if (!storedUser) {
              logout();
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, [getStoredUser, refreshUserData]);

  // Set up session expiration check
  useEffect(() => {
    if (!user) return;

    // Check session every minute
    const sessionCheckInterval = setInterval(() => {
      if (!isAuthenticated()) {
        clearInterval(sessionCheckInterval);
        setUser(null);
      }
    }, 60000);

    return () => clearInterval(sessionCheckInterval);
  }, [user]);

  // Register user
  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const loginUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logoutUser = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  // Request password reset
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestPasswordReset(email);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Password reset request failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const confirmPasswordReset = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const data = await resetPassword(token, newPassword);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Password reset failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // This would need a corresponding API endpoint
      // const data = await updateUserProfile(userData);
      // setUser(data.user);
      // return data;

      // For now, just refresh user data
      return await refreshUserData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Profile update failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        authChecked,
        isAuthenticated: !!user,
        registerUser,
        loginUser,
        logoutUser,
        forgotPassword,
        confirmPasswordReset,
        updateProfile,
        refreshUserData,
        clearError: () => setError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
