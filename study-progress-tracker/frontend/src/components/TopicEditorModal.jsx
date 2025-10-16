import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { updateTopic } from '../api/topicApi';

// Style for the modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
  },
};

Modal.setAppElement('#root'); // Important for accessibility

const TopicEditorModal = ({ isOpen, onRequestClose, topic, onTopicUpdate }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    // When a new topic is passed in, update the form fields
    if (topic) {
      setTitle(topic.title);
      setText(topic.text || '');
    }
  }, [topic]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Use FormData to send both text and file data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const updatedTopicData = await updateTopic(topic._id, formData);
      onTopicUpdate(updatedTopicData); // Update the state in the parent component
      onRequestClose(); // Close the modal
    } catch (error) {
      console.error("Failed to update topic", error);
      alert("Error saving topic.");
    }
  };

  if (!topic) return null;

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles} contentLabel="Edit Topic">
      <h2 className="text-2xl font-bold mb-4">Edit Topic</h2>
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded"/>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Notes</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 border rounded h-40"/>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Upload Image</label>
          {topic.imageUrl && !imageFile && <img src={topic.imageUrl} alt="Topic visual" className="w-32 h-32 object-cover mb-2 rounded" />}
          <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="w-full"/>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onRequestClose} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default TopicEditorModal;