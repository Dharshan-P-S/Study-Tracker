import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjectsApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Icon Components
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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
  
  // Edit State
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editName, setEditName] = useState('');

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
    }
  };

  // Handle Start Editing
  const startEditing = (e, subject) => {
    e.preventDefault(); // Prevent link navigation
    setEditingSubjectId(subject._id);
    setEditName(subject.name);
  };

  // Handle Cancel Editing
  const cancelEditing = (e) => {
    e.preventDefault();
    setEditingSubjectId(null);
    setEditName('');
  };

  // Handle Update Subject
  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent form submission/link click
    if (!editName.trim()) return;
    try {
      await updateSubject(editingSubjectId, { name: editName });
      setEditingSubjectId(null);
      fetchSubjects();
    } catch (err) {
      alert('Failed to update subject.');
    }
  };

  // Handle Delete Subject
  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent link navigation
    if (window.confirm("Are you sure? This will delete ALL topics and images inside this subject permanently.")) {
      try {
        await deleteSubject(id);
        fetchSubjects();
      } catch (err) {
        alert('Failed to delete subject.');
      }
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

      {/* Header */}
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

      <main className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-grow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Subjects</h2>
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

            {/* Subjects Grid */}
            {isLoading && <p>Loading subjects...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                  <div key={subject._id} className="relative group">
                     {editingSubjectId === subject._id ? (
                        // Edit Mode
                        <div className="block p-6 bg-white dark:bg-slate-800 border border-blue-500 rounded-lg shadow-lg">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-grow p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded"
                                    autoFocus
                                />
                                <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
                                <button onClick={cancelEditing} className="bg-slate-500 text-white px-3 py-1 rounded hover:bg-slate-600">Cancel</button>
                            </div>
                        </div>
                     ) : (
                        // View Mode (Link to Board)
                        <Link
                            to={`/subjects/${subject._id}`}
                            className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all relative"
                        >
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 pr-16 truncate">{subject.name}</h3>
                            <p className="text-sm text-slate-500 mt-2">Click to view board</p>
                            
                            {/* Edit/Delete Buttons (Absolute positioned) */}
                            <div className="absolute top-6 right-6 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => startEditing(e, subject)} 
                                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-blue-50 dark:hover:bg-slate-600"
                                    title="Edit Name"
                                >
                                    <EditIcon />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, subject._id)} 
                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-red-50 dark:hover:bg-slate-600"
                                    title="Delete Subject"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        </Link>
                     )}
                  </div>
                ))}
            </div>
            ) : (
                !isLoading && <EmptyState />
            )}
        </div>

        {/* RIGHT COLUMN: Calendar Widget */}
        <div className="w-full lg:w-80 flex-shrink-0">
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    Calendar
                 </h3>
                 <div className="flex justify-center">
                    <DatePicker
                        inline
                        readOnly
                        // No calendarClassName needed with our new global CSS
                    />
                 </div>
                 <Link to="/calendar" className="mt-4 block w-full text-center bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-md text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                     Open Full Calendar
                 </Link>
             </div>
        </div>

      </main>
    </div>
  );
};

export default SubjectsPage;