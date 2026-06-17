const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads/blog-images');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async processImage(file) {
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const results = {};

    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      // Original
      const originalPath = path.join(this.uploadDir, `${filename}-original${path.extname(file.originalname)}`);
      await image.toFile(originalPath);
      results.original = `/uploads/blog-images/${filename}-original${path.extname(file.originalname)}`;

      // Thumbnail (300x200)
      const thumbPath = path.join(this.uploadDir, `${filename}-thumb.webp`);
      await sharp(file.buffer)
        .resize(300, 200, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toFile(thumbPath);
      results.thumbnail = `/uploads/blog-images/${filename}-thumb.webp`;

      // Medium (800x600)
      const mediumPath = path.join(this.uploadDir, `${filename}-medium.webp`);
      await sharp(file.buffer)
        .resize(800, 600, { fit: 'inside' })
        .webp({ quality: 85 })
        .toFile(mediumPath);
      results.medium = `/uploads/blog-images/${filename}-medium.webp`;

      // Large (1200x900)
      const largePath = path.join(this.uploadDir, `${filename}-large.webp`);
      await sharp(file.buffer)
        .resize(1200, 900, { fit: 'inside' })
        .webp({ quality: 90 })
        .toFile(largePath);
      results.large = `/uploads/blog-images/${filename}-large.webp`;

      // WebP version of original
      const webpPath = path.join(this.uploadDir, `${filename}-webp.webp`);
      await sharp(file.buffer)
        .webp({ quality: 90 })
        .toFile(webpPath);
      results.webp = `/uploads/blog-images/${filename}-webp.webp`;

      results.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: file.size
      };

      return results;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async deleteImage(imagePath) {
    try {
      if (!imagePath) return;
      const fullPath = path.join(__dirname, '../', imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  async deleteImageSet(imageUrls) {
    const promises = Object.values(imageUrls).map(url => this.deleteImage(url));
    await Promise.all(promises);
  }
}

module.exports = new ImageUploadService();
