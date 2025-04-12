import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';

const History = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      const response = await api.getTranslationHistory();
      if (response && Array.isArray(response)) {
        setHistory(response);
        setFilteredHistory(response);
      } else {
        setHistory([]);
        setFilteredHistory([]);
      }
    } catch (err) {
      if (
        err.message.includes('Session expired') ||
        err.message.includes('No authentication token') ||
        err.message === 'Unauthorized'
      ) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to fetch translation history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTranslation(id); // Call the API to delete the translation
      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id)); // Remove the deleted item from the state
      setFilteredHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting translation:', err);
      setError('Failed to delete translation. Please try again.');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = history.filter(
      (item) =>
        item.original_text.toLowerCase().includes(query) ||
        item.translated_text.toLowerCase().includes(query)
    );
    setFilteredHistory(filtered);
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
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Translation History</h1>
            <p className="text-gray-500">View and manage your previous translations</p>

            {error && (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search translations..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loading ? (
              <div className="text-center py-4">Loading history...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No translation history found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-background border border-input rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                        Original Text
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                        Translated Text
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                        Languages
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="border-t border-input">
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {item.original_text}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {item.translated_text}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {item.source_lang} → {item.target_lang}
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-6 h-6 inline-block"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 9l-1.5 10.5a2.25 2.25 0 01-2.25 2.25H8.25a2.25 2.25 0 01-2.25-2.25L4.5 9m15 0H4.5m15 0l-.75-3.75A2.25 2.25 0 0016.5 3h-9a2.25 2.25 0 00-2.25 2.25L4.5 9m15 0H4.5"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default History;