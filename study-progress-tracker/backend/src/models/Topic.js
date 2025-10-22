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
    type: String,
    required: function() { return this.noteType === 'Image'; }
  },
  publicId: { // For Cloudinary deletion
    type: String,
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

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['To Study', 'Partially Studied', 'Fully Studied', 'To Be Revised'],
    default: 'To Study',
  },
  revisionDate: { type: Date },
  dueDate: {
    type: Date,
    required: false, 
  },
  notes: [noteSchema], 
}, { 
  timestamps: true 
});

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;