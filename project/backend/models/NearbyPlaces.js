const mongoose = require('mongoose');

const nearbyPlacesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['office', 'educational', 'transportation', 'shopping', 'healthcare', 'entertainment', 'restaurant', 'banking'],
    required: true
  },
  type: {
    type: String,
    required: true
  },
  coordinates: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate lat,lng format
        const coords = v.split(',');
        if (coords.length !== 2) return false;
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
      },
      message: 'Coordinates must be in format "latitude,longitude"'
    }
  },
  mapCoordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to parse coordinates string into mapCoordinates
nearbyPlacesSchema.pre('save', function(next) {
  if (this.coordinates) {
    const coords = this.coordinates.split(',');
    this.mapCoordinates = {
      lat: parseFloat(coords[0].trim()),
      lng: parseFloat(coords[1].trim())
    };
  }
  next();
});

// Pre-update middleware for findOneAndUpdate
nearbyPlacesSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.coordinates) {
    const coords = update.coordinates.split(',');
    update.mapCoordinates = {
      lat: parseFloat(coords[0].trim()),
      lng: parseFloat(coords[1].trim())
    };
  }
  next();
});

module.exports = mongoose.model('NearbyPlaces', nearbyPlacesSchema);