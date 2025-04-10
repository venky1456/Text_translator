import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const ConfirmSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location.state?.email) {
      setError('Email is required. Please go back to signup.');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email || !confirmationCode) {
      setError('Email and confirmation code are required');
      setIsLoading(false);
      return;
    }

    try {
      // Check internet connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      console.log('Submitting confirmation:', {
        email,
        confirmationCode
      });

      const response = await api.confirmSignup({
        email,
        confirmationCode
      });

      console.log('Confirmation response:', response);
      console.log('Response type:', {
        message: response.message,
        status: response.status,
        fullResponse: JSON.stringify(response, null, 2)
      });

      // Check for successful confirmation in different response formats
      if (response.message === 'Account confirmed successfully' || 
          response.message === 'SUCCESS' ||
          response.status === 'SUCCESS') {
        console.log('Confirmation successful, redirecting to login...');
        setSuccess('Your account has been confirmed successfully! Redirecting to login...');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else if (response.message) {
        setError(response.message);
      } else {
        setError('Failed to confirm account. Please check your confirmation code.');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      if (err.message.includes('No internet connection')) {
        setError('No internet connection. Please check your network and try again.');
      } else if (err.message.includes('Unable to connect to the server')) {
        setError('Unable to connect to the server. Please try again later.');
      } else if (err.message.includes('expired')) {
        setError('Confirmation code has expired. Please request a new code.');
      } else if (err.message.includes('Invalid verification code')) {
        setError('Invalid confirmation code. Please check and try again.');
      } else {
        setError(err.message || 'Failed to confirm account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-3xl font-bold text-center text-foreground">
            Confirm Your Account
          </h2>
          {email && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Please enter the confirmation code sent to<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-sm text-center">
              {success}
            </div>
          )}
          <div className="space-y-4">
            <input
              id="confirmationCode"
              name="confirmationCode"
              type="text"
              required
              placeholder="Enter confirmation code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="rounded-lg w-full px-3 py-2 border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Confirming...' : 'Confirm Account'}
          </button>

          <div className="text-sm text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/Resend_the_Code', { state: { email } })}
              className="text-primary hover:text-primary/90 block w-full"
            >
              Resend confirmation code
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary/90 block w-full"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmSignup;