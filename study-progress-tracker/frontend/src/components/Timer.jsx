// frontend/src/components/Timer.jsx
import React, { useState, useEffect } from 'react';

// This component takes one prop: a function to call when a session is complete.
const Timer = ({ onSessionComplete }) => {
  const [time, setTime] = useState(0); // Time in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [isActive, time]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    if (time > 0) {
      onSessionComplete(time); // Send the final time to the parent component
    }
    setIsActive(false);
    setTime(0);
  };

  // Helper function to format time in HH:MM:SS
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-center">
      <div className="text-5xl font-mono mb-4">{formatTime(time)}</div>
      <div className="flex justify-center gap-4">
        {!isActive ? (
          <button onClick={handleStart} className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
            Start
          </button>
        ) : (
          <button onClick={handlePause} className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600">
            Pause
          </button>
        )}
        <button onClick={handleStop} className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600">
          Stop & Log
        </button>
      </div>
    </div>
  );
};

export default Timer;