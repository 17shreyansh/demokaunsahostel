const express = require('express');
const PageContent = require('../models/PageContent');
const auth = require('../middleware/auth');
const router = express.Router();

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