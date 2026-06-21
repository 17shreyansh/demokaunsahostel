const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Optimizes an uploaded image file by resizing and converting to WebP
 * @param {Object} file - The multer file object
 * @param {number} maxWidth - Maximum width for the image
 * @returns {Promise<string>} The new filename to store in DB
 */
const optimizeImage = async (file, maxWidth = 1200) => {
  if (!file || !file.path) return null;
  
  const filenameWithoutExt = path.basename(file.filename, path.extname(file.filename));
  const newFilename = `${filenameWithoutExt}.webp`;
  const newPath = path.join(path.dirname(file.path), newFilename);
  
  try {
    await sharp(file.path)
      .resize({
        width: maxWidth,
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(newPath);
      
    // Delete original file if we created a new one with a different name
    if (file.path !== newPath) {
      await fs.unlink(file.path).catch(err => console.error('Failed to delete original image:', err));
    }
    
    return newFilename;
  } catch (error) {
    console.error(`Error optimizing image ${file.filename}:`, error);
    // Fallback to original file if optimization fails
    return file.filename;
  }
};

module.exports = { optimizeImage };
