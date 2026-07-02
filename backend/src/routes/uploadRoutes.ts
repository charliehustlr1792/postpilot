import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '@clerk/express';
import { uploadImage } from '../controllers/uploadController';

// Keep the file in memory so it can be streamed straight to Cloudinary.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

const router = Router();

// Wrap multer so size/type errors return a clean 400 (there's no global error
// handler yet).
router.post(
    '/uploads',
    requireAuth(),
    (req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
                const message = err instanceof multer.MulterError ? err.message : err.message || 'Upload failed';
                return res.status(400).json({ error: message });
            }
            next();
        });
    },
    uploadImage
);

export default router;
