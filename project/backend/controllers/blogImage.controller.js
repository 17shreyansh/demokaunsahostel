const imageUploadService = require('../services/imageUpload.service');
const Blog = require('../models/Blog');

// Upload featured image for blog
exports.uploadFeaturedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { alt, caption, credits } = req.body;
    const processedImages = await imageUploadService.processImage(req.file);

    const imageData = {
      url: processedImages.original,
      thumbnail: processedImages.thumbnail,
      medium: processedImages.medium,
      large: processedImages.large,
      webp: processedImages.webp,
      alt: alt || '',
      caption: caption || '',
      credits: credits || ''
    };

    res.json({
      success: true,
      data: imageData,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// Update blog featured image
exports.updateBlogImage = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Delete old images if exists
    if (blog.featuredImage?.url) {
      await imageUploadService.deleteImageSet({
        original: blog.featuredImage.url,
        thumbnail: blog.featuredImage.thumbnail,
        medium: blog.featuredImage.medium,
        large: blog.featuredImage.large,
        webp: blog.featuredImage.webp
      });
    }

    const { alt, caption, credits } = req.body;
    const processedImages = await imageUploadService.processImage(req.file);

    blog.featuredImage = {
      url: processedImages.original,
      thumbnail: processedImages.thumbnail,
      medium: processedImages.medium,
      large: processedImages.large,
      webp: processedImages.webp,
      alt: alt || blog.featuredImage?.alt || '',
      caption: caption || blog.featuredImage?.caption || '',
      credits: credits || blog.featuredImage?.credits || ''
    };

    await blog.save();

    res.json({
      success: true,
      data: blog.featuredImage,
      message: 'Blog image updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update blog image'
    });
  }
};

// Remove featured image from blog
exports.removeBlogImage = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.featuredImage?.url) {
      await imageUploadService.deleteImageSet({
        original: blog.featuredImage.url,
        thumbnail: blog.featuredImage.thumbnail,
        medium: blog.featuredImage.medium,
        large: blog.featuredImage.large,
        webp: blog.featuredImage.webp
      });
    }

    blog.featuredImage = undefined;
    await blog.save();

    res.json({
      success: true,
      message: 'Featured image removed successfully'
    });
  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove image'
    });
  }
};
