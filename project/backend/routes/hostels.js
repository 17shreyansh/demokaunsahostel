const express = require('express');
const multer = require('multer');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const router = express.Router();

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (params) => {
  return JSON.stringify(params);
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { 
      search, location, minPrice, maxPrice, gender, type,
      amenities, availability, sortBy, page = 1, limit = 12 
    } = req.query;
    
    // Check cache first
    const cacheKey = getCacheKey(req.query);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    let query = {};
    
    // Text search
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'nearbyPlaces.educational.name': { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Location filter
    if (location && location.trim() && location !== '') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && minPrice !== '') query.price.$gte = parseInt(minPrice);
      if (maxPrice && maxPrice !== '') query.price.$lte = parseInt(maxPrice);
    }
    
    // Gender filter
    if (gender && gender.trim() && gender !== '') {
      query.gender = gender.trim();
    }
    
    // Type filter
    if (type && type.trim() && type !== '') {
      query.type = type.trim();
    }
    
    // Amenities
    if (amenities && amenities.trim() && amenities !== '') {
      const amenityList = amenities.split(',').map(a => a.trim()).filter(a => a);
      if (amenityList.length > 0) {
        query.amenities = { $in: amenityList };
      }
    }
    
    // Availability
    if (availability && availability.trim() && availability !== '') {
      query.availability = availability.trim();
    }
    
    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price_low': sort = { price: 1 }; break;
      case 'price_high': sort = { price: -1 }; break;
      case 'rating': sort = { rating: -1 }; break;
      case 'newest': sort = { createdAt: -1 }; break;
      default: sort = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    // Use lean() for better performance and select only needed fields
    const [hostels, total] = await Promise.all([
      Hostel.find(query)
        .select('name slug description location price images amenities availability rating featured gender type')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Hostel.countDocuments(query)
    ]);
    
    const result = {
      hostels,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
    
    // Cache the result
    setCache(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search suggestions endpoint
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    
    const hostels = await Hostel.find(
      { name: { $regex: q, $options: 'i' } },
      { name: 1, location: 1, slug: 1 }
    ).limit(5);
    
    const locations = await Hostel.distinct('location', 
      { location: { $regex: q, $options: 'i' } }
    );
    
    const suggestions = [
      ...hostels.map(h => ({ type: 'hostel', name: h.name, location: h.location, id: h._id, slug: h.slug })),
      ...locations.slice(0, 3).map(loc => ({ type: 'location', name: loc, id: loc }))
    ];
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    const locations = await Hostel.distinct('location');
    const genders = await Hostel.distinct('gender');
    const types = await Hostel.distinct('type');
    const amenities = await Hostel.distinct('amenities');
    
    res.json({
      locations: locations.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
      types: types.filter(Boolean).sort(),
      amenities: amenities.filter(Boolean).sort()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    let hostel = await Hostel.findOne({ slug: req.params.slug });
    
    // If not found by slug, try to find by ID (fallback for old URLs)
    if (!hostel) {
      hostel = await Hostel.findById(req.params.slug);
    }
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const hostelData = { ...req.body };
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'reviews'].forEach(field => {
      if (hostelData[field] && typeof hostelData[field] === 'string') {
        try {
          hostelData[field] = JSON.parse(hostelData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });
    
    // Handle nearby places
    if (hostelData.nearbyEducational && typeof hostelData.nearbyEducational === 'string') {
      try {
        const educational = JSON.parse(hostelData.nearbyEducational);
        hostelData.nearbyPlaces = { ...hostelData.nearbyPlaces, educational };
        delete hostelData.nearbyEducational;
      } catch (e) {
        console.log('Error parsing nearbyEducational:', e);
      }
    }
    
    if (hostelData.nearbyOffices && typeof hostelData.nearbyOffices === 'string') {
      try {
        const offices = JSON.parse(hostelData.nearbyOffices);
        hostelData.nearbyPlaces = { ...hostelData.nearbyPlaces, offices };
        delete hostelData.nearbyOffices;
      } catch (e) {
        console.log('Error parsing nearbyOffices:', e);
      }
    }
    
    if (req.files) hostelData.images = req.files.map(file => file.filename);
    
    const hostel = new Hostel(hostelData);
    await hostel.save();
    res.status(201).json(hostel);
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'reviews'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });
    
    // Handle nearby places
    if (updateData.nearbyEducational && typeof updateData.nearbyEducational === 'string') {
      try {
        const educational = JSON.parse(updateData.nearbyEducational);
        updateData.nearbyPlaces = { ...updateData.nearbyPlaces, educational };
        delete updateData.nearbyEducational;
      } catch (e) {
        console.log('Error parsing nearbyEducational:', e);
      }
    }
    
    if (updateData.nearbyOffices && typeof updateData.nearbyOffices === 'string') {
      try {
        const offices = JSON.parse(updateData.nearbyOffices);
        updateData.nearbyPlaces = { ...updateData.nearbyPlaces, offices };
        delete updateData.nearbyOffices;
      } catch (e) {
        console.log('Error parsing nearbyOffices:', e);
      }
    }
    
    // Handle images - only update if new files are uploaded
    if (req.files?.length) {
      updateData.images = req.files.map(file => file.filename);
    }
    
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(hostel);
  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Hostel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hostel deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;