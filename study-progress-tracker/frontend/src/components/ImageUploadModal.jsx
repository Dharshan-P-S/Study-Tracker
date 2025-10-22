import React, { useState } from 'react';
import Modal from 'react-modal';
import { uploadImage } from '../api/imageApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement('#root');

const ImageUploadModal = ({ isOpen, onRequestClose, subjectId, onUploadComplete }) => {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dueDate, setDueDate] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('description', description);
    formData.append('image', imageFile);
    if (dueDate) {
      formData.append('dueDate', dueDate.toISOString()); 
    }

    try {
      await uploadImage(subjectId, formData);
      onUploadComplete(); // Tell the parent page to refresh
      onRequestClose(); // Close the modal
      // Reset form
      setDescription('');
      setImageFile(null);
      setDueDate(null);
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Upload Image"
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Upload New Image</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Due Date (Optional)</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            minDate={new Date()}
            timeIntervals={15}
            dateFormat="Pp"
            isClearable
            placeholderText="Set due date..."
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100"
            calendarClassName="dark-mode-calendar"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Image File</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-600 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-500"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onRequestClose} disabled={isUploading} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600">Cancel</button>
          <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ImageUploadModal;