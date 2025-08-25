const express = require('express');
const multer = require('multer');
const path = require('path');
const PageContent = require('../models/PageContent');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get page content (public)
router.get('/:page', async (req, res) => {
  try {
    const pageContent = await PageContent.findOne({ page: req.params.page });
    if (!pageContent) {
      return res.status(404).json({ message: 'Page content not found' });
    }
    res.json(pageContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload images for page content
router.post('/:page/upload', auth, upload.array('images', 10), async (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size
    }));
    
    res.json({ 
      message: 'Images uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update page content (admin)
router.put('/:page', auth, async (req, res) => {
  try {
    const pageContent = await PageContent.findOneAndUpdate(
      { page: req.params.page },
      { content: req.body.content, seo: req.body.seo },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(pageContent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all pages (admin)
router.get('/', auth, async (req, res) => {
  try {
    const pages = await PageContent.find();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;