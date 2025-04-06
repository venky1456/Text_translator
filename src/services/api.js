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
      const url = `${BASE_URL}/signupfunction`;
      console.log('Signup request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
        }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Signup API Error:', error.message);
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please try again later.');
      }
      throw error;
    }
  },

  confirmSignup: async (confirmationData) => {
    const response = await fetch(`${BASE_URL}/confirm_signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        Username: confirmationData.email, // Pass the email as Username
        ConfirmationCode: confirmationData.confirmationCode, // Pass the code entered by the user
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
    return response.json();
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
  
    return handleResponse(response);
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
};
