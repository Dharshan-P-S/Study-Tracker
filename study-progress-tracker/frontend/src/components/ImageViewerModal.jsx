import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { updateImage, deleteImage } from '../api/imageApi';
import AnnotationCanvas from './AnnotationCanvas';

Modal.setAppElement('#root');

const ImageViewerModal = ({ isOpen, onRequestClose, image, onUpdate }) => {
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [selectedColor, setSelectedColor] = useState({ name: 'To Study', fill: 'rgba(59, 130, 246, 0.5)' });

  useEffect(() => {
    if (image) {
      setDescription(image.description || '');
      setStatus(image.status || 'To Study');
      setAnnotations(image.annotations || []);
    }
  }, [image]);

  if (!image) return null;

  const statusColors = {
    'To Study': { name: 'To Study', fill: 'rgba(59, 130, 246, 0.5)', bg: 'bg-blue-500' },
    'Partially Studied': { name: 'Partially Studied', fill: 'rgba(234, 179, 8, 0.5)', bg: 'bg-yellow-500' },
    'Fully Studied': { name: 'Fully Studied', fill: 'rgba(34, 197, 94, 0.5)', bg: 'bg-green-500' },
    'To Be Revised': { name: 'To Be Revised', fill: 'rgba(239, 68, 68, 0.5)', bg: 'bg-red-500' },
  };

  const handleSaveChanges = async () => {
    try {
      await updateImage(image._id, { description, status, annotations });
      onUpdate();
      onRequestClose();
    } catch (error) {
      console.error("Failed to save changes", error);
      alert("Error saving changes.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this image and all its annotations?")) {
      try {
        await deleteImage(image._id);
        onUpdate();
        onRequestClose();
      } catch (error) {
        console.error("Failed to delete image", error);
        alert("Error deleting image.");
      }
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="View Image"
      className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col md:flex-row gap-6 border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
    >
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Image & Canvas */}
        <div className="flex-1 h-full flex items-center justify-center">
          <AnnotationCanvas
            imageUrl={image.imageUrl}
            initialAnnotations={annotations}
            onAnnotationsChange={setAnnotations}
            selectedColor={selectedColor}
          />
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col">
          <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">Highlighter Color</h3>
          <div className="space-y-2 mb-6">
            {Object.values(statusColors).map(colorInfo => (
              <button
                key={colorInfo.name}
                onClick={() => setSelectedColor(colorInfo)}
                className={`w-full text-left p-2 rounded-md text-white font-semibold transition-all ${colorInfo.name === selectedColor.name ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : 'opacity-60 hover:opacity-100'} ${colorInfo.bg}`}
              >
                {colorInfo.name}
              </button>
            ))}
          </div>

          <div className="flex-grow">
            <label className="block text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2 mt-4">
            <button onClick={handleSaveChanges} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">
              Save Changes
            </button>
            <button onClick={handleDelete} className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700">
              Delete Image
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageViewerModal;
