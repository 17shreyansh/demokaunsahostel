import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { pageAPI } from '../services/api';
import { 
  Save, Loader2, Plus, Trash2, LayoutTemplate, 
  Search, Briefcase, MessageSquareQuote, Users, 
  Target, Contact, Image as ImageIcon, MapPin
} from 'lucide-react';
import { 
  FaHome, FaBed, FaShower, FaWifi, FaUtensils, FaLock, FaTshirt, 
  FaSnowflake, FaCar, FaDumbbell, FaBook, FaGamepad, FaCoffee, 
  FaStore, FaBus, FaHospital, FaBolt, FaTint, FaThermometerHalf, FaPhone 
} from 'react-icons/fa';

const iconMap = {
  FaHome, FaBed, FaShower, FaWifi, FaUtensils, FaLock, FaTshirt,
  FaSnowflake, FaCar, FaDumbbell, FaBook, FaGamepad, FaCoffee,
  FaStore, FaBus, FaHospital, FaBolt, FaTint, FaThermometerHalf, FaPhone
};

const AdminPageContent = () => {
  const { isDark } = useTheme();
  const [selectedPage, setSelectedPage] = useState('home');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const pages = [
    { id: 'home', name: 'Home Page' },
    { id: 'about', name: 'About Page' },
    { id: 'contact', name: 'Contact Page' }
  ];

  useEffect(() => {
    fetchPageContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPage]);

  const fetchPageContent = async () => {
    setLoading(true);
    try {
      const response = await pageAPI.getPageContent(selectedPage);
      setContent(response.data.content || {});
    } catch (error) {
      console.error('Error fetching page content:', error);
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await pageAPI.updatePageContent(selectedPage, { content });
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path, value) => {
    setContent(prev => {
      const newContent = { ...prev };
      const keys = path.split('.');
      let current = newContent;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  const handleImageUpload = async (files, imageType, index = null) => {
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/page-content/about/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Assuming adminToken based on context
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.files && result.files.length > 0) {
        const imagePath = result.files[0].path;
        
        if (imageType === 'ceo_image1') {
          updateContent('leadership.ceo.image1', imagePath);
        } else if (imageType === 'ceo_image2') {
          updateContent('leadership.ceo.image2', imagePath);
        } else if (imageType === 'team_member' && index !== null) {
          const newTeam = [...(content.leadership?.team || [])];
          newTeam[index] = { ...newTeam[index], image: imagePath };
          updateContent('leadership.team', newTeam);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingImages(false);
    }
  };

  // Shared Tailwind Classes
  const inputBase = `w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
    isDark 
      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:bg-black' 
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
  }`;
  const labelBase = `block text-sm font-medium mb-1.5 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const cardBase = `transition-all duration-300 rounded-2xl border shadow-sm overflow-hidden ${
    isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
  }`;
  const cardHeaderBase = `px-6 py-5 border-b flex items-center gap-3 transition-colors ${
    isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'
  }`;

  // Section Wrapper Component
  const FormSection = ({ title, icon: Icon, children }) => (
    <section className={cardBase}>
      <div className={cardHeaderBase}>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
          <Icon size={18} />
        </div>
        <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </section>
  );

  const renderHomeEditor = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <FormSection title="Hero Section" icon={LayoutTemplate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>Main Title</label>
            <input
              type="text"
              value={content.hero?.mainTitle || ''}
              onChange={(e) => updateContent('hero.mainTitle', e.target.value)}
              className={inputBase}
              placeholder="Find Your Perfect"
            />
          </div>
          <div>
            <label className={labelBase}>Location Text</label>
            <input
              type="text"
              value={content.hero?.location || ''}
              onChange={(e) => updateContent('hero.location', e.target.value)}
              className={inputBase}
              placeholder="in Greater Noida"
            />
          </div>
        </div>
        
        <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <label className={`${labelBase} !mb-0`}>Typewriter Animation Texts</label>
          </div>
          <div className="space-y-3">
            {(content.hero?.typewriterTexts || []).map((text, index) => (
              <div key={index} className="flex gap-3 relative group">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    const newTexts = [...(content.hero?.typewriterTexts || [])]
                    newTexts[index] = e.target.value
                    updateContent('hero.typewriterTexts', newTexts)
                  }}
                  placeholder="Enter animation text"
                  className={inputBase}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTexts = (content.hero?.typewriterTexts || []).filter((_, i) => i !== index)
                    updateContent('hero.typewriterTexts', newTexts)
                  }}
                  className={`px-3 flex items-center justify-center rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10' : 'bg-white border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  aria-label="Remove text"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newTexts = [...(content.hero?.typewriterTexts || []), '']
                updateContent('hero.typewriterTexts', newTexts)
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] ${
                isDark ? 'border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
              }`}
            >
              <Plus size={16} /> Add Text
            </button>
          </div>
        </div>
        
        <div>
          <label className={labelBase}>Hero Description</label>
          <textarea
            value={content.hero?.description || ''}
            onChange={(e) => updateContent('hero.description', e.target.value)}
            rows={3}
            className={`${inputBase} resize-none`}
            placeholder="Find your perfect nest! Premium hostels with modern amenities..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>Primary Button Text</label>
            <input
              type="text"
              value={content.hero?.primaryButton?.text || ''}
              onChange={(e) => updateContent('hero.primaryButton.text', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Primary Button Link</label>
            <input
              type="text"
              value={content.hero?.primaryButton?.link || ''}
              onChange={(e) => updateContent('hero.primaryButton.link', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Search Section" icon={Search}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>Title</label>
            <input
              type="text"
              value={content.search?.title || ''}
              onChange={(e) => updateContent('search.title', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Subtitle</label>
            <input
              type="text"
              value={content.search?.subtitle || ''}
              onChange={(e) => updateContent('search.subtitle', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Services Section" icon={Briefcase}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelBase}>Section Title</label>
            <input
              type="text"
              value={content.services?.title || ''}
              onChange={(e) => updateContent('services.title', e.target.value)}
              className={inputBase}
              placeholder="Amenities & Services"
            />
          </div>
          <div>
            <label className={labelBase}>Section Subtitle</label>
            <input
              type="text"
              value={content.services?.subtitle || ''}
              onChange={(e) => updateContent('services.subtitle', e.target.value)}
              className={inputBase}
              placeholder="Everything you need for comfort"
            />
          </div>
        </div>
        
        <div>
          <label className={labelBase}>Service Items</label>
          <div className="space-y-4 mt-2">
            {(content.services?.items || []).map((item, index) => (
              <div key={index} className={`relative rounded-xl p-5 border transition-colors group ${isDark ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                <button
                  type="button"
                  onClick={() => {
                    const newItems = content.services.items.filter((_, i) => i !== index)
                    updateContent('services.items', newItems)
                  }}
                  className={`absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm opacity-0 group-hover:opacity-100 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-rose-400' : 'bg-white border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  aria-label="Remove Service"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => {
                      const newItems = [...content.services.items]
                      newItems[index] = { ...newItems[index], title: e.target.value }
                      updateContent('services.items', newItems)
                    }}
                    placeholder="Service Title"
                    className={inputBase}
                  />
                  <select
                    value={item.icon || ''}
                    onChange={(e) => {
                      const newItems = [...content.services.items]
                      newItems[index] = { ...newItems[index], icon: e.target.value }
                      updateContent('services.items', newItems)
                    }}
                    className={inputBase}
                  >
                    <option value="">Select Icon</option>
                    {Object.keys(iconMap).map(key => (
                      <option key={key} value={key}>{key.replace('Fa', '')}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...content.services.items]
                    newItems[index] = { ...newItems[index], description: e.target.value }
                    updateContent('services.items', newItems)
                  }}
                  placeholder="Service Description"
                  rows={2}
                  className={`${inputBase} resize-none`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = [...(content.services?.items || []), { title: '', description: '', icon: '' }]
                updateContent('services.items', newItems)
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] ${
                isDark ? 'border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
              }`}
            >
              <Plus size={16} /> Add Service
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Testimonials Section" icon={MessageSquareQuote}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelBase}>Section Title</label>
            <input
              type="text"
              value={content.testimonials?.title || ''}
              onChange={(e) => updateContent('testimonials.title', e.target.value)}
              className={inputBase}
              placeholder="What Our Residents Say"
            />
          </div>
          <div>
            <label className={labelBase}>Section Subtitle</label>
            <input
              type="text"
              value={content.testimonials?.subtitle || ''}
              onChange={(e) => updateContent('testimonials.subtitle', e.target.value)}
              className={inputBase}
              placeholder="We are proud to be a home away from home"
            />
          </div>
        </div>
        
        <div>
          <label className={labelBase}>Testimonials List</label>
          <div className="space-y-4 mt-2">
            {(content.testimonials?.items || []).map((item, index) => (
              <div key={index} className={`relative rounded-xl p-5 border transition-colors group ${isDark ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                <button
                  type="button"
                  onClick={() => {
                    const newItems = content.testimonials.items.filter((_, i) => i !== index)
                    updateContent('testimonials.items', newItems)
                  }}
                  className={`absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm opacity-0 group-hover:opacity-100 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-rose-400' : 'bg-white border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  aria-label="Remove Testimonial"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => {
                      const newItems = [...content.testimonials.items]
                      newItems[index] = { ...newItems[index], name: e.target.value }
                      updateContent('testimonials.items', newItems)
                    }}
                    placeholder="Customer Name"
                    className={inputBase}
                  />
                  <input
                    type="text"
                    value={item.role || ''}
                    onChange={(e) => {
                      const newItems = [...content.testimonials.items]
                      newItems[index] = { ...newItems[index], role: e.target.value }
                      updateContent('testimonials.items', newItems)
                    }}
                    placeholder="Role/Position"
                    className={inputBase}
                  />
                </div>
                <textarea
                  value={item.text || ''}
                  onChange={(e) => {
                    const newItems = [...content.testimonials.items]
                    newItems[index] = { ...newItems[index], text: e.target.value }
                    updateContent('testimonials.items', newItems)
                  }}
                  placeholder="Testimonial text..."
                  rows={3}
                  className={`${inputBase} resize-none`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = [...(content.testimonials?.items || []), { name: '', role: '', text: '', rating: 5, image: '' }]
                updateContent('testimonials.items', newItems)
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] ${
                isDark ? 'border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
              }`}
            >
              <Plus size={16} /> Add Testimonial
            </button>
          </div>
        </div>
      </FormSection>
    </div>
  );

  const renderAboutEditor = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <FormSection title="Hero Section" icon={LayoutTemplate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>Page Title</label>
            <input
              type="text"
              value={content.about?.title || ''}
              onChange={(e) => updateContent('about.title', e.target.value)}
              className={inputBase}
              placeholder="About StayNest"
            />
          </div>
          <div>
            <label className={labelBase}>Subtitle</label>
            <input
              type="text"
              value={content.about?.subtitle || ''}
              onChange={(e) => updateContent('about.subtitle', e.target.value)}
              className={inputBase}
              placeholder="Your trusted partner..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Statistics" icon={Target}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(content.about?.stats || []).map((stat, index) => (
            <div key={index} className={`relative rounded-xl p-4 border transition-colors group ${isDark ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
              <button
                onClick={() => {
                  const newStats = content.about.stats.filter((_, i) => i !== index)
                  updateContent('about.stats', newStats)
                }}
                className={`absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm opacity-0 group-hover:opacity-100 ${
                  isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-rose-400' : 'bg-white border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                aria-label="Remove Stat"
              >
                <Trash2 size={14} />
              </button>
              <input
                type="text"
                value={stat.number || ''}
                onChange={(e) => {
                  const newStats = [...content.about.stats]
                  newStats[index] = { ...newStats[index], number: e.target.value }
                  updateContent('about.stats', newStats)
                }}
                placeholder="Value (e.g., 500+)"
                className={`${inputBase} mb-3`}
              />
              <input
                type="text"
                value={stat.label || ''}
                onChange={(e) => {
                  const newStats = [...content.about.stats]
                  newStats[index] = { ...newStats[index], label: e.target.value }
                  updateContent('about.stats', newStats)
                }}
                placeholder="Label (e.g., Happy Students)"
                className={inputBase}
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newStats = [...(content.about?.stats || []), { number: '', label: '' }]
              updateContent('about.stats', newStats)
            }}
            className={`w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-2 border-2 border-dashed font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] ${
              isDark ? 'border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
            }`}
          >
            <Plus size={20} /> Add Stat
          </button>
        </div>
      </FormSection>

      <FormSection title="Story Section" icon={FaBook}>
        <div className="space-y-6">
          <div>
            <label className={labelBase}>Story Title</label>
            <input
              type="text"
              value={content.about?.story?.title || ''}
              onChange={(e) => updateContent('about.story.title', e.target.value)}
              className={inputBase}
              placeholder="Our Story"
            />
          </div>
          <div>
            <label className={labelBase}>Story Content</label>
            <textarea
              value={content.about?.story?.content || ''}
              onChange={(e) => updateContent('about.story.content', e.target.value)}
              rows={5}
              className={`${inputBase} resize-none`}
              placeholder="StayNest was founded with a vision..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Leadership & Team" icon={Users}>
        {/* CEO Details */}
        <div className="mb-8 border-b pb-8" style={{ borderColor: isDark ? '#1f2937' : '#f3f4f6' }}>
          <h4 className={`text-base font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>CEO Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelBase}>Name</label>
              <input
                type="text"
                value={content.leadership?.ceo?.name || ''}
                onChange={(e) => updateContent('leadership.ceo.name', e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>Position</label>
              <input
                type="text"
                value={content.leadership?.ceo?.position || ''}
                onChange={(e) => updateContent('leadership.ceo.position', e.target.value)}
                className={inputBase}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelBase}>Bio</label>
            <textarea
              value={content.leadership?.ceo?.bio || ''}
              onChange={(e) => updateContent('leadership.ceo.bio', e.target.value)}
              rows={3}
              className={`${inputBase} resize-none`}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Image 1</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files, 'ceo_image1')}
                className={`${inputBase} file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                disabled={uploadingImages}
              />
            </div>
            <div>
              <label className={labelBase}>Image 2</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files, 'ceo_image2')}
                className={`${inputBase} file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                disabled={uploadingImages}
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h4 className={`text-base font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Team Members</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(content.leadership?.team || []).map((member, index) => (
              <div key={index} className={`relative rounded-xl p-5 border transition-colors group ${isDark ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                <button
                  type="button"
                  onClick={() => {
                    const newTeam = (content.leadership?.team || []).filter((_, i) => i !== index)
                    updateContent('leadership.team', newTeam)
                  }}
                  className={`absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm opacity-0 group-hover:opacity-100 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-rose-400' : 'bg-white border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  aria-label="Remove Team Member"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={member.name || ''}
                    onChange={(e) => {
                      const newTeam = [...(content.leadership?.team || [])]
                      newTeam[index] = { ...newTeam[index], name: e.target.value }
                      updateContent('leadership.team', newTeam)
                    }}
                    placeholder="Name"
                    className={inputBase}
                  />
                  <input
                    type="text"
                    value={member.position || ''}
                    onChange={(e) => {
                      const newTeam = [...(content.leadership?.team || [])]
                      newTeam[index] = { ...newTeam[index], position: e.target.value }
                      updateContent('leadership.team', newTeam)
                    }}
                    placeholder="Position"
                    className={inputBase}
                  />
                </div>
                <textarea
                  value={member.bio || ''}
                  onChange={(e) => {
                    const newTeam = [...(content.leadership?.team || [])]
                    newTeam[index] = { ...newTeam[index], bio: e.target.value }
                    updateContent('leadership.team', newTeam)
                  }}
                  rows={2}
                  placeholder="Short Bio"
                  className={`${inputBase} mb-3 resize-none`}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files, 'team_member', index)}
                  className={`${inputBase} file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                  disabled={uploadingImages}
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newTeam = [...(content.leadership?.team || []), { name: '', position: '', bio: '', image: '', linkedin: '', email: '' }]
                updateContent('leadership.team', newTeam)
              }}
              className={`w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2 border-2 border-dashed font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] ${
                isDark ? 'border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
              }`}
            >
              <Plus size={20} /> Add Team Member
            </button>
          </div>
        </div>
      </FormSection>
    </div>
  );

  const renderContactEditor = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <FormSection title="Header Configuration" icon={Contact}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>Page Title</label>
            <input
              type="text"
              value={content.contact?.title || ''}
              onChange={(e) => updateContent('contact.title', e.target.value)}
              className={inputBase}
              placeholder="Get In Touch"
            />
          </div>
          <div>
            <label className={labelBase}>Subtitle</label>
            <input
              type="text"
              value={content.contact?.subtitle || ''}
              onChange={(e) => updateContent('contact.subtitle', e.target.value)}
              className={inputBase}
              placeholder="Have questions? We'd love to hear from you."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact Information" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelBase}>Support Phone</label>
            <input
              type="text"
              value={content.contact?.contactInfo?.phone || ''}
              onChange={(e) => updateContent('contact.contactInfo.phone', e.target.value)}
              className={inputBase}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className={labelBase}>Support Email</label>
            <input
              type="email"
              value={content.contact?.contactInfo?.email || ''}
              onChange={(e) => updateContent('contact.contactInfo.email', e.target.value)}
              className={inputBase}
              placeholder="hello@staynest.com"
            />
          </div>
          <div>
            <label className={labelBase}>Headquarters Address</label>
            <textarea
              value={content.contact?.contactInfo?.address || ''}
              onChange={(e) => updateContent('contact.contactInfo.address', e.target.value)}
              rows={2}
              className={`${inputBase} resize-none`}
              placeholder="Main Office, Knowledge Park III..."
            />
          </div>
        </div>
      </FormSection>
    </div>
  );

  return (
    <div className={`transition-colors duration-300 min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto font-sans ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 pb-4 mb-8 border-b  transition-colors ${isDark ? 'border-gray-800 bg-[#0A0A0A]/80' : 'border-gray-200 bg-[#FAFAFA]/80'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight transition-colors mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Content Management System
            </h1>
            <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Edit text, images, and layout blocks for your static pages.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] shadow-sm disabled:opacity-50 flex-shrink-0 w-full sm:w-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving Content...' : 'Save All Changes'}
          </button>
        </div>

        {/* Segmented Control Navigation */}
        <div className="mt-6 flex overflow-x-auto no-scrollbar">
          <div className={`inline-flex p-1 rounded-lg border transition-colors ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100/80 border-gray-200/60'
          }`}>
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={`flex items-center px-5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
                  selectedPage === page.id
                    ? (isDark ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10' : 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5')
                    : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                {page.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading page content...</p>
          </div>
        ) : (
          <div className="pb-12">
            {selectedPage === 'home' && renderHomeEditor()}
            {selectedPage === 'about' && renderAboutEditor()}
            {selectedPage === 'contact' && renderContactEditor()}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminPageContent;