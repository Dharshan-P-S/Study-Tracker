import express from 'express';
import { getTopicById, updateTopic, deleteTopic, updateTopicStatus } from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();
router.patch('/:topicId/status', protect, updateTopicStatus);

router.route('/:topicId')
  .get(protect, getTopicById)
  .put(protect, upload.single('image'), updateTopic)
  .delete(protect, deleteTopic);

export default router;