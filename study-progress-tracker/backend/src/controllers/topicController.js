// backend/src/controllers/topicController.js
import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';

// @desc    Create a topic for a subject
// @route   POST /api/subjects/:subjectId/topics
export const createTopicForSubject = async (req, res) => {
  try {
    const { title } = req.body;
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Topic title is required' });
    }

    const topic = new Topic({
      title,
      subjectId,
      userId: req.user._id, // From auth middleware
    });

    const createdTopic = await topic.save();
    res.status(201).json(createdTopic);
  } catch (error) {
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a topic (e.g., change its status or content)
// @route   PUT /api/topics/:topicId
export const updateTopic = async (req, res) => {
  try {
    const { title, text, status, revisionDate } = req.body;
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

    if (topic) {
      topic.title = title || topic.title;
      topic.text = text !== undefined ? text : topic.text;
      topic.status = status || topic.status;
      topic.revisionDate = revisionDate || topic.revisionDate;

      const updatedTopic = await topic.save();
      res.json(updatedTopic);
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:topicId
export const deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

        if (topic) {
            await topic.deleteOne();
            res.json({ message: 'Topic removed' });
        } else {
            res.status(404).json({ message: 'Topic not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};