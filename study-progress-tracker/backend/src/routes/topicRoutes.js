// backend/src/routes/topicRoutes.js
import express from 'express';
import { 
  getTopicById,
  updateTopic,
  deleteTopic
} from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// These routes are for a single topic, so they can be at the top level
// e.g., PUT /api/topics/some-topic-id
router.route('/:topicId')
  .get(protect, getTopicById)
  .put(protect, updateTopic)
  .delete(protect, deleteTopic);

export default router;