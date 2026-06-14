const cron = require('node-cron');
const blogService = require('../services/blog.service');

// Publish scheduled posts every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Running scheduled post publisher...');
    const count = await blogService.publishScheduled();
    if (count > 0) {
      console.log(`Published ${count} scheduled post(s)`);
    }
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
  }
});

// Update trending posts daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Updating trending posts...');
    const count = await blogService.updateTrending();
    console.log(`Updated ${count} trending post(s)`);
  } catch (error) {
    console.error('Error updating trending posts:', error);
  }
});

// Update category post counts daily
cron.schedule('0 1 * * *', async () => {
  try {
    console.log('Updating category post counts...');
    const Category = require('../models/Category');
    const categories = await Category.find();
    
    for (const category of categories) {
      await Category.updatePostCount(category._id);
    }
    
    console.log('Category counts updated');
  } catch (error) {
    console.error('Error updating category counts:', error);
  }
});

console.log('Cron jobs initialized');

module.exports = {};
