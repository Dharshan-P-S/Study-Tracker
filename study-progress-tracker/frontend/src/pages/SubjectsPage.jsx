import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- This line is the fix
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject } from '../api/subjectsApi';

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
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name}!
        </h1>
        <Link to="/analytics" className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 mr-4">
          View Analytics
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">My Subjects</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          placeholder="Enter new subject name"
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Add Subject
        </button>
      </form>

      {isLoading && <p>Loading subjects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link
            to={`/subjects/${subject._id}`}
            key={subject._id}
            className="block p-4 bg-white border rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{subject.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPage;