// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

// Route imports
import userRoutes from './src/routes/userRoutes.js';
import subjectRoutes from './src/routes/subjectRoutes.js';
import topicRoutes from './src/routes/topicRoutes.js';
import studySessionRoutes from './src/routes/studySessionRoutes.js';

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes); // For updating/deleting a single topic
app.use('/api/sessions', studySessionRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));