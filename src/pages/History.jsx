import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';

const History = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTranslationHistory();
  }, [navigate]);

  const fetchTranslationHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching translation history...');
      const response = await api.getTranslationHistory();
      console.log('Translation history data:', response);

      if (response && response.translations) {
        console.log('Setting history with translations:', response.translations);
        setHistory(response.translations);
      } else {
        console.log('No translations found in response');
        setHistory([]);
      }
    } catch (err) {
      console.error('Error fetching translation history:', err);
      if (err.message.includes('Session expired') || 
          err.message.includes('No authentication token') ||
          err.message === 'Unauthorized') {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to fetch translation history');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTranslationHistory();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading translation history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-2 py-2 px-4 text-sm font-medium rounded-lg text-primary border border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex">
        <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Translation History</h1>

            {history.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No translation history found.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="p-4 bg-card rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Original Text</h3>
                        <p className="mt-1 text-foreground">{item.originalText}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Translated Text</h3>
                        <p className="mt-1 text-foreground">{item.translatedText}</p>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>From: {item.fromLanguage}</span>
                          <span>To: {item.toLanguage}</span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default History;