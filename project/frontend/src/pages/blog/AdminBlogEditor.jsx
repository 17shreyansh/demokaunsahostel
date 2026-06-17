import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Switch, message } from 'antd';
import { Save, Eye, Send, Plus, Sparkles, X } from 'lucide-react';
import TiptapEditor from '../../components/editor/TiptapEditor';
import ImageUpload from '../../components/ImageUpload';
import blogAPI, { categoryService, tagService } from '../../services/blogAPI';

const { TextArea } = Input;
const { Option } = Select;

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [seoScore, setSeoScore] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  
  // Modal States
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryForm] = Form.useForm();
  const [tagModal, setTagModal] = useState(false);
  const [tagForm] = Form.useForm();

  useEffect(() => {
    loadData();
    if (id) loadBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (id && content) autoSave();
    }, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, content]);

  const loadData = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        categoryService.getAll(),
        tagService.getAll()
      ]);
      setCategories(categoriesRes.data.data);
      setTags(tagsRes.data.data);
    } catch (error) {
      message.error('Failed to load metadata');
    }
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      const res = await blogAPI.get(`/admin/${id}`);
      const blog = res.data.data.blog;
      form.setFieldsValue({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        categories: blog.categories?.map(c => c._id),
        tags: blog.tags?.map(t => t._id),
        status: blog.status,
        isFeatured: blog.isFeatured,
        allowComments: blog.allowComments,
        'seo.title': blog.seo?.title,
        'seo.description': blog.seo?.description,
        'seo.keywords': blog.seo?.keywords?.join(', '),
        'seo.focusKeyword': blog.seo?.focusKeyword
      });
      setContent(blog.content);
      setFeaturedImage(blog.featuredImage || null);
      setSeoScore(res.data.data.seoScore);
    } catch (error) {
      message.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    try {
      setAutoSaving(true);
      await blogAPI.patch(`/admin/${id}/autosave`, {
        title: form.getFieldValue('title'),
        content
      });
    } catch (error) {
      console.error('Auto-save failed');
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const data = {
        ...values,
        content,
        featuredImage,
        seo: {
          title: values['seo.title'],
          description: values['seo.description'],
          keywords: values['seo.keywords']?.split(',').map(k => k.trim()),
          focusKeyword: values['seo.focusKeyword']
        }
      };

      if (id) {
        await blogAPI.put(`/admin/${id}`, data);
        message.success('Blog updated successfully');
      } else {
        const res = await blogAPI.post('/admin', data);
        message.success('Blog created successfully');
        navigate(`/admin/blog/edit/${res.data.data._id}`);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await blogAPI.post(`/admin/${id}/publish`);
      message.success('Blog published successfully');
      navigate('/admin/blog');
    } catch (error) {
      message.error('Failed to publish blog');
    }
  };

  const generateSEO = async () => {
    try {
      const hideLoading = message.loading('Analyzing content and generating SEO...', 0);
      const res = await blogAPI.post('/admin/seo/generate', {
        title: form.getFieldValue('title'),
        content,
        excerpt: form.getFieldValue('excerpt')
      });
      hideLoading();
      const { seo, seoScore: score } = res.data.data;
      form.setFieldsValue({
        'seo.title': seo.title,
        'seo.description': seo.description,
        'seo.keywords': seo.keywords?.join(', '),
        'seo.focusKeyword': seo.focusKeyword
      });
      setSeoScore(score);
      message.success('SEO optimization generated');
    } catch (error) {
      message.error('Failed to generate SEO');
    }
  };

  const handleCreateCategory = async (values) => {
    try {
      const res = await categoryService.create(values);
      message.success('Category created');
      setCategories([...categories, res.data.data]);
      setCategoryModal(false);
      categoryForm.resetFields();
    } catch (error) {
      message.error('Failed to create category');
    }
  };

  const handleCreateTag = async (values) => {
    try {
      const res = await tagService.create(values);
      message.success('Tag created');
      setTags([...tags, res.data.data]);
      setTagModal(false);
      tagForm.resetFields();
    } catch (error) {
      message.error('Failed to create tag');
    }
  };

  const handleImageUpload = (imageData) => {
    setFeaturedImage(imageData);
  };

  const handleImageRemove = async () => {
    if (id && featuredImage) {
      try {
        await blogAPI.delete(`/admin/${id}/image`);
        message.success('Image removed');
      } catch (error) {
        console.error('Failed to remove image:', error);
      }
    }
    setFeaturedImage(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans text-gray-900">
      
      {/* Flat Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight m-0">
            {id ? 'Edit Blog Post' : 'Create Blog Post'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Write, format, and optimize your content.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {autoSaving && (
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Auto-saving...
            </span>
          )}
          <button 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <Eye size={16} /> Preview
          </button>
          <button 
            onClick={() => form.submit()} 
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 text-sm font-bold hover:bg-black transition-colors focus:outline-none disabled:opacity-50"
          >
            <Save size={16} /> Save Draft
          </button>
          {id && (
            <button 
              onClick={handlePublish}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white border border-green-600 text-sm font-bold hover:bg-green-700 transition-colors focus:outline-none"
            >
              <Send size={16} /> Publish
            </button>
          )}
        </div>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        // Strict Flat Overrides for AntD components
        className="[&_.ant-form-item-label>label]:font-bold [&_.ant-form-item-label>label]:text-gray-800 [&_.ant-input]:rounded-none [&_.ant-input]:border-gray-300 [&_.ant-input]:shadow-none [&_.ant-select-selector]:rounded-none [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:shadow-none"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Flat Content Panel */}
            <div className="bg-white border border-gray-200 p-6">
              <Form.Item name="title" label="Post Title" rules={[{ required: true }]}>
                <Input size="large" placeholder="Enter a compelling title" className="font-medium text-lg px-4 py-3" />
              </Form.Item>

              <Form.Item name="slug" label="URL Slug" extra={<span className="text-xs text-gray-500 font-medium">Leave blank to auto-generate from title.</span>}>
                <Input placeholder="e.g., my-awesome-post" className="bg-gray-50" />
              </Form.Item>

              <Form.Item label="Article Content" className="mb-0">
                <div className="border border-gray-300 bg-white">
                  <TiptapEditor content={content} onChange={setContent} />
                </div>
              </Form.Item>

              <Form.Item name="excerpt" label="Short Excerpt" className="mt-6 mb-0">
                <TextArea rows={3} placeholder="A brief summary for blog cards and previews..." maxLength={300} showCount />
              </Form.Item>
            </div>

            {/* Flat SEO Panel */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-gray-900">SEO Optimization</h2>
                <button 
                  type="button"
                  onClick={generateSEO}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm font-bold transition-colors focus:outline-none"
                >
                  <Sparkles size={16} /> Auto-Generate SEO
                </button>
              </div>

              {seoScore && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Current Score:</span>
                    <span className={`text-2xl font-black leading-none ${
                      seoScore.score >= 80 ? 'text-green-600' : seoScore.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {seoScore.score} <span className="text-base text-gray-400 font-bold">/ 100</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seoScore.checks?.map((check, i) => (
                      <span key={i} className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border ${
                        check.status === 'pass' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {check.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Form.Item name="seo.title" label="Meta Title">
                <Input placeholder="Optimal length: 50-60 characters" maxLength={60} showCount />
              </Form.Item>

              <Form.Item name="seo.description" label="Meta Description">
                <TextArea rows={3} placeholder="Optimal length: 150-160 characters" maxLength={160} showCount />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="seo.keywords" label="Meta Keywords" className="mb-0">
                  <Input placeholder="startup, software, guide" />
                </Form.Item>
                <Form.Item name="seo.focusKeyword" label="Focus Keyword" className="mb-0">
                  <Input placeholder="Primary target keyword" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Publishing Panel */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Publishing</h2>
              
              <Form.Item name="status" label="Visibility Status" initialValue="draft">
                <Select size="large">
                  <Option value="draft">Draft (Hidden)</Option>
                  <Option value="review">Pending Review</Option>
                  <Option value="published">Published (Live)</Option>
                </Select>
              </Form.Item>

              {/* Force Switch styling to be flat using arbitrary variants or just let AntD render but contained */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-800">Feature this post</span>
                <Form.Item name="isFeatured" valuePropName="checked" className="mb-0">
                  <Switch className="bg-gray-300" />
                </Form.Item>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-800">Allow Comments</span>
                <Form.Item name="allowComments" valuePropName="checked" initialValue={true} className="mb-0">
                  <Switch className="bg-gray-300" />
                </Form.Item>
              </div>
            </div>

            {/* Categories Panel */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Categories</h2>
                <button 
                  type="button"
                  onClick={() => setCategoryModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                >
                  <Plus size={14} /> New
                </button>
              </div>
              <Form.Item name="categories" className="mb-0">
                <Select mode="multiple" size="large" placeholder="Select applicable categories">
                  {categories.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </div>

            {/* Tags Panel */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Tags</h2>
                <button 
                  type="button"
                  onClick={() => setTagModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                >
                  <Plus size={14} /> New
                </button>
              </div>
              <Form.Item name="tags" className="mb-0">
                <Select mode="multiple" size="large" placeholder="Add descriptive tags">
                  {tags.map(t => <Option key={t._id} value={t._id}>{t.name}</Option>)}
                </Select>
              </Form.Item>
            </div>

            {/* Featured Image Panel */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-4">Featured Image</h2>
              <ImageUpload
                value={featuredImage}
                onChange={handleImageUpload}
                onRemove={handleImageRemove}
                maxSize={10}
                aspectRatio={16/9}
                showPreview={true}
              />
              
              {featuredImage && (
                <div className="mt-4 space-y-3">
                  <Input
                    placeholder="Alt text (for accessibility)"
                    value={featuredImage.alt}
                    onChange={(e) => setFeaturedImage({ ...featuredImage, alt: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Caption (optional)"
                    value={featuredImage.caption}
                    onChange={(e) => setFeaturedImage({ ...featuredImage, caption: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Photo credits (optional)"
                    value={featuredImage.credits}
                    onChange={(e) => setFeaturedImage({ ...featuredImage, credits: e.target.value })}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </Form>

      {/* Flat Custom Modal: Create Category */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Category</h2>
              <button onClick={() => setCategoryModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <Form 
              form={categoryForm} 
              onFinish={handleCreateCategory} 
              layout="vertical"
              className="[&_.ant-form-item-label>label]:font-bold [&_.ant-form-item-label>label]:text-gray-800 [&_.ant-input]:rounded-none [&_.ant-input]:border-gray-300 [&_.ant-input]:shadow-none"
            >
              <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Technology" size="large" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Brief description of this category" />
              </Form.Item>
              <Form.Item name="color" label="Badge Color" initialValue="#3B82F6">
                <Input type="color" className="h-12 w-full p-1 cursor-pointer" />
              </Form.Item>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button 
                  type="button" 
                  onClick={() => setCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Flat Custom Modal: Create Tag */}
      {tagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Tag</h2>
              <button onClick={() => setTagModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <Form 
              form={tagForm} 
              onFinish={handleCreateTag} 
              layout="vertical"
              className="[&_.ant-form-item-label>label]:font-bold [&_.ant-form-item-label>label]:text-gray-800 [&_.ant-input]:rounded-none [&_.ant-input]:border-gray-300 [&_.ant-input]:shadow-none"
            >
              <Form.Item name="name" label="Tag Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., ReactJS" size="large" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={2} placeholder="Optional description for this tag" />
              </Form.Item>
              <Form.Item name="color" label="Badge Color" initialValue="#6B7280">
                <Input type="color" className="h-12 w-full p-1 cursor-pointer" />
              </Form.Item>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button 
                  type="button" 
                  onClick={() => setTagModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  Create Tag
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

    </div>
  );
}