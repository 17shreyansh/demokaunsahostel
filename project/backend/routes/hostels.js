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
    
    // Text search with sanitization
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchQuery = {
        $or: [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { location: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.educational.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.office.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.transportation.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.shopping.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.healthcare.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.entertainment.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.restaurant.name': { $regex: sanitizedSearch, $options: 'i' } },
          { 'nearbyPlaces.banking.name': { $regex: sanitizedSearch, $options: 'i' } }
        ]
      };
    }
    
    // Nearby Place filter - search hostels that have this place in their nearby places
    if (nearbyPlace && nearbyPlace.trim() && nearbyPlace !== '') {
      const placeName = nearbyPlace.trim();
      nearbyQuery = {
        $or: [
          { 'nearbyPlaces.educational.name': placeName },
          { 'nearbyPlaces.office.name': placeName },
          { 'nearbyPlaces.transportation.name': placeName },
          { 'nearbyPlaces.shopping.name': placeName },
          { 'nearbyPlaces.healthcare.name': placeName },
          { 'nearbyPlaces.entertainment.name': placeName },
          { 'nearbyPlaces.restaurant.name': placeName },
          { 'nearbyPlaces.banking.name': placeName }
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
    
    // Location filter with sanitization
    if (location && location.trim() && location !== '') {
      const sanitizedLocation = location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.location = { $regex: sanitizedLocation, $options: 'i' };
    }
    
    // Price range — match on base price OR any sharingType price
    if (minPrice || maxPrice) {
      const priceConditions = [];
      const baseCondition = {};
      if (minPrice && minPrice !== '') baseCondition.$gte = parseInt(minPrice);
      if (maxPrice && maxPrice !== '') baseCondition.$lte = parseInt(maxPrice);
      priceConditions.push({ price: baseCondition });
      if (minPrice && maxPrice) {
        priceConditions.push({ 'sharingTypes': { $elemMatch: { price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } } } });
      } else if (minPrice) {
        priceConditions.push({ 'sharingTypes': { $elemMatch: { price: { $gte: parseInt(minPrice) } } } });
      } else {
        priceConditions.push({ 'sharingTypes': { $elemMatch: { price: { $lte: parseInt(maxPrice) } } } });
      }
      if (query.$and) {
        query.$and.push({ $or: priceConditions });
      } else if (query.$or) {
        query = { $and: [{ $or: query.$or }, { $or: priceConditions }] };
      } else {
        query.$or = [...(query.$or || []), ...priceConditions];
        // Use $and to avoid clobbering existing $or
        query = Object.keys(query).reduce((acc, k) => { if (k !== '$or') acc[k] = query[k]; return acc; }, {});
        query.$and = [...(query.$and || []), { $or: priceConditions }];
      }
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
      const placeName = nearbyPlace.trim();
      aggregationPipeline = [
        { $match: query },
        {
          $addFields: {
            distanceToPlace: {
              $min: {
                $map: {
                  input: {
                    $concatArrays: [
                      { $ifNull: ["$nearbyPlaces.educational", []] },
                      { $ifNull: ["$nearbyPlaces.office", []] },
                      { $ifNull: ["$nearbyPlaces.transportation", []] },
                      { $ifNull: ["$nearbyPlaces.shopping", []] },
                      { $ifNull: ["$nearbyPlaces.healthcare", []] },
                      { $ifNull: ["$nearbyPlaces.entertainment", []] },
                      { $ifNull: ["$nearbyPlaces.restaurant", []] },
                      { $ifNull: ["$nearbyPlaces.banking", []] }
                    ]
                  },
                  as: "place",
                  in: {
                    $cond: {
                      if: { $eq: ["$$place.name", placeName] },
                      then: {
                        $cond: {
                          if: { $and: [{ $ne: ["$$place.distance", null] }, { $ne: ["$$place.distance", ""] }] },
                          then: {
                            $toDouble: {
                              $arrayElemAt: [
                                { $split: ["$$place.distance", " "] },
                                0
                              ]
                            }
                          },
                          else: 999
                        }
                      },
                      else: 9999
                    }
                  }
                }
              }
            }
          }
        },
        { $match: { distanceToPlace: { $lt: 9999 } } },
        { $sort: { distanceToPlace: 1, featured: -1, rating: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            name: 1, slug: 1, description: 1, location: 1, price: 1, priceType: 1, sessionPrice: 1,
            sharingTypes: 1, images: 1, amenities: 1, availability: 1, rating: 1,
            featured: 1, gender: 1, type: 1, verified: 1
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
            .select('name slug description location price priceType sessionPrice images amenities availability rating featured gender type verified')
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
          .select('name slug description location price priceType sessionPrice sharingTypes images amenities availability rating featured gender type verified')
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
    
    const sanitizedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const hostels = await Hostel.find(
      { name: { $regex: sanitizedQuery, $options: 'i' } },
      { name: 1, location: 1, slug: 1 }
    ).limit(5);
    
    const locations = await Hostel.distinct('location', 
      { location: { $regex: sanitizedQuery, $options: 'i' } }
    );
    
    // Get nearby places from NearbyPlaces collection
    const NearbyPlaces = require('../models/NearbyPlaces');
    const nearbyPlaces = await NearbyPlaces.find(
      { name: { $regex: sanitizedQuery, $options: 'i' }, active: true },
      { name: 1, category: 1 }
    ).limit(5).lean();
    
    const suggestions = [
      ...hostels.map(h => ({ type: 'hostel', name: h.name, location: h.location, id: h._id, slug: h.slug })),
      ...locations.slice(0, 3).map(loc => ({ type: 'location', name: loc, id: loc })),
      ...nearbyPlaces.map(place => ({ type: 'place', name: place.name, category: place.category, id: place._id }))
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
    
    // Get nearby places from NearbyPlaces collection
    const NearbyPlaces = require('../models/NearbyPlaces');
    const nearbyPlacesData = await NearbyPlaces.find({ active: true }, 'name').lean();
    const nearbyPlaces = nearbyPlacesData.map(place => place.name).sort();
    
    res.json({
      locations: locations.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
      types: types.filter(Boolean).sort(),
      amenities: amenities.filter(Boolean).sort(),
      nearbyPlaces
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
    ['amenities', 'rules', 'info', 'roomTypes', 'sharingTypes', 'reviews', 'mapCoordinates'].forEach(field => {
      if (hostelData[field] && typeof hostelData[field] === 'string') {
        try {
          hostelData[field] = JSON.parse(hostelData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });
    
    // Auto-compute base price from sharingTypes minimum
    if (hostelData.sharingTypes && hostelData.sharingTypes.length > 0) {
      const minPrice = Math.min(...hostelData.sharingTypes.map(s => Number(s.price) || 0));
      if (minPrice > 0) hostelData.price = minPrice;
    }

    // Handle contact info
    hostelData.contactInfo = {
      phone: hostelData.phone || '',
      address: hostelData.address || '',
      contactPersonName: hostelData.contactPersonName || '',
      jobTitle: hostelData.jobTitle || '',
      profileImage: null
    };
    
    // Handle profile image
    const profileImageFile = req.files?.find(file => file.fieldname === 'profileImage');
    if (profileImageFile) {
      hostelData.contactInfo.profileImage = profileImageFile.filename;
    }
    
    // Handle nearby places
    if (hostelData.nearbyPlaces && typeof hostelData.nearbyPlaces === 'string') {
      try {
        const parsedNearbyPlaces = JSON.parse(hostelData.nearbyPlaces);
        const nearbyCategories = ['educational', 'office', 'transportation', 'shopping', 'healthcare', 'entertainment', 'restaurant', 'banking'];
        const normalizedNearbyPlaces = {};
        
        nearbyCategories.forEach(category => {
          normalizedNearbyPlaces[category] = Array.isArray(parsedNearbyPlaces[category]) 
            ? parsedNearbyPlaces[category].map(place => ({
                _id: place._id || place.id,
                name: place.name,
                type: place.type,
                distance: place.distance || null
              }))
            : [];
        });
        
        hostelData.nearbyPlaces = normalizedNearbyPlaces;
        console.log('Processed nearby places for creation:', normalizedNearbyPlaces);
      } catch (e) {
        console.error('Error parsing nearbyPlaces:', e);
        hostelData.nearbyPlaces = {
          educational: [], office: [], transportation: [], shopping: [],
          healthcare: [], entertainment: [], restaurant: [], banking: []
        };
      }
    }
    
    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter(file => file.fieldname === 'images');
      hostelData.images = imageFiles.map(file => file.filename);
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
    console.log('Updating hostel with ID:', req.params.id);
    console.log('Update data received:', Object.keys(req.body));
    
    const updateData = { ...req.body };
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'sharingTypes', 'reviews', 'mapCoordinates'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });

    // Auto-compute base price from sharingTypes minimum
    if (updateData.sharingTypes && updateData.sharingTypes.length > 0) {
      const minPrice = Math.min(...updateData.sharingTypes.map(s => Number(s.price) || 0));
      if (minPrice > 0) updateData.price = minPrice;
    }
    
    // Get existing hostel for contact info
    const existingHostel = await Hostel.findById(req.params.id);
    
    // Handle contact info
    updateData.contactInfo = {
      phone: updateData.phone || existingHostel?.contactInfo?.phone || '',
      address: updateData.address || existingHostel?.contactInfo?.address || '',
      contactPersonName: updateData.contactPersonName || existingHostel?.contactInfo?.contactPersonName || '',
      jobTitle: updateData.jobTitle || existingHostel?.contactInfo?.jobTitle || '',
      profileImage: existingHostel?.contactInfo?.profileImage || null
    };
    
    // Handle profile image
    const profileImageFile = req.files?.find(file => file.fieldname === 'profileImage');
    if (profileImageFile) {
      updateData.contactInfo.profileImage = profileImageFile.filename;
    } else if (updateData.existingProfileImage) {
      updateData.contactInfo.profileImage = updateData.existingProfileImage;
    }
    
    // Handle nearby places properly
    if (updateData.nearbyPlaces && typeof updateData.nearbyPlaces === 'string') {
      try {
        const parsedNearbyPlaces = JSON.parse(updateData.nearbyPlaces);
        const nearbyCategories = ['educational', 'office', 'transportation', 'shopping', 'healthcare', 'entertainment', 'restaurant', 'banking'];
        const normalizedNearbyPlaces = {};
        
        nearbyCategories.forEach(category => {
          normalizedNearbyPlaces[category] = Array.isArray(parsedNearbyPlaces[category]) 
            ? parsedNearbyPlaces[category].map(place => ({
                _id: place._id || place.id,
                name: place.name,
                type: place.type,
                distance: place.distance || null
              }))
            : [];
        });
        
        updateData.nearbyPlaces = normalizedNearbyPlaces;
        console.log('Processed nearby places for update:', normalizedNearbyPlaces);
      } catch (e) {
        console.error('Error parsing nearbyPlaces:', e);
        updateData.nearbyPlaces = {
          educational: [], office: [], transportation: [], shopping: [],
          healthcare: [], entertainment: [], restaurant: [], banking: []
        };
      }
    }
    
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
        const imageFiles = req.files ? req.files.filter(file => file.fieldname === 'images') : [];
        const newImages = imageFiles.map(file => file.filename);
        
        finalImages = [...keepExisting, ...newImages];
        delete updateData.finalImages;
      } catch (e) {
        // Fallback: keep all existing + add new
        finalImages = existingHostel?.images || [];
        if (req.files) {
          const imageFiles = req.files.filter(file => file.fieldname === 'images');
          finalImages = [...finalImages, ...imageFiles.map(file => file.filename)];
        }
      }
    } else {
      // No image changes, keep existing
      finalImages = existingHostel?.images || [];
      if (req.files) {
        const imageFiles = req.files.filter(file => file.fieldname === 'images');
        finalImages = [...finalImages, ...imageFiles.map(file => file.filename)];
      }
    }
    
    updateData.images = finalImages;
    
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Clear cache to force refresh
    cache.clear();
    console.log('Hostel updated successfully:', hostel.name);
    
    res.json({ hostel, success: true, message: 'Hostel updated successfully' });
  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(400).json({ 
      message: error.message,
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      .select('name slug description location price priceType sessionPrice sharingTypes images amenities availability rating featured verified')
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