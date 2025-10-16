import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStudySessions } from '../api/sessionApi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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

  // Process data for the charts using useMemo for efficiency
  const chartData = useMemo(() => {
    const dataBySubject = {};
    sessions.forEach(session => {
      if (session.subjectId) {
        const { name, color } = session.subjectId;
        if (dataBySubject[name]) {
          dataBySubject[name].duration += session.duration;
        } else {
          dataBySubject[name] = { duration: session.duration, color: color };
        }
      }
    });
    
    const labels = Object.keys(dataBySubject);
    const data = labels.map(label => dataBySubject[label].duration / 60); // in minutes
    const backgroundColors = labels.map(label => dataBySubject[label].color || '#CCCCCC');

    return {
      pie: {
        labels,
        datasets: [{
          label: 'Minutes Studied',
          data,
          backgroundColor: backgroundColors,
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      }
    };
  }, [sessions]);

  const totalMinutes = useMemo(() => sessions.reduce((acc, s) => acc + s.duration, 0) / 60, [sessions]);

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/subjects" className="text-blue-500 hover:underline mb-6 block">&larr; Back to Subjects</Link>
      <h1 className="text-3xl font-bold mb-6">Your Study Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-600">Total Sessions Logged</h3>
          <p className="text-4xl font-bold">{sessions.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-600">Total Minutes Studied</h3>
          <p className="text-4xl font-bold">{totalMinutes.toFixed(1)}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-600">Average Session</h3>
          <p className="text-4xl font-bold">
            {sessions.length > 0 ? (totalMinutes / sessions.length).toFixed(1) : 0} min
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Time per Subject (in minutes)</h2>
        {sessions.length > 0 ? (
          <div style={{ position: 'relative', height: '40vh' }}>
            <Pie data={chartData.pie} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        ) : (
          <p>No study sessions logged yet. Go start the timer!</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;