import express from 'express';
import { getStickyNotes, createStickyNote, deleteStickyNote } from '../controllers/stickyNoteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getStickyNotes)
  .post(protect, createStickyNote);

router.route('/:id')
  .delete(protect, deleteStickyNote);

export default router;