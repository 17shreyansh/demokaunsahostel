import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { pageAPI } from '../services/api';
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

  const pages = [
    { id: 'home', name: 'Home Page' },
    { id: 'about', name: 'About Page' },
    { id: 'contact', name: 'Contact Page' }
  ];

  useEffect(() => {
    fetchPageContent();
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

  const inputClass = `w-full px-3 py-2 border rounded-lg transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const labelClass = `block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const cardClass = `p-6 rounded-xl shadow-lg border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`;
  const titleClass = `text-xl font-bold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`;

  const renderHomeEditor = () => (
    <div className="space-y-8">
      <div className={cardClass}>
        <h3 className={titleClass}>Hero Section</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Main Title</label>
              <input
                type="text"
                value={content.hero?.mainTitle || ''}
                onChange={(e) => updateContent('hero.mainTitle', e.target.value)}
                className={inputClass}
                placeholder="Find Your Perfect"
              />
            </div>
            <div>
              <label className={labelClass}>Location Text</label>
              <input
                type="text"
                value={content.hero?.location || ''}
                onChange={(e) => updateContent('hero.location', e.target.value)}
                className={inputClass}
                placeholder="in Greater Noida"
              />
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border transition-colors ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <label className={labelClass}>Typewriter Animation Texts</label>
              <button
                type="button"
                onClick={() => {
                  const newTexts = [...(content.hero?.typewriterTexts || []), '']
                  updateContent('hero.typewriterTexts', newTexts)
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Add Text
              </button>
            </div>
            <div className="space-y-2">
              {(content.hero?.typewriterTexts || []).map((text, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                      const newTexts = [...(content.hero?.typewriterTexts || [])]
                      newTexts[index] = e.target.value
                      updateContent('hero.typewriterTexts', newTexts)
                    }}
                    placeholder="Enter animation text"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTexts = (content.hero?.typewriterTexts || []).filter((_, i) => i !== index)
                      updateContent('hero.typewriterTexts', newTexts)
                    }}
                    className="px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className={labelClass}>Hero Description</label>
            <textarea
              value={content.hero?.description || ''}
              onChange={(e) => updateContent('hero.description', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Find your perfect nest! Premium hostels with modern amenities..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primary Button Text</label>
              <input
                type="text"
                value={content.hero?.primaryButton?.text || ''}
                onChange={(e) => updateContent('hero.primaryButton.text', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary Button Link</label>
              <input
                type="text"
                value={content.hero?.primaryButton?.link || ''}
                onChange={(e) => updateContent('hero.primaryButton.link', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Search Section</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={content.search?.title || ''}
                onChange={(e) => updateContent('search.title', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={content.search?.subtitle || ''}
                onChange={(e) => updateContent('search.subtitle', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Services Section</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                type="text"
                value={content.services?.title || ''}
                onChange={(e) => updateContent('services.title', e.target.value)}
                className={inputClass}
                placeholder="Amenities & Services"
              />
            </div>
            <div>
              <label className={labelClass}>Section Subtitle</label>
              <input
                type="text"
                value={content.services?.subtitle || ''}
                onChange={(e) => updateContent('services.subtitle', e.target.value)}
                className={inputClass}
                placeholder="Everything you need for comfort"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={labelClass}>Service Items</label>
              <button
                onClick={() => {
                  const newItems = [...(content.services?.items || []), { title: '', description: '', icon: '' }]
                  updateContent('services.items', newItems)
                }}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                + Add Service
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(content.services?.items || []).map((item, index) => (
                <div key={index} className={`border-2 rounded-xl p-4 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-100 bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Service #{index + 1}</span>
                    <button
                      onClick={() => {
                        const newItems = content.services.items.filter((_, i) => i !== index)
                        updateContent('services.items', newItems)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...content.services.items]
                        newItems[index] = { ...newItems[index], title: e.target.value }
                        updateContent('services.items', newItems)
                      }}
                      placeholder="Service Title"
                      className={inputClass}
                    />
                    <select
                      value={item.icon || ''}
                      onChange={(e) => {
                        const newItems = [...content.services.items]
                        newItems[index] = { ...newItems[index], icon: e.target.value }
                        updateContent('services.items', newItems)
                      }}
                      className={inputClass}
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
                    className={`${inputClass} mt-3`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Testimonials Section</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                type="text"
                value={content.testimonials?.title || ''}
                onChange={(e) => updateContent('testimonials.title', e.target.value)}
                className={inputClass}
                placeholder="What Our Residents Say"
              />
            </div>
            <div>
              <label className={labelClass}>Section Subtitle</label>
              <input
                type="text"
                value={content.testimonials?.subtitle || ''}
                onChange={(e) => updateContent('testimonials.subtitle', e.target.value)}
                className={inputClass}
                placeholder="We are proud to be a home away from home"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={labelClass}>Testimonials</label>
              <button
                onClick={() => {
                  const newItems = [...(content.testimonials?.items || []), { name: '', role: '', text: '', rating: 5, image: '' }]
                  updateContent('testimonials.items', newItems)
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
              >
                + Add Testimonial
              </button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {(content.testimonials?.items || []).map((item, index) => (
                <div key={index} className={`border-2 rounded-xl p-4 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-100 bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Testimonial #{index + 1}</span>
                    <button
                      onClick={() => {
                        const newItems = content.testimonials.items.filter((_, i) => i !== index)
                        updateContent('testimonials.items', newItems)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const newItems = [...content.testimonials.items]
                          newItems[index] = { ...newItems[index], name: e.target.value }
                          updateContent('testimonials.items', newItems)
                        }}
                        placeholder="Customer Name"
                        className={inputClass}
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
                        className={inputClass}
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
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [uploadingImages, setUploadingImages] = useState(false);

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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const renderAboutEditor = () => (
    <div className="space-y-8">
      <div className={cardClass}>
        <h3 className={titleClass}>Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Page Title</label>
            <input
              type="text"
              value={content.about?.title || ''}
              onChange={(e) => updateContent('about.title', e.target.value)}
              className={inputClass}
              placeholder="About StayNest"
            />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              type="text"
              value={content.about?.subtitle || ''}
              onChange={(e) => updateContent('about.subtitle', e.target.value)}
              className={inputClass}
              placeholder="Your trusted partner..."
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Statistics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <label className={labelClass}>Statistics</label>
            <button
              onClick={() => {
                const newStats = [...(content.about?.stats || []), { number: '', label: '' }]
                updateContent('about.stats', newStats)
              }}
              className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
            >
              + Add Stat
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(content.about?.stats || []).map((stat, index) => (
              <div key={index} className={`border-2 rounded-xl p-4 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-100 bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Stat #{index + 1}</span>
                  <button
                    onClick={() => {
                      const newStats = content.about.stats.filter((_, i) => i !== index)
                      updateContent('about.stats', newStats)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  value={stat.number || ''}
                  onChange={(e) => {
                    const newStats = [...content.about.stats]
                    newStats[index] = { ...newStats[index], number: e.target.value }
                    updateContent('about.stats', newStats)
                  }}
                  placeholder="500+"
                  className={`${inputClass} mb-2`}
                />
                <input
                  type="text"
                  value={stat.label || ''}
                  onChange={(e) => {
                    const newStats = [...content.about.stats]
                    newStats[index] = { ...newStats[index], label: e.target.value }
                    updateContent('about.stats', newStats)
                  }}
                  placeholder="Happy Students"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Story Section</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Story Title</label>
            <input
              type="text"
              value={content.about?.story?.title || ''}
              onChange={(e) => updateContent('about.story.title', e.target.value)}
              className={inputClass}
              placeholder="Our Story"
            />
          </div>
          <div>
            <label className={labelClass}>Story Content</label>
            <textarea
              value={content.about?.story?.content || ''}
              onChange={(e) => updateContent('about.story.content', e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="StayNest was founded with a vision..."
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Core Values</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <label className={labelClass}>Values List</label>
            <button
              onClick={() => {
                const newValues = [...(content.about?.values || []), { title: '', description: '' }]
                updateContent('about.values', newValues)
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
            >
              + Add Value
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(content.about?.values || []).map((value, index) => (
              <div key={index} className={`border-2 rounded-xl p-4 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-100 bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Value #{index + 1}</span>
                  <button
                    onClick={() => {
                      const newValues = content.about.values.filter((_, i) => i !== index)
                      updateContent('about.values', newValues)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={value.title || ''}
                  onChange={(e) => {
                    const newValues = [...content.about.values]
                    newValues[index] = { ...newValues[index], title: e.target.value }
                    updateContent('about.values', newValues)
                  }}
                  placeholder="Value Title"
                  className={`${inputClass} mb-2`}
                />
                <textarea
                  value={value.description || ''}
                  onChange={(e) => {
                    const newValues = [...content.about.values]
                    newValues[index] = { ...newValues[index], description: e.target.value }
                    updateContent('about.values', newValues)
                  }}
                  placeholder="Value Description"
                  rows={3}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Leadership Section</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                type="text"
                value={content.leadership?.title || ''}
                onChange={(e) => updateContent('leadership.title', e.target.value)}
                className={inputClass}
                placeholder="Leadership Excellence"
              />
            </div>
            <div>
              <label className={labelClass}>Section Subtitle</label>
              <input
                type="text"
                value={content.leadership?.subtitle || ''}
                onChange={(e) => updateContent('leadership.subtitle', e.target.value)}
                className={inputClass}
                placeholder="Meet the visionary..."
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Section Description</label>
            <textarea
              value={content.leadership?.description || ''}
              onChange={(e) => updateContent('leadership.description', e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Our leadership team brings..."
            />
          </div>

          {/* CEO Section */}
          <div className={`border-2 rounded-xl p-6 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-100 bg-white'}`}>
            <h4 className={`text-lg font-semibold mb-4 transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`}>CEO Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={content.leadership?.ceo?.name || ''}
                  onChange={(e) => updateContent('leadership.ceo.name', e.target.value)}
                  className={inputClass}
                  placeholder="CEO Name"
                />
              </div>
              <div>
                <label className={labelClass}>Position</label>
                <input
                  type="text"
                  value={content.leadership?.ceo?.position || ''}
                  onChange={(e) => updateContent('leadership.ceo.position', e.target.value)}
                  className={inputClass}
                  placeholder="CEO & Founder"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Experience</label>
                <input
                  type="text"
                  value={content.leadership?.ceo?.experience || ''}
                  onChange={(e) => updateContent('leadership.ceo.experience', e.target.value)}
                  className={inputClass}
                  placeholder="15+ years in hospitality"
                />
              </div>
              <div>
                <label className={labelClass}>Education</label>
                <input
                  type="text"
                  value={content.leadership?.ceo?.education || ''}
                  onChange={(e) => updateContent('leadership.ceo.education', e.target.value)}
                  className={inputClass}
                  placeholder="MBA from IIM Delhi"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Bio</label>
              <textarea
                value={content.leadership?.ceo?.bio || ''}
                onChange={(e) => updateContent('leadership.ceo.bio', e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="CEO biography..."
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Quote</label>
              <textarea
                value={content.leadership?.ceo?.quote || ''}
                onChange={(e) => updateContent('leadership.ceo.quote', e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Inspirational quote..."
              />
            </div>

            {/* CEO Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>CEO Image 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files, 'ceo_image1')}
                  className={inputClass}
                  disabled={uploadingImages}
                />
                {content.leadership?.ceo?.image1 && (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${content.leadership.ceo.image1}`} 
                    alt="CEO" 
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <label className={labelClass}>CEO Image 2</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files, 'ceo_image2')}
                  className={inputClass}
                  disabled={uploadingImages}
                />
                {content.leadership?.ceo?.image2 && (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${content.leadership.ceo.image2}`} 
                    alt="CEO" 
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>Achievements</label>
                <button
                  type="button"
                  onClick={() => {
                    const newAchievements = [...(content.leadership?.ceo?.achievements || []), '']
                    updateContent('leadership.ceo.achievements', newAchievements)
                  }}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                >
                  + Add Achievement
                </button>
              </div>
              {(content.leadership?.ceo?.achievements || []).map((achievement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => {
                      const newAchievements = [...(content.leadership?.ceo?.achievements || [])]
                      newAchievements[index] = e.target.value
                      updateContent('leadership.ceo.achievements', newAchievements)
                    }}
                    className={`flex-1 ${inputClass}`}
                    placeholder="Achievement description"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newAchievements = (content.leadership?.ceo?.achievements || []).filter((_, i) => i !== index)
                      updateContent('leadership.ceo.achievements', newAchievements)
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className={`border-2 rounded-xl p-6 transition-colors ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-100 bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-lg font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`}>Team Members</h4>
              <button
                type="button"
                onClick={() => {
                  const newTeam = [...(content.leadership?.team || []), { name: '', position: '', bio: '', image: '', linkedin: '', email: '' }]
                  updateContent('leadership.team', newTeam)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                + Add Team Member
              </button>
            </div>
            
            {(content.leadership?.team || []).map((member, index) => (
              <div key={index} className={`border-2 rounded-xl p-4 mb-4 transition-colors ${isDark ? 'border-gray-500 bg-gray-600' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h5 className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`}>Team Member #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => {
                      const newTeam = (content.leadership?.team || []).filter((_, i) => i !== index)
                      updateContent('leadership.team', newTeam)
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={member.name || ''}
                    onChange={(e) => {
                      const newTeam = [...(content.leadership?.team || [])]
                      newTeam[index] = { ...newTeam[index], name: e.target.value }
                      updateContent('leadership.team', newTeam)
                    }}
                    className={inputClass}
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={member.position || ''}
                    onChange={(e) => {
                      const newTeam = [...(content.leadership?.team || [])]
                      newTeam[index] = { ...newTeam[index], position: e.target.value }
                      updateContent('leadership.team', newTeam)
                    }}
                    className={inputClass}
                    placeholder="Position"
                  />
                </div>
                
                <textarea
                  value={member.bio || ''}
                  onChange={(e) => {
                    const newTeam = [...(content.leadership?.team || [])]
                    newTeam[index] = { ...newTeam[index], bio: e.target.value }
                    updateContent('leadership.team', newTeam)
                  }}
                  rows={3}
                  className={`${inputClass} mb-4`}
                  placeholder="Bio"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`${labelClass} text-xs`}>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files, 'team_member', index)}
                      className={inputClass}
                      disabled={uploadingImages}
                    />
                    {member.image && (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${member.image}`} 
                        alt={member.name} 
                        className="mt-2 w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <input
                    type="url"
                    value={member.linkedin || ''}
                    onChange={(e) => {
                      const newTeam = [...(content.leadership?.team || [])]
                      newTeam[index] = { ...newTeam[index], linkedin: e.target.value }
                      updateContent('leadership.team', newTeam)
                    }}
                    className={inputClass}
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => {
                      const newTeam = [...(content.leadership?.team || [])]
                      newTeam[index] = { ...newTeam[index], email: e.target.value }
                      updateContent('leadership.team', newTeam)
                    }}
                    className={inputClass}
                    placeholder="Email"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Mission & Vision</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Mission Title</label>
            <input
              type="text"
              value={content.mission?.title || ''}
              onChange={(e) => updateContent('mission.title', e.target.value)}
              className={`${inputClass} mb-4`}
              placeholder="Our Mission"
            />
            <label className={labelClass}>Mission Content</label>
            <textarea
              value={content.mission?.content || ''}
              onChange={(e) => updateContent('mission.content', e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="To provide safe, comfortable..."
            />
          </div>
          <div>
            <label className={labelClass}>Vision Title</label>
            <input
              type="text"
              value={content.vision?.title || ''}
              onChange={(e) => updateContent('vision.title', e.target.value)}
              className={`${inputClass} mb-4`}
              placeholder="Our Vision"
            />
            <label className={labelClass}>Vision Content</label>
            <textarea
              value={content.vision?.content || ''}
              onChange={(e) => updateContent('vision.content', e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="To be the leading hostel..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactEditor = () => (
    <div className="space-y-8">
      <div className={cardClass}>
        <h3 className={titleClass}>Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Page Title</label>
            <input
              type="text"
              value={content.contact?.title || ''}
              onChange={(e) => updateContent('contact.title', e.target.value)}
              className={inputClass}
              placeholder="Get In Touch"
            />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              type="text"
              value={content.contact?.subtitle || ''}
              onChange={(e) => updateContent('contact.subtitle', e.target.value)}
              className={inputClass}
              placeholder="Have questions? We'd love to hear from you."
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              value={content.contact?.contactInfo?.phone || ''}
              onChange={(e) => updateContent('contact.contactInfo.phone', e.target.value)}
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={content.contact?.contactInfo?.email || ''}
              onChange={(e) => updateContent('contact.contactInfo.email', e.target.value)}
              className={inputClass}
              placeholder="hello@staynest.com"
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea
              value={content.contact?.contactInfo?.address || ''}
              onChange={(e) => updateContent('contact.contactInfo.address', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Main Office, Knowledge Park III, Greater Noida"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Page Content Editor</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className={`flex space-x-4 border-b transition-colors ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedPage === page.id
                  ? isDark 
                    ? 'border-b-2 border-blue-400 text-blue-400'
                    : 'border-b-2 border-blue-600 text-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
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