import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateTopic, deleteTopic } from '../api/topicApi';

Modal.setAppElement('#root');

const TopicEditorModal = ({ isOpen, onRequestClose, topic, onTopicUpdate }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      // Initialize date picker state from topic data
      setDueDate(topic.dueDate ? new Date(topic.dueDate) : null);
    }
  }, [topic]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Send both title and dueDate (which might be null)
      await updateTopic(topic._id, { title, dueDate }); 
      onTopicUpdate(); // Refresh the board
      onRequestClose(); // Close the modal
    } catch (error) {
      console.error("Failed to update topic", error);
      alert("Error saving topic.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the topic "${topic.title}"?`)) {
      try {
        await deleteTopic(topic._id);
        onTopicUpdate(); // Refresh the board
        onRequestClose(); // Close the modal
      } catch (error) {
        console.error("Failed to delete topic", error);
        alert("Error deleting topic.");
      }
    }
  };

  if (!topic) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      contentLabel="Edit Topic"
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Edit Topic</h2>
      <form onSubmit={handleSave}>
        <div className="mb-4"> {/* Changed margin */}
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Due Date (Optional)</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            minDate={new Date()} // Disable past dates
            timeIntervals={1} // Allow minute selection
            dateFormat="Pp" // Format like "10/22/2025, 2:30 PM"
            isClearable // Allows removing the date
            placeholderText="Click to select date and time"
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex justify-between items-center">
          <button 
            type="button" 
            onClick={handleDelete} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Delete Topic
          </button>
          <div className="flex gap-4">
            <button type="button" onClick={onRequestClose} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TopicEditorModal;