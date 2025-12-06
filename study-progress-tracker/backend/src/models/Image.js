import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  noteType: {
    type: String,
    required: true,
    enum: ['Text', 'Image', 'Link'],
  },
  // Fields for Text notes
  content: {
    type: String,
    required: function() { return this.noteType === 'Text'; }
  },
  // Fields for Image notes
  imageUrl: {
    type: String, // Stores Base64 string
    required: function() { return this.noteType === 'Image'; }
  },
  // Fields for Link notes
  title: {
    type: String,
    trim: true,
    required: function() { return this.noteType === 'Link'; }
  },
  url: {
    type: String,
    required: function() { return this.noteType === 'Link'; }
  },
  linkType: { 
      type: String,
      enum: ['YouTube', 'Local File'],
      required: function() { return this.noteType === 'Link'; }
  }
});

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
  // publicId removed (using direct MongoDB storage)
  description: { 
    type: String, 
    default: '' 
  },
  status: {
    type: String,
    enum: ['To Study', 'Partially Studied', 'Fully Studied', 'To Be Revised'],
    default: 'To Study',
  },
  annotations: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    fill: String,
    id: String,
  }],
  notes: [noteSchema], // Updated to use the rich note structure
  dueDate: {
    type: Date,
    required: false,
  },
}, { 
  timestamps: true 
});

const Image = mongoose.model('Image', imageSchema);
export default Image;