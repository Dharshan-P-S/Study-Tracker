import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStudySessions } from '../api/sessionApi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Helper function to generate a consistent color from a string (like a subject name)
const generatePastelColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
};


const AnalyticsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudySessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process data for the charts
  const chartData = useMemo(() => {
    const dataBySubject = {};
    sessions.forEach(session => {
      if (session.subjectId) {
        const { name, color } = session.subjectId;
        // This is the key change. We generate a color if the default is used.
        const effectiveColor = (color && color !== '#CCCCCC') ? color : generatePastelColor(name);

        if (dataBySubject[name]) {
          dataBySubject[name].duration += session.duration;
        } else {
          dataBySubject[name] = { duration: session.duration, color: effectiveColor };
        }
      }
    });
    
    const labels = Object.keys(dataBySubject);
    const data = labels.map(label => dataBySubject[label].duration / 60); // Convert seconds to minutes
    const backgroundColors = labels.map(label => dataBySubject[label].color);

    return {
      pie: {
        labels,
        datasets: [{
          label: 'Minutes Studied',
          data,
          backgroundColor: backgroundColors,
          borderColor: document.documentElement.classList.contains('dark') ? '#0F172A' : '#FFFFFF', // slate-900 or white
          borderWidth: 2,
        }],
      }
    };
  }, [sessions]);

  const totalMinutes = useMemo(() => sessions.reduce((acc, s) => acc + s.duration, 0) / 60, [sessions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94A3B8', // slate-400
          font: {
            size: 14,
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="flex items-center pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <Link to="/subjects" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Subjects
        </Link>
      </header>
      
      <main>
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-slate-800 dark:text-slate-100">Your Study Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Total Sessions Logged</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-2">{sessions.length}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Total Minutes Studied</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-2">{totalMinutes.toFixed(1)}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Average Session</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-2">
              {sessions.length > 0 ? (totalMinutes / sessions.length).toFixed(1) : 0} <span className="text-2xl">min</span>
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Time per Subject (in minutes)</h2>
          {sessions.length > 0 ? (
            <div style={{ position: 'relative', height: '40vh' }}>
              <Pie data={chartData.pie} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No study sessions logged yet. Go start the timer!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;