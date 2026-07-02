import { v2 as cloudinary } from 'cloudinary';

// Configured from env; leave the credentials blank to disable uploads (the
// upload endpoint will return an error until they're set).
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
