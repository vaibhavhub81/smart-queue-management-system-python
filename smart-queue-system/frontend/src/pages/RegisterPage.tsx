import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await api.post('/users/register/', { username, email, password });
      navigate('/login');
    } catch (err: any) {
        if (err.response && err.response.data) {
            const errors = err.response.data;
            const errorMessages = Object.values(errors).flat();
            setError(errorMessages.join(' '));
        } else {
            setError('Failed to register. Please try again.');
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create a new account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Sign up
            </button>
          </div>
        </form>
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
