const BASE_URL = 'prouduction';

const handleResponse = async (response) => {
  try {
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log('Response status:', response.status);
    console.log('Parsed response data:', data);

    // Handle AWS API Gateway pattern
    if (typeof data === 'object' && data?.statusCode && data?.body) {
      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
      if (data.statusCode >= 400) {
        throw new Error(parsedBody?.error || parsedBody?.message || 'Server error');
      }
      return parsedBody;
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'An error occurred');
    }

    return data;
  } catch (err) {
    console.error('API Response Error:', err);
    throw err;
  }
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
});

export const api = {
  signup: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/signupfunction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.message === 'User already exists but not confirmed') {
          throw new Error('User already exists but not confirmed');
        }
        throw new Error(responseData.message || 'Failed to create account');
      }

      return responseData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  confirmSignup: async (confirmationData) => {
    console.log('Confirm Signup Request Body:', {
      Username: confirmationData.email,
      ConfirmationCode: confirmationData.confirmationCode,
    });
  
    const response = await fetch(`${BASE_URL}/confirm_signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        Username: confirmationData.email,
        ConfirmationCode: confirmationData.confirmationCode,
      }),
    });
    return handleResponse(response);
  },
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/login_lambda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  
    const data = await response.json();
  
    if (data.error && data.error.includes('not confirmed')) {
      return { redirectToResend: true, email: credentials.email };
    }
  
    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please try again.');
    }
  
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/forgot_password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (resetData) => {
    const response = await fetch(`${BASE_URL}/reset_password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resetData),
    });
    return handleResponse(response);
  },
  translate: async (translationData) => {
    const response = await fetch('https://7ghxgm6wrk.execute-api.us-east-1.amazonaws.com/prouduction/translateFunction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Replace with your JWT token
      },
      body: JSON.stringify({
        text: translationData.text, // Text to translate
        source: translationData.source, // Source language code
        target: translationData.target, // Target language code
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Translation API Error:', errorData);
      throw new Error(errorData.message || 'Failed to translate text. Please try again.');
    }
  
    return response.json();
  },  

  getTranslationHistory: async () => {
    const response = await fetch(`${BASE_URL}/TranslationHistory`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return handleResponse(response);
  },
  resendConfirmationCode: async (email) => {
    const response = await fetch(`${BASE_URL}/Resend_the_Code`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email: email, // Just the email needed to resend the code
      }),
    });
    return handleResponse(response);
  },
};  
