import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Switch, Button, Tabs, Space, message, Tag, Card, Statistic, Modal } from 'antd';
import { SaveOutlined, EyeOutlined, SendOutlined, PlusOutlined } from '@ant-design/icons';
import TiptapEditor from '../../components/editor/TiptapEditor';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [seoScore, setSeoScore] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryForm] = Form.useForm();
  const [tagModal, setTagModal] = useState(false);
  const [tagForm] = Form.useForm();

  useEffect(() => {
    loadData();
    if (id) loadBlog();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (id && content) autoSave();
    }, 30000);
    return () => clearInterval(timer);
  }, [id, content]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [categoriesRes, tagsRes] = await Promise.all([
        axios.get('/api/blog/categories', config),
        axios.get('/api/blog/tags', config)
      ]);
      setCategories(categoriesRes.data.data);
      setTags(tagsRes.data.data);
    } catch (error) {
      message.error('Failed to load data');
    }
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`/api/blog/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('adminToken');
      await axios.patch(`/api/blog/admin/${id}/autosave`, {
        title: form.getFieldValue('title'),
        content
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('adminToken');
      const data = {
        ...values,
        content,
        seo: {
          title: values['seo.title'],
          description: values['seo.description'],
          keywords: values['seo.keywords']?.split(',').map(k => k.trim()),
          focusKeyword: values['seo.focusKeyword']
        }
      };

      if (id) {
        await axios.put(`/api/blog/admin/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Blog updated successfully');
      } else {
        const res = await axios.post('/api/blog/admin', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      const token = localStorage.getItem('adminToken');
      await axios.post(`/api/blog/admin/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Blog published successfully');
      navigate('/admin/blog');
    } catch (error) {
      message.error('Failed to publish blog');
    }
  };

  const generateSEO = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post('/api/blog/admin/seo/generate', {
        title: form.getFieldValue('title'),
        content,
        excerpt: form.getFieldValue('excerpt')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { seo, seoScore: score } = res.data.data;
      form.setFieldsValue({
        'seo.title': seo.title,
        'seo.description': seo.description,
        'seo.keywords': seo.keywords?.join(', '),
        'seo.focusKeyword': seo.focusKeyword
      });
      setSeoScore(score);
      message.success('SEO generated successfully');
    } catch (error) {
      message.error('Failed to generate SEO');
    }
  };

  const handleCreateCategory = async (values) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post('/api/blog/categories/admin', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('adminToken');
      const res = await axios.post('/api/blog/tags/admin', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Tag created');
      setTags([...tags, res.data.data]);
      setTagModal(false);
      tagForm.resetFields();
    } catch (error) {
      message.error('Failed to create tag');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{id ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
        <Space>
          {autoSaving && <Tag color="blue">Auto-saving...</Tag>}
          <Button icon={<EyeOutlined />}>Preview</Button>
          <Button onClick={() => form.submit()} loading={loading} icon={<SaveOutlined />}>Save Draft</Button>
          {id && (
            <Button type="primary" onClick={handlePublish} icon={<SendOutlined />}>Publish</Button>
          )}
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input size="large" placeholder="Enter blog title" />
              </Form.Item>

              <Form.Item name="slug" label="Slug">
                <Input placeholder="auto-generated-from-title" />
              </Form.Item>

              <Form.Item label="Content">
                <TiptapEditor content={content} onChange={setContent} />
              </Form.Item>

              <Form.Item name="excerpt" label="Excerpt">
                <TextArea rows={3} placeholder="Brief description" maxLength={300} showCount />
              </Form.Item>
            </Card>

            <Card title="SEO Settings" className="mt-4" extra={<Button onClick={generateSEO}>Generate SEO</Button>}>
              {seoScore && (
                <div className="mb-4">
                  <Statistic title="SEO Score" value={seoScore.score} suffix="/ 100" />
                  <div className="mt-2">
                    {seoScore.checks?.map((check, i) => (
                      <Tag key={i} color={check.status === 'pass' ? 'green' : 'red'}>{check.name}</Tag>
                    ))}
                  </div>
                </div>
              )}

              <Form.Item name="seo.title" label="SEO Title">
                <Input placeholder="SEO optimized title" maxLength={60} showCount />
              </Form.Item>

              <Form.Item name="seo.description" label="Meta Description">
                <TextArea rows={3} placeholder="SEO meta description" maxLength={160} showCount />
              </Form.Item>

              <Form.Item name="seo.keywords" label="Keywords">
                <Input placeholder="keyword1, keyword2, keyword3" />
              </Form.Item>

              <Form.Item name="seo.focusKeyword" label="Focus Keyword">
                <Input placeholder="Primary keyword" />
              </Form.Item>
            </Card>
          </div>

          <div>
            <Card title="Publish">
              <Form.Item name="status" label="Status" initialValue="draft">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="review">Review</Option>
                  <Option value="published">Published</Option>
                </Select>
              </Form.Item>

              <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="allowComments" label="Allow Comments" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Card>

            <Card title="Categories" className="mt-4" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => setCategoryModal(true)}>New</Button>}>
              <Form.Item name="categories">
                <Select mode="multiple" placeholder="Select categories">
                  {categories.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Card>

            <Card title="Tags" className="mt-4" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => setTagModal(true)}>New</Button>}>
              <Form.Item name="tags">
                <Select mode="multiple" placeholder="Select tags">
                  {tags.map(t => <Option key={t._id} value={t._id}>{t.name}</Option>)}
                </Select>
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>

      <Modal title="Create Category" open={categoryModal} onCancel={() => setCategoryModal(false)} onOk={() => categoryForm.submit()}>
        <Form form={categoryForm} onFinish={handleCreateCategory} layout="vertical">
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Category description" />
          </Form.Item>
          <Form.Item name="color" label="Color" initialValue="#3B82F6">
            <Input type="color" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Create Tag" open={tagModal} onCancel={() => setTagModal(false)} onOk={() => tagForm.submit()}>
        <Form form={tagForm} onFinish={handleCreateTag} layout="vertical">
          <Form.Item name="name" label="Tag Name" rules={[{ required: true }]}>
            <Input placeholder="Enter tag name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Tag description" />
          </Form.Item>
          <Form.Item name="color" label="Color" initialValue="#6B7280">
            <Input type="color" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
