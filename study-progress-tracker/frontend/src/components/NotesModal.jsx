import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { updateTopicNotes } from '../api/topicApi';

Modal.setAppElement('#root');

const NotesModal = ({ isOpen, onRequestClose, topic, onUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteUrl, setNewNoteUrl] = useState('');
  const [newNoteType, setNewNoteType] = useState('YouTube');

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes || []);
    }
  }, [topic]);

  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteUrl.trim()) {
      alert('Please provide a title and a URL/Path.');
      return;
    }
    setNotes([...notes, { title: newNoteTitle, url: newNoteUrl, noteType: newNoteType }]);
    setNewNoteTitle('');
    setNewNoteUrl('');
  };

  const handleDeleteNote = (indexToDelete) => {
    setNotes(notes.filter((_, index) => index !== indexToDelete));
  };

  const handleSaveChanges = async () => {
    try {
      await updateTopicNotes(topic._id, notes);
      onUpdate();
      onRequestClose();
    } catch (error) {
      console.error("Failed to save notes", error);
      alert("Error saving notes.");
    }
  };

  if (!topic) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Topic Notes"
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Notes for: {topic.title}</h2>
      
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg flex flex-col gap-3 mb-4">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Add New Note</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Note Title" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md" />
            <select value={newNoteType} onChange={(e) => setNewNoteType(e.target.value)} className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
              <option>YouTube</option>
              <option>Local File</option>
            </select>
          </div>
          <input type="text" placeholder="URL or File Path (e.g., file:///C:/docs/note.pdf)" value={newNoteUrl} onChange={(e) => setNewNoteUrl(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md" />
          <button type="button" onClick={handleAddNote} className="self-end bg-indigo-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-600">Add Note</button>
        </div>
        
        <div className="space-y-3">
          {notes.length > 0 ? notes.map((note, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{note.noteType === 'YouTube' ? '▶️' : '📁'} {note.title}</span>
                <a href={note.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-500 dark:text-blue-400 hover:underline truncate" title={note.url}>
                  {note.url}
                </a>
              </div>
              <button type="button" onClick={() => handleDeleteNote(index)} className="text-red-500 hover:text-red-700 font-bold ml-4 px-2 flex-shrink-0">✕</button>
            </div>
          )) : <p className="text-center text-slate-500 dark:text-slate-400 py-4">No notes added yet.</p>}
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-8">
        <button type="button" onClick={onRequestClose} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">Close</button>
        <button type="button" onClick={handleSaveChanges} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Notes</button>
      </div>
    </Modal>
  );
};

export default NotesModal;