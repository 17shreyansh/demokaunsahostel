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
  videoTourUrl: {
    type: String
  },
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
  sharingTypes: [{
    name: {
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
    available: {
      type: Number,
      default: 0
    }
  }],
  contactInfo: {
    phone: String,
    email: String,
    address: String,
    contactPersonName: String,
    profileImage: String,
    jobTitle: String
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
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelManager',
    default: null
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
    enum: ['Hostel', 'PG', 'Co-living'],
    default: 'PG'
  },
  gender: {
    type: String,
    enum: ['Boys', 'Girls', 'Co-ed'],
    default: 'Co-ed'
  },
  foodType: {
    type: String,
    enum: ['Veg Only', 'Non-Veg', 'Both'],
    default: 'Both'
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
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    office: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    transportation: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    shopping: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    healthcare: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    entertainment: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    restaurant: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
    }],
    banking: [{
      _id: { type: String },
      name: { type: String },
      type: { type: String },
      distance: { type: String }
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
    description: String,
    price: Number,
    available: Number
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
  }],
  installmentPlans: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    installments: [{
      value: {
        type: Number,
        required: true
      },
      dueDate: String
    }]
  }],
  reservationEnabled: {
    type: Boolean,
    default: false
  },
  reservationAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

hostelSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Create geospatial index for location-based queries
// hostelSchema.index({ 
//   'mapCoordinates': '2dsphere' 
// });

module.exports = mongoose.model('Hostel', hostelSchema);