import StickyNote from '../models/StickyNote.js';

export const getStickyNotes = async (req, res) => {
  try {
    const notes = await StickyNote.find({ userId: req.user._id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createStickyNote = async (req, res) => {
  try {
    const { date, content } = req.body;
    const note = new StickyNote({
      userId: req.user._id,
      date,
      content
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteStickyNote = async (req, res) => {
  try {
    const note = await StickyNote.findOne({ _id: req.params.id, userId: req.user._id });
    if (note) {
      await note.deleteOne();
      res.json({ message: 'Note removed' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};