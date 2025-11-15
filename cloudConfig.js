const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure cloudinary - if no credentials, use local storage fallback
const useLocalStorage = !process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET;

if (!useLocalStorage) {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
    });
}

// Create storage engine
const storage = useLocalStorage ? 
    // Local storage fallback
    require('multer').diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname)
        }
    }) :
    // Cloudinary storage
    new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'wanderlust_DEV',
            allowedFormats: ['png', 'jpg', 'jpeg'],
        },
    });

module.exports = { cloudinary, storage };