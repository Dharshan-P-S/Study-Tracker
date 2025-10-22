import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';
import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary at the top
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Update a topic
// @route   PUT /api/topics/:topicId
export const updateTopic = async (req, res) => {
  try {
    // 👇 Destructure 'dueDate'
    const { title, text, status, revisionDate, removeImage, notes, dueDate } = req.body; 
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Handle file deletion (No changes needed here)
    if (removeImage === 'true' && topic.imageUrl) {
      const publicId = topic.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`study-app-topics/${publicId}`);
      topic.imageUrl = undefined;
    } 
    // Handle NEW file upload (No changes needed here)
    else if (req.file) {
      if (topic.imageUrl) {
        const publicId = topic.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`study-app-topics/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'study-app-topics', resource_type: 'image' });
      topic.imageUrl = result.secure_url;
    }
    
    // Update other fields (No changes needed here)
    topic.title = title || topic.title;
    topic.text = text !== undefined ? text : topic.text; // Retaining your simplification for 'text'
    topic.status = status || topic.status;
    topic.revisionDate = revisionDate || topic.revisionDate;

    // 👇 Add logic to update or remove dueDate
    topic.dueDate = dueDate ? dueDate : undefined;

    // Note update logic (No changes needed here)
    if (notes) {
      try {
        topic.notes = JSON.parse(notes);
      } catch (parseError) {
          console.warn("Received notes but failed to parse:", parseError);
          // Decide if you want to return an error or ignore invalid notes
          // return res.status(400).json({ message: 'Invalid notes format.' });
      }
    }

    const updatedTopic = await topic.save();
    res.json(updatedTopic);

  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update only a topic's notes
// @route   PUT /api/topics/:topicId/notes
export const updateTopicNotes = async (req, res) => {
  try {
    let notesData = req.body.notes; 
    const imageFile = req.file; 
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    let parsedNotes = [];
    if (notesData) {
      try {
        parsedNotes = JSON.parse(notesData);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid notes format.' });
      }
    }

    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: 'study-app-topic-notes', 
      });
      parsedNotes.push({
        noteType: 'Image',
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    }

    topic.notes = parsedNotes;
    const updatedTopic = await topic.save();
    res.json(updatedTopic);

  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/subjects/:subjectId/topics
export const createTopicForSubject = async (req, res) => {
  try {
    const { title, dueDate } = req.body; // 👈 Destructure dueDate
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Topic title is required' });
    }

    // Prepare topic data object
    const topicData = {
      title,
      subjectId,
      userId: req.user._id,
    };
    // 👇 Add dueDate if it exists in the request body
    if (dueDate) {
        topicData.dueDate = dueDate;
    }

    const topic = new Topic(topicData);
    const createdTopic = await topic.save();
    res.status(201).json(createdTopic);
  } catch (error) {
    console.error("Error creating topic:", error); // Added error logging
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all topics for a subject
// @route   GET /api/subjects/:subjectId/topics
export const getTopicsForSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const topics = await Topic.find({ subjectId: subjectId, userId: req.user._id });
    res.status(200).json(topics);
  } catch (error) {
    console.error("Error getting topics for subject:", error); // Added error logging
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a single topic by ID
// @route   GET /api/topics/:topicId
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });
    if (topic) {
      res.json(topic);
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error) {
    console.error("Error getting topic by ID:", error); // Added error logging
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Delete a topic
// @route   DELETE /api/topics/:topicId
export const deleteTopic = async (req, res) => {
    try {
      const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

      if (topic) {
        // Optional: Add logic here to delete associated Cloudinary images if needed
        await topic.deleteOne();
        res.json({ message: 'Topic removed' });
      } else {
        res.status(404).json({ message: 'Topic not found' });
      }
    } catch (error) {
      console.error("Error deleting topic:", error); // Added error logging
      res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update only a topic's status
// @route   PATCH /api/topics/:topicId/status
export const updateTopicStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

    if (topic) {
      topic.status = status;
      await topic.save();
      res.json({ message: 'Status updated' });
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error) {
    console.error("Error updating topic status:", error); // Added error logging
    res.status(500).json({ message: 'Server Error' });
  }
};