const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to keep the file in RAM instead of saving to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// The Upload Route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Wrap the Cloudinary upload stream in a Promise and await it
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: 'universe_app',
            // Auto-compress and optimize the image before saving
            fetch_format: 'auto', 
            quality: 'auto' 
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        
        // Feed the Multer RAM buffer into the Cloudinary stream
        stream.end(req.file.buffer);
      });
    };

    // Fire the upload and get the secure URL back
    const result = await uploadToCloudinary();
    
    // Send the tiny, fast URL back to the React frontend!
    res.json({ imageUrl: result.secure_url });

  } catch (error) {
    console.error('Cloudinary Stream Error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;