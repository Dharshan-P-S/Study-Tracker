import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { updateTopic } from '../api/topicApi';

Modal.setAppElement('#root');

const TopicEditorModal = ({ isOpen, onRequestClose, topic, onTopicUpdate }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setText(topic.text || '');
      setCurrentImageUrl(topic.imageUrl || null);
      setImageFile(null); // Reset file input when new topic is selected
    }
  }, [topic]);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (!currentImageUrl) {
      formData.append('removeImage', 'true');
    }

    try {
      await updateTopic(topic._id, formData);
      onTopicUpdate(); // Call the parent's refresh function
      onRequestClose();
    } catch (error) {
      console.error("Failed to update topic", error);
      alert("Error saving topic.");
    }
  };

  const handleRemoveImage = () => {
    setCurrentImageUrl(null);
    setImageFile(null);
  };

  if (!topic) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      contentLabel="Edit Topic"
      // 👇 These classes replace the old "customStyles" object
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Edit Topic</h2>
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Notes</label>
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded h-40"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Image</label>
          {currentImageUrl && (
            <div className="mb-2">
              <img src={currentImageUrl} alt="Topic visual" className="w-32 h-32 object-cover rounded" />
              <button type="button" onClick={handleRemoveImage} className="mt-1 text-sm text-red-600 hover:underline">
                Remove Image
              </button>
            </div>
          )}
          <input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files[0];
              setImageFile(file);
              setCurrentImageUrl(file ? URL.createObjectURL(file) : null);
            }} 
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-600 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-500"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onRequestClose} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default TopicEditorModal;