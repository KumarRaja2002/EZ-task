// fileconfig.ts
import multer from 'multer';
import path from 'path';

// Define file storage location
const uploadLocation = './uploads'; // You can change this path based on your needs

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadLocation); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name using timestamp
  },
});

// File upload limits (for example, 2MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB size limit
}).single('file'); // Handle file uploaded with 'file' field

export const fileLocation = uploadLocation; // Export file location
export default upload;
