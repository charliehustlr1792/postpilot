import { Request, Response } from 'express';
import cloudinary from '../lib/cloudinary';

// Uploads a single image (provided as a buffer by multer) to Cloudinary and
// returns its permanent, public URL for use in Post.images.
export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        return res.status(503).json({ error: 'Image uploads are not configured' });
    }

    try {
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
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};
