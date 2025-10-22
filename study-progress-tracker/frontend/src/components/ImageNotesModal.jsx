import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { updateImageNotes } from '../api/imageApi'; // Use the updated API function

Modal.setAppElement('#root');

const ImageNotesModal = ({ isOpen, onRequestClose, image, onUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('Text'); // 'Text', 'Image', 'Link'

  // Form states
  const [textNoteContent, setTextNoteContent] = useState('');
  const [imageNoteFile, setImageNoteFile] = useState(null);
  const [linkNoteTitle, setLinkNoteTitle] = useState('');
  const [linkNoteUrl, setLinkNoteUrl] = useState('');
  const [linkNoteType, setLinkNoteType] = useState('YouTube');

  useEffect(() => {
    if (image) {
      setNotes(image.notes || []);
    }
  }, [image]);

  const resetForms = () => {
    setTextNoteContent('');
    setImageNoteFile(null);
    setLinkNoteTitle('');
    setLinkNoteUrl('');
  };

  const handleAddNote = () => {
    let newNote = null;
    if (activeTab === 'Text') {
      if (!textNoteContent.trim()) return alert('Please enter text for the note.');
      newNote = { noteType: 'Text', content: textNoteContent };
    } else if (activeTab === 'Link') {
      if (!linkNoteTitle.trim() || !linkNoteUrl.trim()) return alert('Please provide a title and URL.');
      newNote = { noteType: 'Link', title: linkNoteTitle, url: linkNoteUrl, linkType: linkNoteType };
    } else if (activeTab === 'Image') {
      if (!imageNoteFile) return alert('Please select an image file.');
      handleSaveChanges(imageNoteFile); // Trigger save immediately for image
      resetForms();
      // Clear the file input visually (optional but good UX)
      const fileInput = document.getElementById('imageNoteFileInput');
      if(fileInput) fileInput.value = '';
      return;
    }

    if (newNote) {
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      handleSaveChanges(null, updatedNotes); // Save immediately
      resetForms();
    }
  };

  const handleDeleteNote = (indexToDelete) => {
    const updatedNotes = notes.filter((_, index) => index !== indexToDelete);
    setNotes(updatedNotes);
    handleSaveChanges(null, updatedNotes); // Save immediately
  };

  const handleSaveChanges = async (newImageFile = null, notesToSave = notes) => {
    try {
      const updatedImage = await updateImageNotes(image._id, notesToSave, newImageFile);
      setNotes(updatedImage.notes); // Update local state with saved notes
      onUpdate(); // Refresh board data
      if (!newImageFile) {
        // Optionally close modal only when not uploading an image
        // onRequestClose();
      }
    } catch (error) {
      console.error("Failed to save image notes", error);
      alert("Error saving notes.");
    }
  };

  if (!image) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Image Notes"
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Notes for Image</h2>
      
      <div className="max-h-[70vh] flex flex-col">
        {/* Add Note Section */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg mb-4">
          <div className="flex border-b border-slate-300 dark:border-slate-700 mb-3">
            {['Text', 'Image', 'Link'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Add {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {activeTab === 'Text' && (
              <textarea placeholder="Enter text note..." value={textNoteContent} onChange={(e) => setTextNoteContent(e.target.value)} className="w-full h-24 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md" />
            )}
            {activeTab === 'Image' && (
               <input id="imageNoteFileInput" type="file" accept="image/*" onChange={(e) => setImageNoteFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-600 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-500"/>
            )}
            {activeTab === 'Link' && (
              <>
                <div className="flex gap-2">
                  <input type="text" placeholder="Link Title" value={linkNoteTitle} onChange={(e) => setLinkNoteTitle(e.target.value)} className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md" />
                  <select value={linkNoteType} onChange={(e) => setLinkNoteType(e.target.value)} className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
                    <option>YouTube</option>
                    <option>Local File</option>
                  </select>
                </div>
                <input type="text" placeholder="URL or File Path" value={linkNoteUrl} onChange={(e) => setLinkNoteUrl(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md" />
              </>
            )}
            <button type="button" onClick={handleAddNote} className="self-end bg-indigo-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-600">Add Note</button>
          </div>
        </div>
        
        {/* List of existing notes */}
        <div className="space-y-3 overflow-y-auto flex-grow pr-2">
          {notes.length > 0 ? notes.map((note, index) => (
            <div key={index} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
              <div className="flex-1 mr-4 overflow-hidden">
                {note.noteType === 'Text' && (
                  <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{note.content}</p>
                )}
                {note.noteType === 'Image' && (
                  <img src={note.imageUrl} alt="Note" className="max-w-xs max-h-40 rounded"/>
                )}
                 {note.noteType === 'Link' && (
                   <div>
                     <span className="font-semibold text-slate-800 dark:text-slate-100">{note.linkType === 'YouTube' ? '▶️' : '📁'} {note.title}</span>
                     <a href={note.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-500 dark:text-blue-400 hover:underline truncate" title={note.url}>
                       {note.url}
                     </a>
                   </div>
                 )}
              </div>
              <button type="button" onClick={() => handleDeleteNote(index)} className="text-red-500 hover:text-red-700 font-bold px-2 flex-shrink-0">✕</button>
            </div>
          )) : <p className="text-center text-slate-500 dark:text-slate-400 py-4">No notes added yet.</p>}
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={onRequestClose} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">Close</button>
        {/* Save All button removed as saves happen immediately */}
      </div>
    </Modal>
  );
};

export default ImageNotesModal;