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
      await api.deleteTranslation(id);
      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Translation History
                </h1>
                <p className="text-gray-500 mt-2">View and manage your previous translations</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search translations..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-64 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           transition-all duration-200 ease-in-out"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {error && (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No translations found</h3>
                <p className="mt-1 text-gray-500">Get started by making your first translation</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Original Text
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Translated Text
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Languages
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                          {item.original_text}
                        </td>
                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                          {item.translated_text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.source_lang} → {item.target_lang}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors duration-200"
                            title="Delete translation"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
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