import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '../../services/blogAPI';

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENT                                                   */
/* -------------------------------------------------------------------------- */
const BlogCard = memo(({ blog, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <Link to={`/blog/${blog.slug}`} className="flex flex-col h-full bg-white rounded-3xl shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transition-all duration-300">
        
        {/* Image Container with Scalable Aspect Ratio */}
        <div className="relative overflow-hidden w-full aspect-[16/10] bg-gray-50">
          {blog.featuredImage ? (
            <img 
              src={blog.featuredImage} 
              alt={blog.title} 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Category Badge - Premium Look */}
          {blog.category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-white/90  text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                {blog.category}
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-6 lg:p-8">
          
          {/* Meta Info */}
          <div className="flex items-center text-[13px] font-medium text-gray-500 mb-4 space-x-4">
            {blog.author && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {blog.author.name || blog.author}
              </span>
            )}
            {blog.publishedAt && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors duration-300 line-clamp-2 leading-snug">
            {blog.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3">
            {blog.excerpt || blog.description}
          </p>

          {/* Read More Link (Pushed to bottom) */}
          <div className="mt-auto flex items-center text-sm font-bold text-yellow-500 group-hover:text-yellow-600 transition-colors duration-200 uppercase tracking-wide">
            <span>Read Article</span>
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

BlogCard.displayName = 'BlogCard';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const BlogsSection = memo(({ content }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogService.getPublishedBlogs({ limit: 3 });
        setBlogs(response.data.blogs || response.data.posts || response.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-[#F9FAFB] font-sans">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-yellow-400 border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28 bg-[#F9FAFB] font-sans relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-yellow-700 bg-yellow-100 rounded-full shadow-sm">
              Our Blog
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">
              {content?.title || 'Insights & Stories'}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed px-4">
              {content?.subtitle || 'Stay updated with the latest tips, property guides, and stories about student life.'}
            </p>
          </motion.div>
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto"
          >
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500 text-lg font-medium">No articles available yet. Check back soon!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16"
          >
            {blogs.map((blog, index) => (
              <BlogCard key={blog._id || index} blog={blog} index={index} />
            ))}
          </motion.div>
        )}

        {/* View All Button - Premium Glowing Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center flex justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/blog" 
              className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(250,204,21,0.39)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.6)] hover:bg-yellow-300 border border-yellow-300/50 group"
            >
              <span>View All Articles</span>
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
        
      </div>
    </section>
  );
});

BlogsSection.displayName = 'BlogsSection';

export default BlogsSection;