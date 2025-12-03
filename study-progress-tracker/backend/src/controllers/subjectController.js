import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Image from '../models/Image.js';
import StudySession from '../models/StudySession.js'; 
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
// @route   GET /api/subjects/:subjectId
export const getSubjectById = async (req, res) => {
  try {
    // Uses req.params.subjectId
    const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user._id });
    if (subject) {
      res.json(subject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a subject (Rename)
// @route   PUT /api/subjects/:subjectId
export const updateSubject = async (req, res) => {
  try {
    const { name } = req.body;
    // 👇 CHANGED: use subjectId to match route
    const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user._id });

    if (subject) {
      subject.name = name || subject.name;
      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a subject and ALL associated data
// @route   DELETE /api/subjects/:subjectId
export const deleteSubject = async (req, res) => {
  try {
    // 👇 CHANGED: use subjectId to match route
    const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user._id });

    if (subject) {
      // 1. CLEANUP IMAGES
      const images = await Image.find({ subjectId: subject._id });
      for (const img of images) {
        if (img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }
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