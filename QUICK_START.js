// BLOG SYSTEM - QUICK START GUIDE
// ================================

// STEP 1: Install Dependencies
// Backend:
cd project/backend
node installBlogDeps.js

// STEP 2: Create Initial Author
node createAuthor.js
// Save the Author ID shown in console

// STEP 3: Start Backend
npm run dev

// STEP 4: Access Admin Panel
// URL: http://localhost:3000/admin
// Click "Blog Posts" in sidebar

// STEP 5: Create First Blog
// Click "New Post" button
// Fill in title, content, categories
// Click "Publish"

// STEP 6: View Public Blog
// URL: http://localhost:3000/blog

// ================================
// ADMIN ROUTES
// ================================
// /admin/blog - List all blog posts
// /admin/blog/new - Create new post
// /admin/blog/edit/:id - Edit existing post

// ================================
// PUBLIC ROUTES
// ================================
// /blog - List all published blogs
// /blog/:slug - Single blog post

// ================================
// API ENDPOINTS (Backend)
// ================================
// GET    /api/blog - List blogs
// POST   /api/blog/admin - Create blog
// PUT    /api/blog/admin/:id - Update blog
// DELETE /api/blog/admin/:id - Delete blog
// GET    /api/blog/slug/:slug - Get by slug
// POST   /api/blog/admin/:id/publish - Publish
// GET    /api/blog/categories - Categories
// GET    /api/blog/tags - Tags
// GET    /api/blog/authors - Authors

// Full API docs: backend/API_DOCUMENTATION.js

module.exports = {};
