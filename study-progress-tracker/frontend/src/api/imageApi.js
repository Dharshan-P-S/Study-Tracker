import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// GET /api/subjects/:subjectId/images
export const getImagesForSubject = async (subjectId) => {
  const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/images`);
  return response.data;
};

// POST /api/subjects/:subjectId/images
export const uploadImage = async (subjectId, formData) => {
  const response = await axios.post(`${API_BASE_URL}/subjects/${subjectId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// PUT /api/images/:imageId
export const updateImage = async (imageId, imageData) => {
    const response = await axios.put(`${API_BASE_URL}/images/${imageId}`, imageData);
    return response.data;
};

// DELETE /api/images/:imageId
export const deleteImage = async (imageId) => {
    const response = await axios.delete(`${API_BASE_URL}/images/${imageId}`);
    return response.data;
};

// PUT /api/images/:imageId/notes
export const updateImageNotes = async (imageId, notes) => {
  const response = await axios.put(`${API_BASE_URL}/images/${imageId}/notes`, { notes });
  return response.data;
};