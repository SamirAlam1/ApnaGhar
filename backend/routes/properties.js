const router = require('express').Router();
const ctrl = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const validMime = allowed.test(file.mimetype);
    if (validExt && validMime) return cb(null, true);
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  },
});

// Public routes
router.get('/', ctrl.getAll);
router.get('/featured', ctrl.getFeatured);
router.get('/mine', protect, authorize('seller', 'admin'), ctrl.getMine);
router.get('/:id', ctrl.getById);

// Protected routes (sellers only)
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  upload.array('images', 10),
  ctrl.create
);
router.put('/:id', protect, authorize('seller', 'admin'), ctrl.update);
router.delete('/:id', protect, authorize('seller', 'admin'), ctrl.remove);

module.exports = router;
