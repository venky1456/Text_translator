import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const ConfirmSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = location.state?.email || '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !code) {
        throw new Error('Email or confirmation code is missing.');
      }

      await api.confirmSignup({
        email, // Pass the email as Username
        confirmationCode: code, // Pass the code entered by the user
      });
      console.log('Account confirmed successfully!');
      navigate('/login'); // Redirect to login after successful confirmation
    } catch (error) {
      console.error('Error confirming account:', error.message);
      setError(error.message || 'Failed to confirm account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Invalid Access</h2>
          <p className="text-muted-foreground mb-4">
            Please complete the signup process first.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="text-primary hover:text-primary/90 font-medium"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-3xl font-bold text-center text-foreground">
            Confirm Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please enter the confirmation code sent to {email}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="code" className="sr-only">
              Confirmation Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter confirmation code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Confirming...' : 'Confirm Account'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-medium text-primary hover:text-primary/90"
            >
              Back to Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmSignup;