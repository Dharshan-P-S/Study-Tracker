import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';

// Helper to convert buffer to base64 data URI
const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString('base64');
  return `data:${mimetype};base64,${b64}`;
};

// @desc    Update a topic
// @route   PUT /api/topics/:topicId
export const updateTopic = async (req, res) => {
  try {
    const { title, text, status, revisionDate, removeImage, notes, dueDate } = req.body;
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Handle file deletion (Base64 version: just set to undefined)
    if (removeImage === 'true') {
      topic.imageUrl = undefined;
    } 
    // Handle NEW file upload (Base64 version)
    else if (req.file) {
      topic.imageUrl = bufferToDataURI(req.file.buffer, req.file.mimetype);
    }
    
    // Update other fields
    topic.title = title || topic.title;
    topic.text = text !== undefined ? text : topic.text; 
    topic.status = status || topic.status;
    topic.revisionDate = revisionDate || topic.revisionDate;

    // Update or remove dueDate
    topic.dueDate = (dueDate === '' || dueDate === null) ? undefined : dueDate;

    // Note update logic
    if (notes) {
      try {
        topic.notes = JSON.parse(notes);
      } catch (parseError) {
          console.warn("Received notes but failed to parse:", parseError);
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

    // Handle Note Image Upload (Base64 version)
    if (imageFile) {
      const base64Image = bufferToDataURI(imageFile.buffer, imageFile.mimetype);
      
      parsedNotes.push({
        noteType: 'Image',
        imageUrl: base64Image,
        // publicId removed
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
    const { title, dueDate, parentTopicId, isRepeated } = req.body;
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Topic title is required' });
    }

    const topicData = {
      title,
      subjectId,
      userId: req.user._id,
    };
    if (dueDate) {
        topicData.dueDate = dueDate;
    }

    // Respect parentTopicId & isRepeated if provided (for rescheduling)
    if (parentTopicId) {
      topicData.parentTopicId = parentTopicId;
      topicData.isRepeated = (isRepeated === true || isRepeated === 'true');
    } else if (isRepeated) {
      // Fallback if parent ID isn't sent but flag is
      topicData.isRepeated = (isRepeated === true || isRepeated === 'true');
    }


    const topic = new Topic(topicData);
    const createdTopic = await topic.save();
    res.status(201).json(createdTopic);
  } catch (error) {
    console.error("Error creating topic:", error);
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
    console.error("Error getting topics for subject:", error);
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
    console.error("Error getting topic by ID:", error);
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
        console.error("Error deleting topic:", error);
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
    console.error("Error updating topic status:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get ALL topics for the logged-in user (for the Global Calendar)
// @route   GET /api/topics
export const getAllTopics = async (req, res) => {
  try {
    // Find all topics belonging to this user, select only necessary fields
    const topics = await Topic.find({ userId: req.user._id })
                          .select('title dueDate status subjectId')
                          .populate('subjectId', 'name color'); // Get subject details for color coding
    res.status(200).json(topics);
  } catch (error) {
    console.error("Error getting all topics:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};