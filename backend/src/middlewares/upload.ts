import multer from 'multer';
import path from 'path';

const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'image/jpeg',
  'image/png',
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.pdf', '.txt', '.jpg', '.jpeg', '.png'];
    if (ALLOWED_TYPES.includes(file.mimetype) || allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, TXT, JPEG, PNG'));
    }
  },
});

export function extractTextFromFile(buffer: Buffer, mimetype: string): string {
  if (mimetype === 'text/plain') return buffer.toString('utf-8');
  if (mimetype.startsWith('image/')) {
    return '[Image uploaded — context will be used when vision API is configured]';
  }
  return '[PDF uploaded — text extraction requires pdf-parse in production]';
}
