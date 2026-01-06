const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /jpeg|jpg|png|webp|gif|mp4|mov|avi|webm|quicktime/;
        const allowedMimeTypes = /image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|x-msvideo|quicktime|webm|x-matroska)/;

        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.test(file.mimetype);

        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb(new Error(`File type not supported (${path.extname(file.originalname)}). Use common image or video formats.`));
        }
    }
});

module.exports = upload;
