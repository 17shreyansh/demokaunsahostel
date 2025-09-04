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
const upload = multer({ 
  storage,
  limits: {
    fileSize: Infinity, // Remove file size limit
    fieldSize: Infinity, // Remove field size limit
    files: Infinity // Remove file count limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all fields
    cb(null, true);
  }
});

router.get('/', async (req, res) => {
  try {
    const { 
      search, location, minPrice, maxPrice, gender, type,
      amenities, availability, sortBy, nearbyPlace, page = 1, limit = 12 
    } = req.query;
    
    // Check cache first
    const cacheKey = getCacheKey(req.query);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    let query = {};
    let searchQuery = null;
    let nearbyQuery = null;
    
    // Text search
    if (search && search.trim()) {
      searchQuery = {
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { location: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { 'nearbyPlaces.educational.name': { $regex: search.trim(), $options: 'i' } }
        ]
      };
    }
    
    // Nearby Place filter
    if (nearbyPlace && nearbyPlace.trim() && nearbyPlace !== '') {
      nearbyQuery = {
        $or: [
          { 'nearbyPlaces.educational': { $elemMatch: { name: nearbyPlace.trim() } } },
          { 'nearbyPlaces.offices': { $elemMatch: { name: nearbyPlace.trim() } } }
        ]
      };
    }
    
    // Combine search and nearby queries
    if (searchQuery && nearbyQuery) {
      query.$and = [searchQuery, nearbyQuery];
    } else if (searchQuery) {
      query = { ...query, ...searchQuery };
    } else if (nearbyQuery) {
      query = { ...query, ...nearbyQuery };
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
        query.amenities = { $all: amenityList };
      }
    }
    
    // Availability
    if (availability && availability.trim() && availability !== '') {
      query.availability = availability.trim();
    }
    
    const skip = (page - 1) * limit;
    
    // Sorting
    let sort = {};
    let useAggregation = false;
    let aggregationPipeline = [];
    
    if (nearbyPlace && nearbyPlace.trim()) {
      // Sort by distance to specific nearby place using aggregation
      useAggregation = true;
      aggregationPipeline = [
        { $match: query },
        {
          $addFields: {
            distanceToPlace: {
              $let: {
                vars: {
                  allPlaces: {
                    $concatArrays: [
                      { $ifNull: ["$nearbyPlaces.educational", []] },
                      { $ifNull: ["$nearbyPlaces.offices", []] }
                    ]
                  }
                },
                in: {
                  $min: {
                    $map: {
                      input: "$$allPlaces",
                      as: "place",
                      in: {
                        $cond: {
                          if: { $eq: ["$$place.name", nearbyPlace.trim()] },
                          then: {
                            $let: {
                              vars: {
                                distanceStr: { $ifNull: ["$$place.distance", "999 km"] },
                                distanceParts: { $split: [{ $ifNull: ["$$place.distance", "999 km"] }, " "] }
                              },
                              in: {
                                $toDouble: { $arrayElemAt: ["$$distanceParts", 0] }
                              }
                            }
                          },
                          else: 999999
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        { $match: { distanceToPlace: { $lt: 999999 } } },
        { $sort: { distanceToPlace: 1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            name: 1, slug: 1, description: 1, location: 1, price: 1, priceType: 1, sessionPrice: 1,
            images: 1, amenities: 1, availability: 1, rating: 1,
            featured: 1, gender: 1, type: 1
          }
        }
      ];
    } else {
      switch (sortBy) {
        case 'price_low': sort = { price: 1 }; break;
        case 'price_high': sort = { price: -1 }; break;
        case 'rating': sort = { rating: -1 }; break;
        case 'newest': sort = { createdAt: -1 }; break;
        default: sort = { createdAt: -1 };
      }
    }
    
    // Execute query
    let hostels, total;
    
    if (useAggregation && aggregationPipeline.length > 0) {
      try {
        [hostels, total] = await Promise.all([
          Hostel.aggregate(aggregationPipeline),
          Hostel.countDocuments(query)
        ]);
      } catch (aggError) {
        console.error('Aggregation error:', aggError);
        // Fallback to regular query
        [hostels, total] = await Promise.all([
          Hostel.find(query)
            .select('name slug description location price priceType sessionPrice images amenities availability rating featured gender type')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          Hostel.countDocuments(query)
        ]);
      }
    } else {
      [hostels, total] = await Promise.all([
        Hostel.find(query)
          .select('name slug description location price priceType sessionPrice images amenities availability rating featured gender type')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Hostel.countDocuments(query)
      ]);
    }
    
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
    console.error('Route error:', error);
    res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
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
    
    // Get all nearby places from hostels
    const hostels = await Hostel.find({}, 'nearbyPlaces').lean();
    const nearbyPlaces = new Set();
    
    hostels.forEach(hostel => {
      if (hostel.nearbyPlaces?.educational) {
        hostel.nearbyPlaces.educational.forEach(place => {
          if (place.name) nearbyPlaces.add(place.name);
        });
      }
      if (hostel.nearbyPlaces?.offices) {
        hostel.nearbyPlaces.offices.forEach(place => {
          if (place.name) nearbyPlaces.add(place.name);
        });
      }
    });
    
    res.json({
      locations: locations.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
      types: types.filter(Boolean).sort(),
      amenities: amenities.filter(Boolean).sort(),
      nearbyPlaces: Array.from(nearbyPlaces).sort()
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
    
    // Track view with IP to prevent duplicate counting
    const clientIP = req.ip || req.connection.remoteAddress;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if this IP already viewed today
    const alreadyViewed = hostel.viewHistory.some(view => 
      view.ip === clientIP && view.date >= today
    );
    
    if (!alreadyViewed) {
      hostel.views = (hostel.views || 0) + 1;
      hostel.viewHistory.push({ date: new Date(), ip: clientIP });
      
      // Keep only last 30 days of view history
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      hostel.viewHistory = hostel.viewHistory.filter(view => view.date >= thirtyDaysAgo);
      
      await hostel.save();
    }
    
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, upload.any(), async (req, res) => {
  try {
    const hostelData = { ...req.body };
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'reviews', 'mapCoordinates'].forEach(field => {
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
    
    if (req.files && req.files.length > 0) {
      hostelData.images = req.files.map(file => file.filename);
    }
    
    const hostel = new Hostel(hostelData);
    await hostel.save();
    
    // Clear cache to force refresh
    cache.clear();
    
    res.status(201).json({ hostel, success: true, message: 'Hostel created successfully' });
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update featured status
router.patch('/:id/featured', auth, async (req, res) => {
  try {
    const { featured } = req.body;
    
    if (featured) {
      // Check if we already have 6 featured hostels
      const featuredCount = await Hostel.countDocuments({ featured: true });
      if (featuredCount >= 6) {
        return res.status(400).json({ message: 'Maximum 6 hostels can be featured' });
      }
    }
    
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id, 
      { featured }, 
      { new: true }
    );
    
    // Clear cache to force refresh
    cache.clear();
    
    res.json({ hostel, success: true, message: `Hostel ${featured ? 'featured' : 'unfeatured'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, upload.any(), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'reviews', 'mapCoordinates'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });
    
    // Handle nearby places properly
    const nearbyPlaces = {};
    
    if (updateData.nearbyEducational && typeof updateData.nearbyEducational === 'string') {
      try {
        nearbyPlaces.educational = JSON.parse(updateData.nearbyEducational);
        delete updateData.nearbyEducational;
      } catch (e) {
        console.log('Error parsing nearbyEducational:', e);
        nearbyPlaces.educational = [];
      }
    } else {
      nearbyPlaces.educational = [];
    }
    
    if (updateData.nearbyOffices && typeof updateData.nearbyOffices === 'string') {
      try {
        nearbyPlaces.offices = JSON.parse(updateData.nearbyOffices);
        delete updateData.nearbyOffices;
      } catch (e) {
        console.log('Error parsing nearbyOffices:', e);
        nearbyPlaces.offices = [];
      }
    } else {
      nearbyPlaces.offices = [];
    }
    
    updateData.nearbyPlaces = nearbyPlaces;
    
    // Smart image handling
    let finalImages = [];
    
    if (updateData.finalImages) {
      try {
        const imageList = JSON.parse(updateData.finalImages);
        const existingHostel = await Hostel.findById(req.params.id);
        const currentImages = existingHostel?.images || [];
        
        // Keep existing images that are still in the list
        const keepExisting = imageList.filter(img => currentImages.includes(img));
        
        // Add new uploaded images
        const newImages = req.files ? req.files.map(file => file.filename) : [];
        
        finalImages = [...keepExisting, ...newImages];
        delete updateData.finalImages;
      } catch (e) {
        // Fallback: keep all existing + add new
        const existingHostel = await Hostel.findById(req.params.id);
        finalImages = existingHostel?.images || [];
        if (req.files) {
          finalImages = [...finalImages, ...req.files.map(file => file.filename)];
        }
      }
    } else {
      // No image changes, keep existing
      const existingHostel = await Hostel.findById(req.params.id);
      finalImages = existingHostel?.images || [];
      if (req.files) {
        finalImages = [...finalImages, ...req.files.map(file => file.filename)];
      }
    }
    
    updateData.images = finalImages;
    
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    // Clear cache to force refresh
    cache.clear();
    
    res.json({ hostel, success: true, message: 'Hostel updated successfully' });
  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get featured hostels for homepage
router.get('/featured/homepage', async (req, res) => {
  try {
    const cacheKey = 'featured-homepage';
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const featuredHostels = await Hostel.find({ featured: true })
      .select('name slug description location price priceType sessionPrice images amenities availability rating featured')
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean();
    
    setCache(cacheKey, featuredHostels);
    res.json(featuredHostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Hostel.findByIdAndDelete(req.params.id);
    
    // Clear cache to force refresh
    cache.clear();
    
    res.json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;