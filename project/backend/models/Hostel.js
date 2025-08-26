const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['month', 'session'],
    default: 'month'
  },
  sessionPrice: {
    type: Number
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  roomTypes: [{
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    available: {
      type: Number,
      default: 0
    }
  }],
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  availability: {
    type: String,
    enum: ['Available', 'Limited', 'Full'],
    default: 'Available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  info: [{
    title: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  rules: [{
    type: String
  }],
  type: {
    type: String,
    default: 'PG'
  },
  gender: {
    type: String,
    enum: ['Boys', 'Girls', 'Co-ed'],
    default: 'Co-ed'
  },
  securityDeposit: {
    type: Number
  },
  availableBeds: {
    type: Number,
    default: 0
  },
  nearbyPlaces: {
    educational: [{
      name: String,
      distance: String
    }],
    offices: [{
      name: String,
      distance: String
    }]
  },
  reviews: [{
    name: String,
    rating: Number,
    comment: String,
    date: String,
    avatar: String
  }],
  roomTypes: [{
    name: String,
    description: String
  }],
  capacity: {
    type: String,
    default: '50+ Students'
  },
  checkIn: {
    type: String,
    default: 'Flexible timing'
  },
  mapCoordinates: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    }
  },
  views: {
    type: Number,
    default: 0
  },
  viewHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    ip: String
  }]
}, {
  timestamps: true
});

hostelSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Hostel', hostelSchema);