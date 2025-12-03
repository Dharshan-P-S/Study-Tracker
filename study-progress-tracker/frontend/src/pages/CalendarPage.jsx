import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTopics } from '../api/topicApi';
import { getStickyNotes } from '../api/stickyNoteApi';
import DateDetailModal from '../components/DateDetailModal';

const CalendarPage = () => {
  const [topics, setTopics] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchData = async () => {
    try {
      const [topicsData, notesData] = await Promise.all([getAllTopics(), getStickyNotes()]);
      setTopics(topicsData);
      setStickyNotes(notesData);
    } catch (error) {
      console.error("Failed to fetch calendar data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const renderCalendarCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[120px]"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = new Date().toDateString() === cellDate.toDateString();
      
      let dayTopics = topics.filter(topic => {
        if (!topic.dueDate) return false;
        const tDate = new Date(topic.dueDate);
        return tDate.toDateString() === cellDate.toDateString();
      });

      dayTopics.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      const dayNotes = stickyNotes.filter(note => {
          const nDate = new Date(note.date);
          return nDate.toDateString() === cellDate.toDateString();
      });

      const hasStickyNotes = dayNotes.length > 0;

      cells.push(
        <div 
            key={day} 
            onClick={() => handleDayClick(cellDate)}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 min-h-[120px] transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 relative group cursor-pointer`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
              {day}
            </span>
            {hasStickyNotes && (
                <img 
                    src="/stickynote.png" 
                    alt="Note" 
                    className="w-6 h-6 absolute top-1 right-1 drop-shadow-md" 
                    title="You have sticky notes for this day"
                />
            )}
          </div>
          
          <div className="mt-2 space-y-1 overflow-hidden">
            {dayTopics.slice(0, 3).map(topic => {
               // Check if overdue: date is past AND status is not 'Fully Studied'
               const isOverdue = new Date(topic.dueDate) < new Date() && topic.status !== 'Fully Studied';
               
               return (
                  <Link to={`/subjects/${topic.subjectId._id}`} key={topic._id} className="block">
                    <div 
                      className={`text-xs px-2 py-1 rounded truncate shadow-sm hover:opacity-80 
                                  bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-l-4
                                  ${isOverdue ? 'border-2 border-red-500 dark:border-red-500' : ''}`}
                      style={{ borderLeftColor: topic.subjectId?.color || '#64748B' }}
                      title={`${topic.title} (${topic.subjectId?.name}) ${isOverdue ? '- OVERDUE' : ''}`}
                    >
                      {topic.title}
                    </div>
                  </Link>
               );
            })}
            {dayTopics.length > 3 && (
                <div className="text-xs text-center text-slate-400 font-bold">... {dayTopics.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }
    return cells;
  };

  const selectedDayTopics = selectedDate ? topics.filter(topic => topic.dueDate && new Date(topic.dueDate).toDateString() === selectedDate.toDateString()) : [];
  const selectedDayNotes = selectedDate ? stickyNotes.filter(note => new Date(note.date).toDateString() === selectedDate.toDateString()) : [];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 flex flex-col">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 flex-grow flex flex-col">
        
        <header className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold capitalize">
               {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
             </h1>
             <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
             </div>
           </div>
           <Link to="/subjects" className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition">
             Back to Subjects
           </Link>
        </header>

        <div className="flex-grow flex flex-col border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-slate-900">
          <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase text-sm tracking-wider">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr flex-grow">
             {renderCalendarCells()}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <img src="/stickynote.png" alt="Sticky Note" className="w-8 h-8" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">
                If you see this yellow note, it means you have special reminders or notes for that day! Click the day to view them.
            </p>
        </div>

      </div>

      <DateDetailModal 
        isOpen={isModalOpen} 
        onRequestClose={() => setIsModalOpen(false)} 
        date={selectedDate}
        dayTopics={selectedDayTopics}
        dayNotes={selectedDayNotes}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default CalendarPage;