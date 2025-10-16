// backend/src/controllers/subjectController.js
import Subject from '../models/Subject.js';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // We get the user ID from the token via the middleware
    const userId = req.user._id; // 👈 This is the change

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const subject = new Subject({
      name,
      color,
      userId, // 👈 Use the real user ID
    });

    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all subjects for a user
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    // We only find subjects that belong to the logged-in user
    const subjects = await Subject.find({ userId: req.user._id }); // 👈 This is the change
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};