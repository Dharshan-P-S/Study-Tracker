import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
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
  imageUrl: { 
    type: String, 
    required: true 
  },
  publicId: {
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  status: {
    type: String,
    enum: ['To Study', 'Partially Studied', 'Fully Studied', 'To Be Revised'],
    default: 'To Study',
  },
  // This is the corrected way to define the array of sub-documents
  annotations: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    fill: String,
    id: String,
  }],
}, { 
  timestamps: true 
});

const Image = mongoose.model('Image', imageSchema);
export default Image;