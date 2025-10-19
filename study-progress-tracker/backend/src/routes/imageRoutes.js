import express from 'express';
import { updateImage, deleteImage, updateImageNotes } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:imageId/notes', protect, updateImageNotes);

router.route('/:imageId')
  .put(protect, updateImage)
  .delete(protect, deleteImage);

export default router;