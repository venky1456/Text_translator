import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';

const History = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [translations, setTranslations] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchTranslationHistory();
    }
  }, [navigate]);

  const fetchTranslationHistory = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.getTranslationHistory();
      
      if (response.translations) {
        setTranslations(response.translations);
      } else {
        setError(response.message || 'Failed to fetch translation history.');
      }
    } catch (err) {
      setError('An error occurred while fetching translation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex">
        <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Translation History</h1>
            
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-foreground">Loading translation history...</p>
              </div>
            ) : translations.length > 0 ? (
              <div className="space-y-4">
                {translations.map((translation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-card rounded-lg border border-input"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Source Text</h3>
                        <p className="mt-1 text-foreground">{translation.sourceText}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          From: {translation.sourceLanguage}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Translation</h3>
                        <p className="mt-1 text-foreground">{translation.translatedText}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          To: {translation.targetLanguage}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Translated on: {new Date(translation.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground">No translation history available.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default History; 