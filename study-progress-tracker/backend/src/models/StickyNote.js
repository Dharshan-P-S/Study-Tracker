import mongoose from 'mongoose';

const stickyNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const StickyNote = mongoose.model('StickyNote', stickyNoteSchema);
export default StickyNote;