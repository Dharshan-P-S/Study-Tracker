import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page Imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubjectsPage from './pages/SubjectsPage';
import StudyBoardPage from './pages/StudyBoardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const { user, loading } = useAuth(); // 👈 Get the new loading state

  // 👇 If it's still loading, show a simple loading message
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId" element={<StudyBoardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
        
        {/* Redirect root path based on login status */}
        <Route path="/" element={user ? <Navigate to="/subjects" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;