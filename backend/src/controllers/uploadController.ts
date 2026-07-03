import { Request, Response } from 'express';
import cloudinary from '../lib/cloudinary';
import { AppError } from '../lib/AppError';

// Uploads a single image (provided as a buffer by multer) to Cloudinary and
// returns its permanent, public URL for use in Post.images. A Cloudinary
// failure rejects and propagates to the central error handler.
export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError(400, 'No file uploaded');
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        throw new AppError(503, 'Image uploads are not configured');
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'postpilot', resource_type: 'image' },
            (error, uploaded) => {
                if (error || !uploaded) {
                    return reject(error ?? new Error('Upload failed'));
                }
                resolve(uploaded);
            }
        );
        stream.end(req.file!.buffer);
    });

    res.status(201).json({ url: result.secure_url });
};
