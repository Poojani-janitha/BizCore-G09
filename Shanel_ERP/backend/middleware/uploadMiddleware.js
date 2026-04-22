const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── ENSURE UPLOADS DIRECTORY EXISTS ────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✓ Uploads directory created');
}

// ─── CONFIGURE STORAGE ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: product-timestamp-randomnumber.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

// ─── FILE FILTER (only allow images) ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`), false);
    }
};

// ─── CONFIGURE MULTER ────────────────────────────────────────────────────────
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

module.exports = upload;
