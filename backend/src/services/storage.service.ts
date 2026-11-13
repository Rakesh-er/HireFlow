import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface StorageProvider {
  saveFile(file: Express.Multer.File, subfolder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getFilePath(fileUrl: string): string;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.uploadDir;
    this.ensureDirectory(this.baseDir);
    this.ensureDirectory(path.join(this.baseDir, 'resumes'));
    this.ensureDirectory(path.join(this.baseDir, 'company-logos'));
  }

  private ensureDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subfolder: string): Promise<string> {
    const targetDir = path.join(this.baseDir, subfolder);
    this.ensureDirectory(targetDir);

    // Sanitize filename
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}-${sanitizedBase}${ext}`;
    const destination = path.join(targetDir, uniqueName);

    await fs.promises.writeFile(destination, file.buffer);
    logger.info(`File saved locally: ${destination}`);

    // Return public relative path
    return `/uploads/${subfolder}/${uniqueName}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const cleanPath = fileUrl.replace(/^\/uploads\//, '');
      const filePath = path.join(this.baseDir, cleanPath);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Error deleting file:', err);
      return false;
    }
  }

  getFilePath(fileUrl: string): string {
    const cleanPath = fileUrl.replace(/^\/uploads\//, '');
    return path.join(this.baseDir, cleanPath);
  }
}

// Storage service singleton instance
export const storageService = new LocalStorageProvider();

