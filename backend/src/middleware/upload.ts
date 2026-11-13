import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';
import { config } from '../config/index.js';

const storage = multer.memoryStorage();

const allowedResumeMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const allowedLogoMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: config.storage.maxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedResumeMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type. Only PDF, DOC, and DOCX resumes are accepted.'));
    }
  },
});

export const uploadLogo = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for logos
  },
  fileFilter: (_req, file, cb) => {
    if (allowedLogoMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type. Only PNG, JPEG, WEBP, and SVG images are accepted for logos.'));
    }
  },
});

