import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import logo from '../../assets/logo.svg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { loginUser, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for query parameters (e.g., from password reset or session expiration)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('reset') === 'success') {
      setSuccessMessage('Your password has been reset successfully. Please log in with your new password.');
    }

    if (params.get('session') === 'expired') {
      setFormError('Your session has expired. Please log in again.');
    }

    // Clear messages when component unmounts or location changes
    return () => {
      setSuccessMessage(null);
      setFormError(null);
    };
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any error messages when user starts typing
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password');
      return;
    }

    try {
      // Clear any previous errors
      clearError();

      const result = await loginUser(formData);

      // Redirect to dashboard or intended page
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (error) {
      console.error('Login error:', error);
      setFormError(
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div>
          <img src={logo} alt="CRM System Logo" className="auth-logo" />
          <h2 className="auth-title">
            Sign in to your account
          </h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link
              to="/register"
              className="form-link"
            >
              create a new account
            </Link>
          </p>
        </div>

        {formError && (
          <Alert type="error" message={formError} />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-footer">
            <div className="form-checkbox">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label
                htmlFor="remember-me"
                className="text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div>
              <Link
                to="/forgot-password"
                className="form-link"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
