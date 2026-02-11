import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeAuthTokens, getUserRole } from '../utils/auth';
import { UserIcon } from '@heroicons/react/24/solid';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  const handleLogout = () => {
    removeAuthTokens();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container flex items-center justify-between p-4 mx-auto">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Smart Queue
        </Link>
        <div className="flex items-center space-x-4">
          {userRole === 'staff' && (
            <Link to="/staff" className="text-gray-600 hover:text-indigo-600">Staff Dashboard</Link>
          )}
          {userRole === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin Dashboard</Link>
          )}
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{userRole}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
