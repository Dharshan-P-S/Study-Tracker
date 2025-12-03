import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/sticky-notes';

export const getStickyNotes = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const createStickyNote = async (noteData) => {
  const response = await axios.post(API_BASE_URL, noteData);
  return response.data;
};

export const deleteStickyNote = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};