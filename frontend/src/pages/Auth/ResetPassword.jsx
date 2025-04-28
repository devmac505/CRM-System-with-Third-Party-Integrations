import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import logo from '../../assets/logo.svg';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { confirmPasswordReset, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();

  // Extract token from URL if not in params
  useEffect(() => {
    if (!token) {
      const searchParams = new URLSearchParams(location.search);
      const tokenFromQuery = searchParams.get('token');
      if (!tokenFromQuery) {
        setFormError('Invalid or missing reset token. Please request a new password reset link.');
      }
    }
  }, [token, location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Validation
    if (!formData.password) {
      setFormError('Please enter a new password');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      // Get token from params or query string
      const resetToken = token || new URLSearchParams(location.search).get('token');
      
      if (!resetToken) {
        setFormError('Invalid or missing reset token. Please request a new password reset link.');
        return;
      }

      const result = await confirmPasswordReset(resetToken, formData.password);
      setSuccessMessage(result.message || 'Your password has been reset successfully.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setFormError(
        error.response?.data?.message || 
        error.message || 
        'Failed to reset password. Please try again or request a new reset link.'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div>
          <img src={logo} alt="CRM System Logo" className="auth-logo" />
          <h2 className="auth-title">
            Set new password
          </h2>
          <p className="auth-subtitle">
            Enter your new password below
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
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || successMessage}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || successMessage}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading || successMessage}
          >
            Reset Password
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="form-link">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
