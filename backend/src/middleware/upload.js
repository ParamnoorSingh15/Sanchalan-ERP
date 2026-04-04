const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel
    ? path.join(os.tmpdir(), 'sanchalan-uploads/tasks')
    : path.join(__dirname, '../../uploads/tasks');

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Could not create upload dir (Vercel read-only filesystem):', err.message);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.pdf' && ext !== '.csv') {
            return cb(new Error('Only images, PDFs, and CSVs are allowed'));
        }
        cb(null, true);
    }
});

module.exports = upload;
