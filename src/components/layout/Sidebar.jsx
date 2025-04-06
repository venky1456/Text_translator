import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/utils';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/history', label: 'History', icon: '📜' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-background border-r border-border fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">Translator App</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
                        <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>

            // <Link
            //   key={item.path}
            //   to={item.path}
            //   className={cn(
            //     'flex items-center gap-2 px-4 py-2 rounded-md transition-colors',
            //     location.pathname === item.path
            //       ? 'bg-primary text-white'
            //       : 'hover:bg-accent'
            //   )}
            // >
            //   <span>{item.icon}</span>
            //   <span>{item.label}</span>
            // </Link>
          ))}
          <button
            className="flex items-center gap-2 w-full px-4 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;