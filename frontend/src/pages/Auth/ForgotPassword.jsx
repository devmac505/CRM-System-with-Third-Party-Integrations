import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import logo from '../../assets/logo.svg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { forgotPassword, loading, clearError } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    clearError();

    // Simple validation
    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    try {
      const result = await forgotPassword(email);
      setSuccessMessage(result.message || 'Password reset instructions have been sent to your email.');
    } catch (error) {
      console.error('Password reset request error:', error);
      setFormError(
        error.response?.data?.message || 
        error.message || 
        'Failed to send password reset email. Please try again.'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div>
          <img src={logo} alt="CRM System Logo" className="auth-logo" />
          <h2 className="auth-title">
            Reset your password
          </h2>
          <p className="auth-subtitle">
            Enter your email address and we'll send you instructions to reset your password.
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
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Send Reset Instructions
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

export default ForgotPassword;
