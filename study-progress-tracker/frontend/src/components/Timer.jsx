import React, { useState, useEffect } from 'react';

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
    return () => clearInterval(interval);
  }, [isActive, time]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    if (time > 0) {
      onSessionComplete(time);
    }
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center border border-slate-200 dark:border-slate-700">
      <div className="text-3xl font-mono mb-3 text-slate-800 dark:text-slate-100">{formatTime(time)}</div>
      <div className="flex justify-center gap-3">
        {!isActive ? (
          <button onClick={handleStart} className="bg-green-500 text-white px-4 py-1 rounded-md text-sm font-semibold hover:bg-green-600">
            Start
          </button>
        ) : (
          <button onClick={handlePause} className="bg-yellow-500 text-white px-4 py-1 rounded-md text-sm font-semibold hover:bg-yellow-600">
            Pause
          </button>
        )}
        <button onClick={handleStop} className="bg-red-500 text-white px-4 py-1 rounded-md text-sm font-semibold hover:bg-red-600">
          Stop & Log
        </button>
      </div>
    </div>
  );
};

export default Timer;