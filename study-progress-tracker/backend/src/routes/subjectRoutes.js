import express from 'express';
import { createSubject, getSubjects, getSubjectById, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { createTopicForSubject, getTopicsForSubject } from '../controllers/topicController.js';
import { uploadImage, getImagesForSubject } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

// 👇 CHANGE 1: Use memoryStorage for MongoDB Base64 storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// 👇 CHANGE 2: Use '/:id' to match the controller's req.params.id
router.route('/:id')
    .get(protect, getSubjectById)
    .put(protect, updateSubject)
    .delete(protect, deleteSubject);

// Routes for subjects themselves
router.route('/')
  .get(protect, getSubjects)
  .post(protect, createSubject);

// Routes for topics related to a specific subject
// (We keep :subjectId here because topicController expects it)
router.route('/:subjectId/topics')
  .get(protect, getTopicsForSubject)
  .post(protect, createTopicForSubject);

// Routes for images related to a specific subject
router.route('/:subjectId/images')
  .get(protect, getImagesForSubject)
  .post(protect, upload.single('image'), uploadImage);

export default router;