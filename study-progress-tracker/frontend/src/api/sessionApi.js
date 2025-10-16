import axios from 'axios';

const API_URL = 'http://localhost:5001/api/sessions';

export const logStudySession = async (sessionData) => {
  const response = await axios.post(API_URL, sessionData);
  return response.data;
};
export const getStudySessions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};