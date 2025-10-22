import express from 'express';
import { 
  getTopicById, 
  updateTopic, 
  deleteTopic, 
  updateTopicStatus,
  updateTopicNotes 
} from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.patch('/:topicId/status', protect, updateTopicStatus);

router.put('/:topicId/notes', protect, upload.single('imageNote'), updateTopicNotes); 

router.route('/:topicId')
  .get(protect, getTopicById)
  .put(protect, updateTopic) 
  .delete(protect, deleteTopic);

export default router;