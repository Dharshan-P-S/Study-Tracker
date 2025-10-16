import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    // ref: 'User', // We will uncomment this when the User model is created
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  color: { 
    type: String, 
    default: '#CCCCCC' 
  },
}, { 
  timestamps: true 
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;