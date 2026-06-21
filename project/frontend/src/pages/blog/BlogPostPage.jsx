import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import axios from 'axios';
import DOMPurify from 'dompurify';

export default function BlogPost() {
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
      trackEngagement(res.data.data.blog._id);
    } catch (error) {
      console.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const trackEngagement = (blogId) => {
    const startTime = Date.now();
    let maxScroll = 0;

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercentage);
    };

    const handleUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      navigator.sendBeacon('/api/blog/track/engagement', JSON.stringify({
        blogId,
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

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = data.blog.title;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      
      try {
        await axios.post('/api/blog/track/share', { blogId: data.blog._id, platform });
      } catch (error) {
        console.error('Failed to track share');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-custom border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  const { blog, relatedPosts, structuredData } = data;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{blog.seo?.title || blog.title}</title>
        <meta name="description" content={blog.seo?.description || blog.excerpt} />
        <meta name="keywords" content={blog.seo?.keywords?.join(', ')} />
        <link rel="canonical" href={blog.seo?.canonicalUrl || `https://kaunsahostel.com/blog/${blog.slug}`} />
        
        <meta property="og:title" content={blog.seo?.title || blog.title} />
        <meta property="og:description" content={blog.seo?.description || blog.excerpt} />
        <meta property="og:image" content={blog.seo?.ogImage || blog.featuredImage?.url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={blog.seo?.canonicalUrl || `https://kaunsahostel.com/blog/${blog.slug}`} />
        
        <meta name="twitter:card" content={blog.seo?.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={blog.seo?.title || blog.title} />
        <meta name="twitter:description" content={blog.seo?.description || blog.excerpt} />
        
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      </Helmet>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <Link to="/" className="hover:text-gray-900 transition">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-gray-900 transition">Blog</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{blog.title}</span>
            </nav>

            {/* Categories */}
            <div className="flex gap-2 mb-4">
              {blog.categories?.map(cat => (
                <Link
                  key={cat._id}
                  to={`/blog?category=${cat._id}`}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg hover:shadow-xl transition"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-3">
                {blog.author?.avatar?.url ? (
                  <img src={blog.author.avatar.url} alt={blog.author.name} className="w-10 h-10 rounded-full border-2 border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold border-2 border-gray-200">
                    {blog.author?.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{blog.author?.name}</div>
                  <div className="text-sm">{new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="text-sm">{blog.readingTime} min read</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-sm">{blog.views} views</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.featuredImage?.url ? (
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={blog.featuredImage.url}
                  alt={blog.featuredImage.alt || blog.title}
                  className="w-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-96 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                        <svg class="w-16 h-16 mb-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                        <p class="font-medium">Article Image</p>
                        <p class="text-sm">Not Available</p>
                      </div>
                    `;
                  }}
                />
              </div>
              {blog.featuredImage.caption && (
                <p className="text-sm text-gray-600 mt-3 text-center">{blog.featuredImage.caption}</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-8">
              {/* Share Sidebar */}
              <div className="hidden lg:block sticky top-24 self-start">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-12 h-12 rounded-xl bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 flex items-center justify-center transition-all duration-300 shadow-sm"
                    title="Share on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-12 h-12 rounded-xl bg-white hover:bg-sky-500 text-sky-500 hover:text-white border border-gray-200 hover:border-sky-500 flex items-center justify-center transition-all duration-300 shadow-sm"
                    title="Share on Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-12 h-12 rounded-xl bg-white hover:bg-blue-700 text-blue-700 hover:text-white border border-gray-200 hover:border-blue-700 flex items-center justify-center transition-all duration-300 shadow-sm"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-12 h-12 rounded-xl bg-white hover:bg-green-500 text-green-500 hover:text-white border border-gray-200 hover:border-green-500 flex items-center justify-center transition-all duration-300 shadow-sm"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <article className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12">
                <div
                  className="prose prose-lg max-w-none 
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-strong:text-gray-900
                  prose-ul:my-4 prose-ol:my-4
                  prose-li:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
                />

                {/* Tags */}
                {blog.tags?.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <span className="font-semibold text-gray-700">Tags:</span>
                      {blog.tags.map(tag => (
                        <Link
                          key={tag._id}
                          to={`/blog?tag=${tag._id}`}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Bio */}
                {blog.author?.bio && (
                  <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex gap-4">
                      {blog.author.avatar?.url ? (
                        <img src={blog.author.avatar.url} alt={blog.author.name} className="w-16 h-16 rounded-full" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl">
                          {blog.author.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">About {blog.author.name}</h3>
                        <p className="text-gray-700 text-sm">{blog.author.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Related Posts */}
            {relatedPosts?.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map(post => (
                    <RelatedPostCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function RelatedPostCard({ post }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
      <Link to={`/blog/${post.slug}`} className="block group">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden h-full transition-all duration-300">
          <div className="relative overflow-hidden h-48">
            {post.featuredImage?.url ? (
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 ${post.featuredImage?.url ? 'hidden' : 'flex'}`}>
              <svg className="w-10 h-10 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium">Article Image</p>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">
              {post.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{post.readingTime} min</span>
              <span className="mx-2">•</span>
              <span>{post.views} views</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
