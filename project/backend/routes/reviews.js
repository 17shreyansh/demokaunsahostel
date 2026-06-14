const express = require('express');
const Review = require('../models/Review');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const router = express.Router();

// Get reviews for a hostel
router.get('/hostel/:hostelId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      hostel: req.params.hostelId,
      isApproved: true 
    })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
    
    res.json({ reviews, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    console.log('Authenticated User accessing my-reviews:', req.user);
    
    const reviews = await Review.find({ user: req.user.id })
      .populate('hostel', 'name images')
      .sort({ createdAt: -1 });
    
    res.json({ reviews, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a review
router.post('/', auth, async (req, res) => {
  try {
    const { hostelId, rating, comment } = req.body;
    
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can submit reviews' });
    }

    // Check if user already reviewed this hostel
    const existingReview = await Review.findOne({ 
      hostel: hostelId, 
      user: req.user.id 
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this hostel' });
    }

    const review = new Review({
      hostel: hostelId,
      user: req.user.id,
      rating,
      comment
    });

    await review.save();

    // Update hostel rating
    await updateHostelRating(hostelId);

    res.status(201).json({ 
      message: 'Review submitted successfully. It will be visible after approval.',
      review,
      success: true 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.isApproved = false; // Re-submit for approval
    
    await review.save();
    await updateHostelRating(review.hostel);

    res.json({ message: 'Review updated successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const hostelId = review.hostel;
    await review.deleteOne();
    await updateHostelRating(hostelId);

    res.json({ message: 'Review deleted successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Get all reviews
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Restored inline admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('hostel', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ reviews, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve/reject review
router.patch('/admin/:id/approve', auth, async (req, res) => {
  try {
    // Restored inline admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { isApproved } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = isApproved;
    await review.save();
    await updateHostelRating(review.hostel);

    res.json({ message: 'Review updated successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete review
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    // Restored inline admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const hostelId = review.hostel;
    await review.deleteOne();
    await updateHostelRating(hostelId);

    res.json({ message: 'Review deleted successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper function to update hostel rating
async function updateHostelRating(hostelId) {
  const reviews = await Review.find({ hostel: hostelId, isApproved: true });
  
  if (reviews.length === 0) {
    await Hostel.findByIdAndUpdate(hostelId, { rating: 0 });
    return;
  }

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  await Hostel.findByIdAndUpdate(hostelId, { rating: parseFloat(avgRating.toFixed(1)) });
}

module.exports = router;