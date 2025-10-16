import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  duration: { // Duration in seconds
    type: Number,
    required: true,
  },
  sessionDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;