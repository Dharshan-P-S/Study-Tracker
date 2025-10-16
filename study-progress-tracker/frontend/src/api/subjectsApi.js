// frontend/src/api/subjectsApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// --- Subject Functions ---
export const getSubjects = async () => {
    const response = await axios.get(`${API_BASE_URL}/subjects`);
    return response.data;
};

export const createSubject = async (subjectData) => {
    const response = await axios.post(`${API_BASE_URL}/subjects`, subjectData);
    return response.data;
};

// --- Chapter Functions ---
export const getChaptersForSubject = async (subjectId) => {
    const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/chapters`);
    return response.data;
};

export const createChapter = async (subjectId, chapterData) => {
    const response = await axios.post(`${API_BASE_URL}/subjects/${subjectId}/chapters`, chapterData);
    return response.data;
};

// --- Topic Functions (New) ---
export const getTopicsForChapter = async (subjectId, chapterId) => {
    const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/chapters/${chapterId}/topics`);
    return response.data;
};

export const createTopic = async (subjectId, chapterId, topicData) => {
    const response = await axios.post(`${API_BASE_URL}/subjects/${subjectId}/chapters/${chapterId}/topics`, topicData);
    return response.data;
};

export const getTopicById = async (subjectId, chapterId, topicId) => {
    const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`);
    return response.data;
};

export const updateTopic = async (subjectId, chapterId, topicId, topicData) => {
    const response = await axios.put(`${API_BASE_URL}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`, topicData);
    return response.data;
};