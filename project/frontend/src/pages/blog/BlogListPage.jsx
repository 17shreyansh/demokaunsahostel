import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 9 });

  useEffect(() => {
    loadData();
  }, [pagination.page, activeCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { 
        status: 'published', 
        page: pagination.page, 
        limit: pagination.limit,
        category: activeCategory !== 'all' ? activeCategory : undefined
      };
      
      const [blogsRes, featuredRes, categoriesRes] = await Promise.all([
        axios.get('/api/blog', { params }),
        axios.get('/api/blog/featured', { params: { limit: 3 } }),
        axios.get('/api/blog/categories')
      ]);
      
      setBlogs(blogsRes.data.blogs);
      setPagination(prev => ({ ...prev, ...blogsRes.data.pagination }));
      setFeatured(featuredRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>KaunsaHostel Blog | Student Life, Hostel Guides & Insights</title>
        <meta name="description" content="Discover the best tips for student living, hostel recommendations, study hacks, and more on the KaunsaHostel blog. Your guide to student life in Greater Noida." />
        <link rel="canonical" href="https://kaunsahostel.com/blog" />
        <meta property="og:title" content="KaunsaHostel Blog | Student Life & Hostel Guides" />
        <meta property="og:description" content="Discover the best tips for student living, hostel recommendations, study hacks, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kaunsahostel.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover insights, tips, and stories to help you make the best decisions
            </p>
            <div className="mt-4 w-20 sm:w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featured.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map(blog => (
                <FeaturedBlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === 'all'
                    ? 'bg-yellow-custom text-gray-900 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow border border-gray-200'
                }`}
              >
                All Articles
              </button>
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === cat._id
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow border border-gray-200'
                  }`}
                  style={{
                    backgroundColor: activeCategory === cat._id ? cat.color : undefined
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs && blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-xl bg-white shadow border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-4 py-2 rounded-xl shadow transition ${
                          pageNum === pagination.page
                            ? 'bg-yellow-custom text-gray-900 border border-yellow-500'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-xl bg-white shadow border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">No Articles Found</h4>
              <p className="text-gray-600">Please check back later for new content.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FeaturedBlogCard({ blog }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
      <Link to={`/blog/${blog.slug}`} className="block group">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden h-full transition-all duration-300">
          <div className="relative overflow-hidden h-56">
            {blog.featuredImage?.url ? (
              <img
                src={blog.featuredImage.url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 ${blog.featuredImage?.url ? 'hidden' : 'flex'}`}>
              <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">Article Image</p>
            </div>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-custom text-gray-900">
                Featured
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-3">
              {blog.categories?.slice(0, 1).map(cat => (
                <span key={cat._id} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                  {cat.name}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
              {blog.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{blog.readingTime} min read</span>
              <span>{new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BlogCard({ blog }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
      <Link to={`/blog/${blog.slug}`} className="block group">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden h-full transition-all duration-300">
          <div className="relative overflow-hidden h-56">
            {blog.featuredImage?.url ? (
              <img
                src={blog.featuredImage.url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 ${blog.featuredImage?.url ? 'hidden' : 'flex'}`}>
              <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">Article Image</p>
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              {blog.categories?.slice(0, 1).map(cat => (
                <span
                  key={cat._id}
                  className="text-xs px-3 py-1 rounded-full font-medium text-white shadow-lg"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
              {blog.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {blog.excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                {blog.author?.avatar?.url ? (
                  <img src={blog.author.avatar.url} alt={blog.author.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {blog.author?.name?.charAt(0)}
                  </div>
                )}
                <span className="text-xs">{blog.author?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{blog.readingTime} min</span>
                <span>•</span>
                <span>{new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
