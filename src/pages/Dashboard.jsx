import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import { api } from '../services/api'; // Import the api object

const Dashboard = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
  ];

  const handleTranslate = async () => {
    setError('');
    setIsLoading(true);

    try {
      const data = await api.translate({
        text: sourceText,
        source: sourceLanguage,
        target: targetLanguage,
      });
      setTranslatedText(data.translatedText); // Assuming the API returns `translatedText`
    } catch (err) {
      console.error('Translation error:', err.message);
      setError(err.message || 'An error occurred during translation.');
    } finally {
      setIsLoading(false);
    }
  };
  // const handleTranslate = async () => {
  //   setError('');
  //   setIsLoading(true);

  //   try {
  //     // Replace this URL with your translation API endpoint
  //     const response = await fetch('https://7ghxgm6wrk.execute-api.us-east-1.amazonaws.com/prouduction//translateFunction', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         text: sourceText,
  //         source: sourceLanguage,
  //         target: targetLanguage,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to translate text. Please try again.');
  //     }

  //     const data = await response.json();
  //     setTranslatedText(data.translatedText); // Assuming the API returns `translatedText`
  //   } catch (err) {
  //     console.error('Translation error:', err.message);
  //     setError(err.message || 'An error occurred during translation.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Translate Text</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Source Language
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter Text
                </label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="w-full h-40 rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Enter text to translate..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Translation
                </label>
                <div className="w-full h-40 rounded-md border border-input bg-background px-3 py-2">
                  {isLoading
                    ? 'Translating...'
                    : translatedText || 'Translation will appear here...'}
                  </div>
              </div>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center mt-4">
              {error}
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <Button onClick={handleTranslate} size="lg" disabled={isLoading}>
              {isLoading ? 'Translating...' : 'Translate'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;