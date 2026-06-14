import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import DOMPurify from 'dompurify';

export function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12 });

  useEffect(() => {
    loadBlogs();
  }, [pagination.page]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/blog', {
        params: { status: 'published', page: pagination.page, limit: pagination.limit }
      });
      setBlogs(res.data.blogs);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (error) {
      console.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Helmet>
        <title>Blog - Kaunsa College</title>
        <meta name="description" content="Read our latest articles and insights" />
      </Helmet>

      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map(blog => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setPagination(prev => ({ ...prev, page }))}
              className={`px-4 py-2 rounded ${page === pagination.page ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogCard({ blog }) {
  return (
    <Link to={`/blog/${blog.slug}`} className="group block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
        {blog.featuredImage?.url && (
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition"
          />
        )}
        <div className="p-6">
          <div className="flex gap-2 mb-2">
            {blog.categories?.slice(0, 2).map(cat => (
              <span key={cat._id} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: cat.color, color: 'white' }}>
                {cat.name}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">{blog.title}</h3>
          <p className="text-gray-600 mb-4">{blog.excerpt}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {blog.author?.avatar?.url && (
                <img src={blog.author.avatar.url} alt={blog.author.name} className="w-6 h-6 rounded-full" />
              )}
              <span>{blog.author?.name}</span>
            </div>
            <span>{blog.readingTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/blog/slug/${slug}`);
      setData(res.data.data);
      
      trackEngagement();
    } catch (error) {
      console.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const trackEngagement = () => {
    const startTime = Date.now();
    let maxScroll = 0;

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercentage);
    };

    const handleUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      navigator.sendBeacon('/api/blog/track/engagement', JSON.stringify({
        blogId: data?.blog._id,
        timeOnPage,
        completionRate: maxScroll
      }));
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleUnload);
    };
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!data) return <div className="text-center py-20">Blog not found</div>;

  const { blog, relatedPosts, structuredData } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>{blog.seo?.title || blog.title}</title>
        <meta name="description" content={blog.seo?.description || blog.excerpt} />
        <meta name="keywords" content={blog.seo?.keywords?.join(', ')} />
        <link rel="canonical" href={blog.seo?.canonicalUrl} />
        
        <meta property="og:title" content={blog.seo?.title || blog.title} />
        <meta property="og:description" content={blog.seo?.description || blog.excerpt} />
        <meta property="og:image" content={blog.seo?.ogImage || blog.featuredImage?.url} />
        <meta property="og:type" content="article" />
        
        <meta name="twitter:card" content={blog.seo?.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={blog.seo?.title || blog.title} />
        <meta name="twitter:description" content={blog.seo?.description || blog.excerpt} />
        
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <article>
        <header className="mb-8">
          <div className="flex gap-2 mb-4">
            {blog.categories?.map(cat => (
              <Link
                key={cat._id}
                to={`/blog/category/${cat.slug}`}
                className="text-xs px-3 py-1 rounded"
                style={{ backgroundColor: cat.color, color: 'white' }}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <h1 className="text-5xl font-bold mb-4">{blog.title}</h1>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              {blog.author?.avatar?.url && (
                <img src={blog.author.avatar.url} alt={blog.author.name} className="w-10 h-10 rounded-full" />
              )}
              <div>
                <div className="font-medium">{blog.author?.name}</div>
                <div className="text-sm">{new Date(blog.publishDate).toLocaleDateString()}</div>
              </div>
            </div>
            <span>•</span>
            <span>{blog.readingTime} min read</span>
            <span>•</span>
            <span>{blog.views} views</span>
          </div>
        </header>

        {blog.featuredImage?.url && (
          <figure className="mb-8">
            <img
              src={blog.featuredImage.url}
              alt={blog.featuredImage.alt || blog.title}
              className="w-full rounded-lg"
            />
            {blog.featuredImage.caption && (
              <figcaption className="text-sm text-gray-600 mt-2 text-center">{blog.featuredImage.caption}</figcaption>
            )}
          </figure>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
        />

        <div className="flex gap-2 mt-8">
          {blog.tags?.map(tag => (
            <Link key={tag._id} to={`/blog/tag/${tag.slug}`} className="text-sm px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300">
              #{tag.name}
            </Link>
          ))}
        </div>
      </article>

      {relatedPosts?.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(post => (
              <BlogCard key={post._id} blog={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
