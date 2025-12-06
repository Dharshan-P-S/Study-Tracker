import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Image from '../models/Image.js';
import StudySession from '../models/StudySession.js'; 
// Removed Cloudinary import

// Removed Cloudinary configuration

// @desc    Create a new subject
// @route   POST /api/subjects
export const createSubject = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const subject = new Subject({
      name,
      color,
      userId,
    });

    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all subjects for a user
// @route   GET /api/subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
export const getSubjectById = async (req, res) => {
  try {
    // Matches route /:id
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (subject) {
      res.json(subject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
export const updateSubject = async (req, res) => {
  try {
    const { name } = req.body;
    // Matches route /:id
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (subject) {
      subject.name = name || subject.name;
      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a subject and ALL associated data
// @route   DELETE /api/subjects/:id
export const deleteSubject = async (req, res) => {
  try {
    // Matches route /:id
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (subject) {
      // 1. CLEANUP IMAGES
      // Since images are stored in MongoDB as Base64, we just delete the documents.
      // No Cloudinary calls needed here.
      await Image.deleteMany({ subjectId: subject._id });

      // 2. CLEANUP TOPICS
      await Topic.deleteMany({ subjectId: subject._id });

      // 3. CLEANUP STUDY SESSIONS
      await StudySession.deleteMany({ subjectId: subject._id });

      // 4. DELETE THE SUBJECT
      await subject.deleteOne();
      
      res.json({ message: 'Subject and all associated data removed' });
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};