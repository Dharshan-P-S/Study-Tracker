import Image from '../models/Image.js';
import Subject from '../models/Subject.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (make sure credentials are in your .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload a new image for a subject
// @route   POST /api/subjects/:subjectId/images
export const uploadImage = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { description, dueDate } = req.body; 

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'study-app-images',
    });

    const imageData = {
      userId: req.user._id,
      subjectId,
      description,
      imageUrl: result.secure_url,
      publicId: result.public_id,
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

// @desc    Update an image (description or status)
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

    image.dueDate = (dueDate === null || dueDate === '') ? undefined : dueDate; 

    const updatedImage = await image.save();
    res.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error); // Added logging
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

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
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