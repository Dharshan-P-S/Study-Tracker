import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { updateTopic, deleteTopic } from '../api/topicApi';

Modal.setAppElement('#root');

const TopicEditorModal = ({ isOpen, onRequestClose, topic, onTopicUpdate }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
    }
  }, [topic]);

  // Handler for saving the title change
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateTopic(topic._id, { title });
      onTopicUpdate(); // Refresh the board
      onRequestClose(); // Close the modal
    } catch (error) {
      console.error("Failed to update topic", error);
      alert("Error saving topic.");
    }
  };

  // Handler for deleting the topic
  const handleDelete = async () => {
    // Show a confirmation dialog to prevent accidental deletion
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
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          />
        </div>

        <div className="flex justify-between items-center">
          {/* Delete button on the left */}
          <button 
            type="button" 
            onClick={handleDelete} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Delete Topic
          </button>
          
          {/* Save and Cancel buttons on the right */}
          <div className="flex gap-4">
            <button type="button" onClick={onRequestClose} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Save</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TopicEditorModal;