import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiSave, FiX, FiUpload, FiCheck } from 'react-icons/fi';

const HostelManagerHostelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', location: '', address: '', price: '', priceType: 'month', sessionPrice: '',
    amenities: '', rules: '', gender: 'Co-ed', type: 'PG', availableBeds: '', securityDeposit: '',
    capacity: '', checkIn: '', contactPersonName: '', jobTitle: '', phone: '', videoTourUrl: '',
    availability: 'Available', rating: ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (id) fetchHostel();
  }, [id]);

  const fetchHostel = async () => {
    try {
      const res = await axios.get(`/api/hostels/${id}`);
      const h = res.data;
      setFormData({
        name: h.name || '', description: h.description || '', location: h.location || '',
        address: h.contactInfo?.address || '', price: h.price || '', priceType: h.priceType || 'month',
        sessionPrice: h.sessionPrice || '', amenities: h.amenities?.join(', ') || '',
        rules: h.rules?.join(', ') || '', gender: h.gender || 'Co-ed', type: h.type || 'PG',
        availableBeds: h.availableBeds || '', securityDeposit: h.securityDeposit || '',
        capacity: h.capacity || '', checkIn: h.checkIn || '',
        contactPersonName: h.contactInfo?.contactPersonName || '', jobTitle: h.contactInfo?.jobTitle || '',
        phone: h.contactInfo?.phone || '', videoTourUrl: h.videoTourUrl || '',
        availability: h.availability || 'Available', rating: h.rating || ''
      });
      setExistingImages(h.images || []);
    } catch (error) {
      alert('Failed to load hostel');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (['amenities', 'rules'].includes(key)) {
        const items = formData[key].split(',').map(a => a.trim()).filter(Boolean);
        data.append(key, JSON.stringify(items));
      } else if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    // Add new images
    images.forEach(img => data.append('images', img));

    try {
      if (id) {
        await axios.put(`/api/hostel-manager/hostels/${id}`, data, { 
          withCredentials: true, 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        alert('Hostel updated successfully');
      } else {
        await axios.post('/api/hostel-manager/hostels', data, { 
          withCredentials: true, 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        alert('Hostel added successfully');
      }
      navigate('/hostel-manager/hostels');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save hostel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostelManagerLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{id ? '✏️ Edit' : '🏠 Add'} Hostel</h2>
          <p className="text-gray-600 mt-1">Fill in the details to create an amazing hostel listing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">1</span>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hostel Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter hostel name" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="City or area" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Full Address</label>
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="2" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Complete address with landmarks"></textarea>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe your hostel"></textarea>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">2</span>
              Pricing & Availability
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price Type *</label>
                <select value={formData.priceType} onChange={(e) => setFormData({ ...formData, priceType: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="month">Per Month</option>
                  <option value="session">Per Session</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.priceType === 'month' ? 'Monthly Price *' : 'Session Price *'}
                </label>
                <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="₹" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.priceType === 'month' ? 'Session Price' : 'Monthly Price'}
                </label>
                <input type="number" value={formData.sessionPrice} onChange={(e) => setFormData({ ...formData, sessionPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="₹ (optional)" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Availability *</label>
                <select value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Available">Available</option>
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.0 - 5.0" />
              </div>
            </div>
          </div>

          {/* Hostel Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">3</span>
              Hostel Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="PG">PG</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Apartment">Apartment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Available Beds</label>
                <input type="number" value={formData.availableBeds} onChange={(e) => setFormData({ ...formData, availableBeds: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 20" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Security Deposit</label>
                <input type="number" value={formData.securityDeposit} onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="₹" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input type="text" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 50+ Students" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Check-in Time</label>
                <input type="text" value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Flexible timing" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">4</span>
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person Name</label>
                <input type="text" value={formData.contactPersonName} onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., John Doe" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Property Manager" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+91 9876543210" />
              </div>
            </div>
          </div>

          {/* Amenities & Rules */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">5</span>
              Amenities & Rules
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amenities (comma-separated)</label>
                <input type="text" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="WiFi, AC, Meals, Laundry, Security" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rules (comma-separated)</label>
                <input type="text" value={formData.rules} onChange={(e) => setFormData({ ...formData, rules: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="No smoking, No pets, Quiet hours 10 PM" />
              </div>
            </div>
          </div>

          {/* Images & Video */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">6</span>
              Images & Video Tour
            </h3>
            
            {existingImages.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Images</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {existingImages.map((img, idx) => (
                    <img key={idx} src={`${import.meta.env.VITE_BACKEND_URL || ''}/uploads/${img}`} alt="Hostel" className="w-full h-20 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Upload Images {!id && '*'}</label>
              <input type="file" multiple accept="image/*" required={!id} onChange={(e) => setImages(Array.from(e.target.files))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">Upload multiple images (JPG, PNG, WebP). Max 10 images.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">YouTube Video URL</label>
              <input type="url" value={formData.videoTourUrl} onChange={(e) => setFormData({ ...formData, videoTourUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-xs text-gray-500 mt-1">Add a YouTube video tour link (optional)</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors">
              {loading ? 'Saving...' : id ? 'Update Hostel' : 'Add Hostel'}
            </button>
            <button type="button" onClick={() => navigate('/hostel-manager/hostels')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerHostelForm;
