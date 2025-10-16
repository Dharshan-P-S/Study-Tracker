// frontend/src/api/topicApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// GET /api/subjects/:subjectId/topics
export const getTopicsForSubject = async (subjectId) => {
  const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/topics`);
  return response.data;
};

// POST /api/subjects/:subjectId/topics
export const createTopicForSubject = async (subjectId, topicData) => {
  const response = await axios.post(`${API_BASE_URL}/subjects/${subjectId}/topics`, topicData);
  return response.data;
};

// PUT /api/topics/:topicId
export const updateTopic = async (topicId, topicData) => {
  const response = await axios.put(`${API_BASE_URL}/topics/${topicId}`, topicData);
  return response.data;
};

// GET /api/topics/:topicId
export const getTopicById = async (topicId) => {
  const response = await axios.get(`${API_BASE_URL}/topics/${topicId}`);
  return response.data;
};