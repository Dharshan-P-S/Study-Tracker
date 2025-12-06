import Image from '../models/Image.js';
import Subject from '../models/Subject.js';

// Helper to convert buffer to base64 data URI
const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString('base64');
  return `data:${mimetype};base64,${b64}`;
};

// @desc    Upload a new image for a subject
// @route   POST /api/subjects/:subjectId/images
export const uploadImage = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { description, dueDate } = req.body; 

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // 👇 CHANGED: Convert file buffer to Base64 string
    const base64Image = bufferToDataURI(req.file.buffer, req.file.mimetype);

    const imageData = {
      userId: req.user._id,
      subjectId,
      description,
      imageUrl: base64Image, // Store Base64 string directly
      // publicId removed
      status: 'To Study',
    };
    
    if (dueDate) {
        imageData.dueDate = dueDate;
    }

    const newImage = new Image(imageData);
    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
};

// @desc    Get all images for a subject
// @route   GET /api/subjects/:subjectId/images
export const getImagesForSubject = async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user._id, subjectId: req.params.subjectId });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an image (description, status, annotations, dueDate)
// @route   PUT /api/images/:imageId
export const updateImage = async (req, res) => {
  try {
    const { description, status, annotations, dueDate } = req.body; 
    const image = await Image.findOne({ _id: req.params.imageId, userId: req.user._id });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    image.description = description !== undefined ? description : image.description;
    image.status = status || image.status;
    
    if (annotations) {
      image.annotations = annotations;
    }

    // Update or remove dueDate
    image.dueDate = (dueDate === null || dueDate === '') ? undefined : dueDate; 

    const updatedImage = await image.save();
    res.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:imageId
export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.imageId, userId: req.user._id });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // 👇 CHANGED: Removed Cloudinary delete call
    
    // Delete from database
    await image.deleteOne();

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update only an image's notes
// @route   PUT /api/images/:imageId/notes
export const updateImageNotes = async (req, res) => {
  try {
    const { notes } = req.body; // Expects an array of notes
    const image = await Image.findOne({ _id: req.params.imageId, userId: req.user._id });

    if (image) {
      image.notes = notes;
      const updatedImage = await image.save();
      res.json(updatedImage);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error("Error updating image notes:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};