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
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [error, setError] = useState('');

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
    { code: 'te', name: 'Telugu' },
  ];

  useEffect(() => {
    fetchTranslationHistory();
  }, []);

  const fetchTranslationHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await api.getTranslationHistory();
      if (Array.isArray(response)) {
        setTranslationHistory(response);
      } else if (response && response.translations) {
        setTranslationHistory(response.translations);
      } else {
        setTranslationHistory([]);
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

      const result = await api.translate({
        text: sourceText,
        source: sourceLanguage,
        target: targetLanguage,
      });

      if (result.translatedText) {
        setTranslatedText(result.translatedText);

        if (sourceLanguage === 'auto' && result.sourceLang) {
          setSourceLanguage(result.sourceLang);
        }

        try {
          await api.saveTranslation({
            originalText: sourceText,
            translatedText: result.translatedText,
            sourceLang: result.sourceLang || sourceLanguage,
            targetLang: result.targetLang,
          });
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Translator
            </h1>

            {error && (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Language Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text to translate"
                    className="w-full h-48 p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                  />
                  {sourceText && (
                    <button
                      onClick={() => setSourceText('')}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Target Language Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSwapLanguages}
                    disabled={sourceLanguage === 'auto'}
                    className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:scale-105 transition-all duration-200"
                    title="Swap languages"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                      />
                    </svg>
                  </button>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {languages
                      .filter((lang) => lang.code !== 'auto')
                      .map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="relative">
                  <textarea
                    value={translatedText}
                    readOnly
                    placeholder="Translation will appear here"
                    className="w-full h-48 p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm resize-none"
                  />
                  {translatedText && (
                    <button
                      onClick={() => navigator.clipboard.writeText(translatedText)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy translation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleTranslate}
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-medium text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800'
                } transition-all duration-200 shadow-lg transform hover:scale-105`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Translating...</span>
                  </div>
                ) : (
                  'Translate'
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;