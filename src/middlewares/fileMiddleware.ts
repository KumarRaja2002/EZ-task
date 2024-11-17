// import { Context } from 'hono';
// import multer from 'multer';
// import { filelocation } from '../../config/fileConfig';

// // Set up multer storage and file limits
// const upload = multer({
//   dest: filelocation,
//   limits: { fileSize: 2 * 1024 * 1024 }, // Limit to 2MB
// });

// // Upload middleware for single file
// export const uploadMiddleware = (c: Context, next: () => Promise<void>) => {
//   console.log('File upload middleware...');
  
//   return new Promise<void>((resolve, reject) => {
//     // Get the raw Node.js request object
//     const rawReq = (c.req as any).getRaw() ;

//     // Pass the raw request and response to multer's middleware
//     upload.single('file')(rawReq, c.res as any, (err: any) => {
//       if (err) {
//         console.error('Multer error:', err);
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   })
//   .then(() => next())  // Proceed to next handler after file is uploaded
//   .catch((err) => {
//     // If upload fails, send an error response
//     console.error('File upload failed:', err);
//     return c.json({ message: `File upload failed: ${(err as Error).message}` }, 400);
//   });
// };
