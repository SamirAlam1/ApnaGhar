const Property = require('../models/Property');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/properties
exports.getAll = async (req, res) => {
  try {
    const {
      city,
      type,
      bhk,
      furnishing,
      rera,
      q,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (city) filter.city = city;
    if (type) filter.propertyType = type;
    if (bhk) filter.bhk = Number(bhk);
    if (furnishing) filter.furnishing = furnishing;
    if (rera === 'true') filter.reraApproved = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortQuery = sortMap[sort] || { isFeatured: -1, createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('seller', 'name phone email')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Property.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Properties fetched', {
      properties,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch properties');
  }
};

// GET /api/properties/featured
exports.getFeatured = async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, isActive: true })
      .populate('seller', 'name phone')
      .limit(6)
      .lean();
    return sendSuccess(res, 200, 'Featured properties fetched', { properties });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch featured properties');
  }
};

// GET /api/properties/mine  (seller only)
exports.getMine = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, 200, 'Your listings fetched', { properties });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch your listings');
  }
};

// GET /api/properties/:id
exports.getById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'seller',
      'name phone email'
    );
    if (!property) return sendError(res, 404, 'Property not found');

    property.views += 1;
    await property.save();

    return sendSuccess(res, 200, 'Property fetched', { property });
  } catch (err) {
    // Handle invalid ObjectId
    if (err.name === 'CastError') {
      return sendError(res, 404, 'Property not found');
    }
    return sendError(res, 500, 'Failed to fetch property');
  }
};

// POST /api/properties  (seller only)
exports.create = async (req, res) => {
  try {
    let amenities = [];
    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
      } catch {
        amenities = Array.isArray(req.body.amenities)
          ? req.body.amenities
          : [req.body.amenities];
      }
    }

    const images = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const property = await Property.create({
      ...req.body,
      amenities,
      images,
      reraApproved:
        req.body.reraApproved === 'true' || req.body.reraApproved === true,
      bhk: req.body.bhk ? Number(req.body.bhk) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      area: req.body.area ? Number(req.body.area) : undefined,
      price: Number(req.body.price),
      seller: req.user._id,
    });

    return sendSuccess(res, 201, 'Property listed successfully', { property });
  } catch (err) {
    return sendError(res, 400, err.message || 'Failed to create property');
  }
};

// PUT /api/properties/:id  (seller only, own listing)
exports.update = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!property) return sendError(res, 404, 'Property not found or you are not authorized');
    return sendSuccess(res, 200, 'Property updated', { property });
  } catch (err) {
    if (err.name === 'CastError') {
      return sendError(res, 404, 'Property not found');
    }
    return sendError(res, 400, err.message || 'Failed to update property');
  }
};

// DELETE /api/properties/:id  (seller only, own listing)
exports.remove = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
    });
    if (!property) return sendError(res, 404, 'Property not found or you are not authorized');
    return sendSuccess(res, 200, 'Property deleted successfully');
  } catch (err) {
    if (err.name === 'CastError') {
      return sendError(res, 404, 'Property not found');
    }
    return sendError(res, 500, 'Failed to delete property');
  }
};
