const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Hostel = require('../models/Hostel');
const { generateSitemapEntry } = require('../utils/helpers');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await Blog.findPublished().select('slug title updatedAt isFeatured').lean();
    const hostels = await Hostel.find({}).select('slug updatedAt').lean();
    
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://kaunsahostel.com';

    // Static URLs
    const staticUrls = [
      { loc: `${FRONTEND_URL}/`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { loc: `${FRONTEND_URL}/hostels`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.9 },
      { loc: `${FRONTEND_URL}/about`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.7 },
      { loc: `${FRONTEND_URL}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.7 },
      { loc: `${FRONTEND_URL}/blog`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.8 }
    ];

    // Hostel URLs
    const hostelUrls = hostels.map(hostel => ({
      loc: `${FRONTEND_URL}/hostel/${hostel.slug}`,
      lastmod: (hostel.updatedAt || new Date()).toISOString(),
      changefreq: 'weekly',
      priority: 0.9
    }));

    // Blog URLs
    const blogUrls = blogs.map(blog => generateSitemapEntry(blog));

    const allUrls = [...staticUrls, ...hostelUrls, ...blogUrls];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
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
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://kaunsahostel.com';
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${FRONTEND_URL}/api/sitemap.xml`;

  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router;
