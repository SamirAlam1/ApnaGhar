const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      enum: {
        values: [
          'Mumbai',
          'Delhi',
          'Bangalore',
          'Ahmedabad',
          'Vadodara',
          'Bihar',
          'Uttar Pradesh'
        ],
        message: '{VALUE} is not a supported city',
      },
    },

    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    listingType: {
      type: String,
      enum: {
        values: ['sale', 'rent'],
        message: 'Listing type must be sale or rent',
      },
      required: [true, 'Listing type is required'],
    },

    propertyType: {
      type: String,
      enum: {
        values: ['Flat', 'Villa', 'PG', 'Plot'],
        message: '{VALUE} is not a valid property type',
      },
      required: [true, 'Property type is required'],
    },

    bhk: {
      type: Number,
      min: 1,
      max: 10,
    },

    bathrooms: {
      type: Number,
      min: 1,
    },

    area: {
      type: Number,
      min: 0,
    },

    furnishing: {
      type: String,
      enum: {
        values: ['Furnished', 'Semi-Furnished', 'Unfurnished', null],
        message: '{VALUE} is not a valid furnishing status',
      },
    },

    reraApproved: {
      type: Boolean,
      default: false,
    },

    reraNumber: {
      type: String,
      trim: true,
    },

    amenities: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    aiScore: {
      type: Number,
      default: 0,
    },

    tags: [String],
  },
  { timestamps: true }
);

// Compound index for filtering
propertySchema.index({ city: 1, propertyType: 1, price: 1 });

// Full text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  locality: 'text',
});

module.exports = mongoose.model('Property', propertySchema);