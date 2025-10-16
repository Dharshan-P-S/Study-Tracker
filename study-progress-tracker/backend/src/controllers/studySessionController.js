// backend/src/controllers/studySessionController.js
import StudySession from '../models/StudySession.js';

// @desc    Log a new study session
// @route   POST /api/sessions
export const logStudySession = async (req, res) => {
  try {
    const { subjectId, duration } = req.body;
    if (!subjectId || !duration) {
      return res.status(400).json({ message: 'Subject ID and duration are required' });
    }

    const session = new StudySession({
      userId: req.user._id, // From our auth middleware
      subjectId,
      duration,
    });

    const createdSession = await session.save();
    res.status(201).json(createdSession);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all study sessions for the logged-in user
// @route   GET /api/sessions
export const getStudySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
                                      .populate('subjectId', 'name color'); // Also get subject name and color
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};