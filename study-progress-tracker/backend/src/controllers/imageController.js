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
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'study-app-images',
    });

    const newImage = new Image({
      userId: req.user._id,
      subjectId,
      description,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      status: 'To Study',
    });

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
    // We can now receive 'annotations' in the request body
    const { description, status, annotations } = req.body;
    const image = await Image.findOne({ _id: req.params.imageId, userId: req.user._id });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    image.description = description || image.description;
    image.status = status || image.status;
    
    // If annotation data is sent, update it
    if (annotations) {
      image.annotations = annotations;
    }

    const updatedImage = await image.save();
    res.json(updatedImage);
  } catch (error) {
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