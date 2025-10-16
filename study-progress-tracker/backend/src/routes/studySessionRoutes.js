// backend/src/routes/studySessionRoutes.js
import express from 'express';
import { logStudySession, getStudySessions } from '../controllers/studySessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes are protected and require a logged-in user
router.route('/')
  .post(protect, logStudySession)
  .get(protect, getStudySessions);

export default router;