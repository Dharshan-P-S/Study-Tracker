import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createTopicForSubject } from '../api/topicApi';
import { createStickyNote, deleteStickyNote } from '../api/stickyNoteApi';
import { getSubjects } from '../api/subjectsApi';

Modal.setAppElement('#root');

const DateDetailModal = ({ isOpen, onRequestClose, date, dayTopics, dayNotes, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('View'); // 'View', 'AddTopic', 'AddNote'
  
  // Add Topic Form State
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicTime, setTopicTime] = useState(null);
  const [topicStatus, setTopicStatus] = useState('To Study');

  // Add Sticky Note Form State
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch subjects for the dropdown
      getSubjects().then(setSubjects).catch(console.error);
      // Default time to the selected date
      setTopicTime(date);
    }
  }, [isOpen, date]);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicTitle) return alert("Subject and Title required");

    // Combine selected date with selected time
    let finalDate = new Date(date);
    if (topicTime) {
        finalDate.setHours(topicTime.getHours());
        finalDate.setMinutes(topicTime.getMinutes());
    }

    try {
        // We reuse the existing API. Note: Status logic might need backend update if you want to set it initially, 
        // currently backend defaults to "To Study". We will save the topic first.
        await createTopicForSubject(selectedSubjectId, { 
            title: topicTitle, 
            dueDate: finalDate 
        });
        // Note: Standard create API defaults to 'To Study'. If you need custom status on create, backend update needed.
        
        alert("Topic Added!");
        setTopicTitle('');
        onUpdate();
        setActiveTab('View');
    } catch (error) {
        console.error(error);
        alert("Failed to add topic");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent) return;
    try {
        await createStickyNote({ date: date, content: noteContent });
        setNoteContent('');
        onUpdate();
        setActiveTab('View');
    } catch (error) {
        console.error(error);
    }
  };

  const handleDeleteNote = async (id) => {
      if(window.confirm("Delete this note?")) {
          await deleteStickyNote(id);
          onUpdate();
      }
  }

  if (!date) return null;

  // Helper to format date header
  const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="p-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 focus:outline-none max-h-[90vh] flex flex-col"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dateString}</h2>
        <div className="flex gap-2 mt-4">
            <button onClick={() => setActiveTab('View')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${activeTab === 'View' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Overview</button>
            <button onClick={() => setActiveTab('AddTopic')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${activeTab === 'AddTopic' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>+ Topic</button>
            <button onClick={() => setActiveTab('AddNote')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${activeTab === 'AddNote' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>+ Sticky Note</button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-grow">
        
        {/* VIEW TAB */}
        {activeTab === 'View' && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">📅 Scheduled Topics</h3>
                    {dayTopics.length > 0 ? (
                        <div className="space-y-2">
                            {dayTopics.map(topic => (
                                <div key={topic._id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{topic.title}</p>
                                        <p className="text-xs text-slate-500">{new Date(topic.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {topic.subjectId?.name}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold 
                                        ${topic.status === 'To Study' ? 'bg-blue-100 text-blue-700' : 
                                          topic.status === 'Partially Studied' ? 'bg-yellow-100 text-yellow-700' :
                                          topic.status === 'Fully Studied' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {topic.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500 italic">No topics scheduled.</p>}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">📝 Sticky Notes</h3>
                    {dayNotes.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {dayNotes.map(note => (
                                 <div key={note._id} className="relative p-4 bg-yellow-200 text-yellow-900 rounded shadow-md rotate-1">
                                     <p className="font-handwriting text-sm whitespace-pre-wrap">{note.content}</p>
                                     <button onClick={() => handleDeleteNote(note._id)} className="absolute top-1 right-2 text-yellow-800 hover:text-red-600 font-bold">×</button>
                                 </div>
                             ))}
                         </div>
                    ) : <p className="text-slate-500 italic">No notes for today.</p>}
                </div>
            </div>
        )}

        {/* ADD TOPIC TAB */}
        {activeTab === 'AddTopic' && (
            <form onSubmit={handleAddTopic} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <select 
                        value={selectedSubjectId} 
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        required
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic Name</label>
                    <input 
                        type="text" 
                        value={topicTitle}
                        onChange={(e) => setTopicTitle(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Time (Optional)</label>
                    <DatePicker
                        selected={topicTime}
                        onChange={(date) => setTopicTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    />
                </div>
                 {/* Initial Status Selection is visual only unless backend supports create-with-status */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                    <select 
                        value={topicStatus} 
                        onChange={(e) => setTopicStatus(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    >
                        <option>To Study</option>
                        <option>Partially Studied</option>
                        <option>Fully Studied</option>
                        <option>To Be Revised</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Note: Topic will be created in 'To Study' column by default.</p>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Topic to Schedule</button>
            </form>
        )}

        {/* ADD NOTE TAB */}
        {activeTab === 'AddNote' && (
            <form onSubmit={handleAddNote} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note Content</label>
                    <textarea 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full h-32 p-2 rounded border border-slate-300 dark:border-slate-600 bg-yellow-50 text-slate-800 placeholder:text-slate-400"
                        placeholder="Write your reminder here..."
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-shadow">Stick It!</button>
            </form>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-lg flex justify-end">
          <button onClick={onRequestClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Close</button>
      </div>
    </Modal>
  );
};

export default DateDetailModal;