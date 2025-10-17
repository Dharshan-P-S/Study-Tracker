import express from 'express';
import { updateImage, deleteImage } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:imageId')
  .put(protect, updateImage)
  .delete(protect, deleteImage);

export default router;