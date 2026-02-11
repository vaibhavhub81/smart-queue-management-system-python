import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">403</h1>
        <p className="text-xl font-semibold">Unauthorized</p>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <Link to="/" className="mt-4 inline-block px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
