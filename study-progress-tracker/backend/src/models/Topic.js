// backend/src/models/Topic.js
import mongoose from 'mongoose';

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
  // We can add fields for images later, e.g., imageUrl: String
}, { 
  timestamps: true 
});

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;