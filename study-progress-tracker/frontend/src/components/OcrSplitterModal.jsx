import React, { useState } from 'react';
import Modal from 'react-modal';
import { createTopicForSubject } from '../api/topicApi';

Modal.setAppElement('#root');

const OcrSplitterModal = ({ isOpen, onRequestClose, ocrText, subjectId }) => {
  const [separator, setSeparator] = useState('\\n'); // Default to newline
  const [isCreating, setIsCreating] = useState(false);

  if (!ocrText) return null;

  const handleCreateTopics = async () => {
    if (window.confirm("Are you sure you want to add these topics to your 'To Study' list?")) {
      setIsCreating(true);
      let topicsToCreate = [];

      if (separator) {
        // Use a RegExp to handle newline characters properly
        const regex = new RegExp(separator.replace(/\\n/g, '\n'), 'g');
        topicsToCreate = ocrText.split(regex).map(t => t.trim()).filter(t => t.length > 0);
      } else {
        topicsToCreate = [ocrText.trim()];
      }

      try {
        // Create all topics in parallel
        await Promise.all(
          topicsToCreate.map(title => createTopicForSubject(subjectId, { title }))
        );
        alert(`${topicsToCreate.length} topics created successfully!`);
      } catch (error) {
        console.error("Failed to create topics", error);
        alert("An error occurred while creating topics.");
      } finally {
        setIsCreating(false);
        onRequestClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Create Topics from OCR"
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Create Topics from Text</h2>
      <p className="text-sm mb-4 text-slate-600 dark:text-slate-400">
        Enter a "separator" to split the text into multiple topics. For new lines, use `\n`. Leave it empty to create a single topic.
      </p>
      
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Separator:</label>
        <input 
          type="text"
          value={separator}
          onChange={(e) => setSeparator(e.target.value)}
          className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-semibold">Extracted Text Preview:</label>
        <pre className="w-full h-48 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded overflow-auto text-sm">
          {ocrText}
        </pre>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={onRequestClose} disabled={isCreating} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">Cancel</button>
        <button type="button" onClick={handleCreateTopics} disabled={isCreating} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          {isCreating ? 'Creating...' : 'Create Topics'}
        </button>
      </div>
    </Modal>
  );
};

export default OcrSplitterModal;