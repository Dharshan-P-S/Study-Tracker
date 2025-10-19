import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    try {
      await register(name, email, password);
      navigate('/subjects');
    } catch (err) {
      setError('Failed to register. An account with this email may already exist.');
      console.error('Failed to register:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md w-full max-w-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100" 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100" 
              required 
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold">
            Register
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;