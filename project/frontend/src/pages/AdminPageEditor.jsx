import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { pageAPI } from '../services/pageAPI';

const AdminPageEditor = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';
  
  const [page, setPage] = useState({
    title: '',
    slug: '',
    metaDescription: '',
    status: 'published',
    sections: [],
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section', fields: ['title', 'subtitle', 'content', 'buttonText', 'buttonLink', 'image'] },
    { value: 'search', label: 'Search Section', fields: ['title', 'subtitle'] },
    { value: 'services', label: 'Services Section', fields: ['title', 'subtitle'] },
    { value: 'testimonials', label: 'Testimonials Section', fields: ['title', 'subtitle'] },
    { value: 'about', label: 'About Section', fields: ['title', 'content'] },
    { value: 'contact', label: 'Contact Section', fields: ['title', 'subtitle', 'content'] },
    { value: 'featured_hostels', label: 'Featured Hostels', fields: ['title', 'subtitle'] },
    { value: 'text', label: 'Text Block', fields: ['title', 'content'] },
    { value: 'image', label: 'Image Block', fields: ['title', 'image', 'content'] },
    { value: 'cta', label: 'Call to Action', fields: ['title', 'content', 'buttonText', 'buttonLink', 'backgroundColor'] }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchPage();
    }
  }, [id, isEdit]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const response = await pageAPI.getAllPages();
      const foundPage = response.data.find(p => p._id === id);
      if (foundPage) {
        setPage(foundPage);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await pageAPI.updatePage(id, page);
      } else {
        await pageAPI.createPage(page);
      }
      navigate('/admin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setPage(prev => ({
      ...prev,
      sections: [...prev.sections, {
        type: 'text',
        title: '',
        subtitle: '',
        content: '',
        image: '',
        buttonText: '',
        buttonLink: '',
        backgroundColor: '',
        textColor: '',
        order: prev.sections.length,
        visible: true,
        settings: {}
      }]
    }));
  };

  const updateSection = (index, field, value) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (index) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (index, direction) => {
    const newSections = [...page.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      setPage(prev => ({ ...prev, sections: newSections }));
    }
  };

  const getSectionFields = (type) => {
    const sectionType = sectionTypes.find(st => st.value === type);
    return sectionType ? sectionType.fields : ['title', 'content'];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'Edit Page' : 'Create New Page'}
          </h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/admin/pages')}
              className={`px-4 py-2 rounded-lg border transition-colors ${isDark ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>

        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6 space-y-6`}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Page Title</label>
              <input
                type="text"
                value={page.title}
                onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Slug</label>
              <input
                type="text"
                value={page.slug}
                onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Meta Description</label>
            <textarea
              value={page.metaDescription}
              onChange={(e) => setPage(prev => ({ ...prev, metaDescription: e.target.value }))}
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Status</label>
            <select
              value={page.status}
              onChange={(e) => setPage(prev => ({ ...prev, status: e.target.value }))}
              className={`px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Sections */}
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Page Sections</h2>
            <button
              onClick={addSection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Section
            </button>
          </div>

          <div className="space-y-4">
            {page.sections.map((section, index) => (
              <div key={index} className={`border rounded-lg p-4 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <select
                      value={section.type}
                      onChange={(e) => updateSection(index, 'type', e.target.value)}
                      className={`px-3 py-1 border rounded text-sm transition-colors ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {sectionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <label className={`flex items-center transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={(e) => updateSection(index, 'visible', e.target.checked)}
                        className="mr-1"
                      />
                      Visible
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 disabled:opacity-50 transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === page.sections.length - 1}
                      className={`p-1 disabled:opacity-50 transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeSection(index)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSectionFields(section.type).map(field => (
                    <div key={field} className={field === 'content' ? 'md:col-span-2' : ''}>
                      <label className={`block text-sm font-medium mb-1 capitalize transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {field === 'content' ? (
                        <textarea
                          value={section[field] || ''}
                          onChange={(e) => updateSection(index, field, e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded transition-colors ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={section[field] || ''}
                          onChange={(e) => updateSection(index, field, e.target.value)}
                          className={`w-full px-3 py-2 border rounded transition-colors ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
          <h2 className={`text-lg font-semibold mb-4 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>SEO Title</label>
              <input
                type="text"
                value={page.seo.title}
                onChange={(e) => setPage(prev => ({ 
                  ...prev, 
                  seo: { ...prev.seo, title: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>SEO Description</label>
              <textarea
                value={page.seo.description}
                onChange={(e) => setPage(prev => ({ 
                  ...prev, 
                  seo: { ...prev.seo, description: e.target.value }
                }))}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageEditor;