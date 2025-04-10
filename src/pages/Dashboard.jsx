import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [translationHistory, setTranslationHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const languages = [
    { code: 'auto', name: 'Detect Language' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'te', name: 'Telugu' }
  ];

  useEffect(() => {
    fetchTranslationHistory();
  }, []);

  const fetchTranslationHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await api.getTranslationHistory();
      console.log('Fetched translation history:', response);
      if (response.translations) {
        setTranslationHistory(response.translations);
      }
    } catch (err) {
      console.error('Failed to fetch translation history:', err);
      if (err.message.includes('authentication') || err.message.includes('login')) {
        navigate('/login');
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (sourceLanguage === targetLanguage && sourceLanguage !== 'auto') {
      setError('Source and target languages cannot be the same');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      console.log('Starting translation:', {
        text: sourceText,
        source_lang: sourceLanguage,
        target_lang: targetLanguage
      });

      const result = await api.translate({
        text: sourceText,
        source: sourceLanguage,
        target: targetLanguage
      });

      console.log('Translation result:', result);

      if (result.translatedText) {
        setTranslatedText(result.translatedText);
        
        // If language was auto-detected, update the source language
        if (sourceLanguage === 'auto' && result.sourceLang) {
          setSourceLanguage(result.sourceLang);
        }

        // Save to history
        try {
          await api.saveTranslation({
            originalText: sourceText,
            translatedText: result.translatedText,
            sourceLang: result.sourceLang || sourceLanguage,
            targetLang: result.targetLang
          });
          // Refresh history after saving
          await fetchTranslationHistory();
        } catch (saveError) {
          console.error('Failed to save translation history:', saveError);
        }
      } else {
        throw new Error('No translation received from the server');
      }
    } catch (err) {
      console.error('Translation error:', err);
      if (err.message.includes('authentication') || err.message.includes('login')) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to translate text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
      // Swap the texts as well
      setSourceText(translatedText);
      setTranslatedText(sourceText);
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
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Translator</h1>

            {error && (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Language Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="bg-background text-foreground border border-input rounded-lg px-3 py-2"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter text to translate"
                  className="w-full h-40 p-4 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Swap and Target Language Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSwapLanguages}
                    disabled={sourceLanguage === 'auto'}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full disabled:opacity-50"
                  >
                    ⇄
                  </button>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-background text-foreground border border-input rounded-lg px-3 py-2"
                  >
                    {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={translatedText}
                  readOnly
                  placeholder="Translation will appear here"
                  className="w-full h-40 p-4 bg-background text-foreground border border-input rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Translating...' : 'Translate'}
              </button>
            </div>

            {/* Translation History Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Translation History</h2>
              {isHistoryLoading ? (
                <div className="text-center py-4">Loading history...</div>
              ) : translationHistory.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No translation history yet</div>
              ) : (
                <div className="space-y-4">
                  {translationHistory.map((item, index) => (
                    <div key={index} className="p-4 bg-background border border-input rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.source_lang} → {item.target_lang}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">{item.original_text}</div>
                        <div className="text-primary">{item.translated_text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;