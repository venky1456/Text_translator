const BASE_URL = '/prouduction';
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
    try {
      console.log('Confirm Signup Request:', {
        email: confirmationData.email,
        code: confirmationData.confirmationCode
      });

      const response = await fetch(`${BASE_URL}/confirm_signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: confirmationData.email,
          code: confirmationData.confirmationCode
        }),
      });

      console.log('Raw response:', response);
      const responseData = await response.json();
      console.log('Confirm signup response:', responseData);
      
      // Handle AWS API Gateway response format
      if (responseData.statusCode && responseData.body) {
        const parsedBody = typeof responseData.body === 'string' 
          ? JSON.parse(responseData.body) 
          : responseData.body;
        
        if (responseData.statusCode >= 400) {
          throw new Error(parsedBody.message || 'Failed to confirm signup');
        }
        return parsedBody;
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to confirm signup');
      }

      return responseData;
    } catch (error) {
      console.error('Confirm signup error:', error);
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please try again later.');
      }
      throw error;
    }
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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('Sending translation request:', {
        input_text: translationData.text,
        source_lang: translationData.source === 'auto' ? null : translationData.source,
        target_lang: translationData.target
      });

      const response = await fetch(`${BASE_URL}/translateFunction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: translationData.text,
          source_lang: translationData.source === 'auto' ? null : translationData.source,
          target_lang: translationData.target
        }),
      });

      const responseData = await response.json();
      console.log('Translation API response:', responseData);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(responseData.message || 'Failed to translate text');
      }

      // Return standardized format
      return {
        translatedText: responseData.translated_text || responseData.translatedText,
        sourceLang: responseData.detected_language || responseData.source_lang || translationData.source,
        targetLang: responseData.target_lang || translationData.target
      };
    } catch (error) {
      console.error('Translation error:', error);
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please try again later.');
      }
      throw error;
    }
  },  
  
  getTranslationHistory: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${BASE_URL}/Transaction_History`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      console.log('Translation history response:', responseData);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(responseData.error || 'Failed to fetch translation history');
      }

      // Return the history array directly if it exists
      if (responseData.history && Array.isArray(responseData.history)) {
        return responseData.history;
      }

      // If the response is an array, return it directly
      if (Array.isArray(responseData)) {
        return responseData;
      }

      return [];
    } catch (error) {
      console.error('Error fetching translation history:', error);
      throw error;
    }
  },

  saveTranslation: async (translationData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('Saving translation:', translationData);

      const response = await fetch(`${BASE_URL}/saveTranslation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          source_text: translationData.originalText,
          target_text: translationData.translatedText,
          source_language: translationData.sourceLang,
          target_language: translationData.targetLang,
          timestamp: new Date().toISOString()
        })
      });

      const responseData = await response.json();
      console.log('Save translation response:', responseData);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(responseData.message || 'Failed to save translation');
      }

      return responseData;
    } catch (error) {
      console.error('Save translation error:', error);
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please try again later.');
      }
      throw error;
    }
  },

  resendConfirmationCode: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/Resend_the_Code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to resend confirmation code');
      }

      return responseData;
    } catch (error) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  },
  getUserDetails: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${BASE_URL}/getUserDetails`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(errorData.error || 'Failed to fetch user details');
      }

      const responseData = await response.json();
      console.log('User details response:', responseData);

      return responseData;
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your network connection and try again.');
      }
      throw error;
    }
  }
}; 