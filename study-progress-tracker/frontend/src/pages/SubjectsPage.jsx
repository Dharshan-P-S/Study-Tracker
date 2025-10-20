import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject } from '../api/subjectsApi';

// A new component for the "empty state"
const EmptyState = () => (
  <div className="text-center py-16 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">No subjects found</h3>
    <p className="text-slate-500 dark:text-slate-400 mt-2">Get started by adding your first subject above!</p>
  </div>
);

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const data = await getSubjects();
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subjects.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await createSubject({ name: newSubjectName });
      setNewSubjectName('');
      fetchSubjects();
    } catch (err) {
      setError('Failed to add subject.');
      console.error(err);
    }
  };

  return (
    // Main container with constrained width and more padding
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

      {/* Page Header */}
      <header className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Welcome, {user?.name}!
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/about" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-semibold shadow">            
            About
          </Link>
          <Link to="/analytics" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-sm font-semibold shadow">
            View Analytics
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-semibold shadow"
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {/* Section Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold tracking-tight">My Subjects</h2>
        </div>

        {/* Add Subject Form */}
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Enter new subject name"
            className="flex-grow p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold shadow"
          >
            Add Subject
          </button>
        </form>

        {/* Subjects Grid or Empty State */}
        {isLoading && <p>Loading subjects...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                to={`/subjects/${subject._id}`}
                key={subject._id}
                className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{subject.name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          !isLoading && <EmptyState />
        )}
      </main>
    </div>
  );
};

export default SubjectsPage;