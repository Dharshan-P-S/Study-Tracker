// backend/src/routes/subjectRoutes.js
import express from 'express';
import { createSubject, getSubjects } from '../controllers/subjectController.js';
import { createTopicForSubject, getTopicsForSubject } from '../controllers/topicController.js';
import { uploadImage, getImagesForSubject } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Routes for subjects themselves
// GET /api/subjects and POST /api/subjects
router.route('/')
  .get(protect, getSubjects)
  .post(protect, createSubject);

// Routes for topics related to a specific subject
// GET /api/subjects/:subjectId/topics and POST /api/subjects/:subjectId/topics
router.route('/:subjectId/topics')
  .get(protect, getTopicsForSubject)
  .post(protect, createTopicForSubject);

router.route('/:subjectId/images')
  .get(protect, getImagesForSubject)
  .post(protect, upload.single('image'), uploadImage);

export default router;