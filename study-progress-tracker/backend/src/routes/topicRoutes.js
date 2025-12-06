import express from 'express';
import { 
  getTopicById, 
  updateTopic, 
  deleteTopic, 
  updateTopicStatus,
  updateTopicNotes,
  getAllTopics
} from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

// 👇 CHANGED: Use memoryStorage for MongoDB Base64 storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Get all topics (for calendar)
router.get('/', protect, getAllTopics);

// Update status (drag and drop)
router.patch('/:topicId/status', protect, updateTopicStatus);

// Update notes (can include image upload)
router.put('/:topicId/notes', protect, upload.single('imageNote'), updateTopicNotes); 

// General CRUD
router.route('/:topicId')
  .get(protect, getTopicById)
  .put(protect, updateTopic) 
  .delete(protect, deleteTopic);

export default router;