const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { generateSitemapEntry } = require('../utils/helpers');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await Blog.findPublished().select('slug title updatedAt isFeatured').lean();
    
    const urls = blogs.map(blog => generateSitemapEntry(blog));
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

router.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${process.env.FRONTEND_URL}/api/sitemap.xml`;

  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router;
