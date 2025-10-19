// backend/src/models/Topic.js
import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  noteType: {
    type: String,
    required: true,
    enum: ['YouTube', 'Local File'],
  },
});

const topicSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  text: { 
    type: String, 
    default: '' 
  },
  imageUrl: { 
    type: String 
  },
  status: {
    type: String,
    enum: ['To Study', 'Partially Studied', 'Fully Studied', 'To Be Revised'],
    default: 'To Study',
  },
  revisionDate: {
    type: Date,
  },
  notes: [noteSchema],
}, { 
  timestamps: true 
});

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;