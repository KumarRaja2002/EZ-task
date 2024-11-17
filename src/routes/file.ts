import { Hono } from 'hono';
import {fileController} from '../controllers/fileController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const authMiddleware = new AuthMiddleware();
export const fileRoutes = new Hono();
fileRoutes.use('*', authMiddleware.checkAuthHeader, authMiddleware.validateAccessToken);

// Generate a presigned URL for uploading a file
fileRoutes.post('/generate-presigned-url',fileController.generatePresignedUrl);

// Add a file to the database or perform additional file-related operations
fileRoutes.post('/add-file', fileController.addFile);

// Retrieve all files for a specific entity
fileRoutes.get('/files', fileController.getFiles);

fileRoutes.get('/file/:file_id', fileController.getFiles);

fileRoutes.post('/generate-download-presigned-url', fileController.generateDownloadPresignedUrl);

export default fileRoutes;
