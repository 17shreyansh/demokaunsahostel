import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { FiSave, FiX, FiUpload, FiCheck } from 'react-icons/fi';

// Amenities options
const AMENITIES_OPTIONS = [
  // Food & Meal Services
  { label: '4 Time Meal', value: '4 Time Meal' },
  { label: 'Lunch Deliver to college', value: 'Lunch Deliver to college' },
  
  // Basic Services
  { label: 'Laundry', value: 'Laundry' },
  { label: 'WiFi', value: 'wifi' },
  { label: 'Housekeeping', value: 'Housekeeping' },
  { label: 'Gym', value: 'Gym' },
  { label: 'Transportation', value: 'Transportation' },
  
  // Common Areas
  { label: 'DIning/Mess Area', value: 'DIning/Mess Area' },
  { label: 'Terrace Access', value: 'Terrace Access' },
  { label: 'Indoor games', value: 'indoor games' },
  { label: 'Outdoor games', value: 'Outdoor games' },
  
  // Furniture
  { label: 'Bed with storage', value: 'Bed with storage' },
  { label: 'Bed without Storage', value: 'Bed without Storage' },
  { label: 'Wardrobe/Almirah', value: 'Wardrobe/Almirah' },
  { label: 'AC', value: 'AC' },
  { label: 'Cooler', value: 'Cooler' },
  { label: 'Fan', value: 'Fan' },
  { label: 'Study Table', value: 'Study Table' },
  { label: 'Chair', value: 'Chair' },
  { label: 'Mirror', value: 'Mirror' },
  { label: 'Curtain', value: 'Curtain' },
  
  // Appliances & Utilities
  { label: 'Watercooler', value: 'Watercooler' },
  { label: 'Common Washing Machine', value: 'Common Washing Machine' },
  { label: 'Common Fridge', value: 'Common Fridge' },
  { label: 'Common Induction', value: 'Common Induction' },
  { label: 'Geyser', value: 'Geyser' },
  
  // Balcony & Bathroom
  { label: 'Attached Balcony', value: 'Attached Balcony' },
  { label: 'Common Balcony', value: 'Common Balcony' },
  { label: 'Attached washroom', value: 'Attached washroom' },
  { label: 'Common/Shared washroom', value: 'Common/Shared washroom' },
  { label: 'Indian Toilet', value: 'Indian Toilet' },
  { label: 'Western Toilet', value: 'Western Toilet' },
  
  // Security & Safety
  { label: 'Visitor Management', value: 'Visitor Management' },
  { label: 'First AId Kit', value: 'First AId Kit' },
  { label: 'Fire Safety/ Extinguisher', value: 'Fire Safety/ Extinguisher' },
  { label: 'Warden', value: 'Warden' },
  { label: 'Security Guard', value: 'Security Guard' },
  { label: 'Elevator/Lift', value: 'Elevator/Lift' },
  { label: 'Power Backup', value: 'Power Backup' },
  { label: 'CCTV Surveillance', value: 'CCTV Surveillance' },
  
  // Additional Facilities
  { label: 'Study Room / Library', value: 'Study Room / Library' },
  { label: 'Two wheeler Parking', value: 'Two wheeler Parking' },
  { label: 'Four wheeler Parking', value: 'Four wheeler Parking' },
  { label: 'Vending Machine', value: 'Vending Machine' },
]

const HostelManagerHostelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', location: '', address: '', price: '', priceType: 'month', sessionPrice: '',
    amenities: [], rules: '', gender: 'Co-ed', type: 'PG', availableBeds: '', securityDeposit: '',
    capacity: '', checkIn: '', contactPersonName: '', jobTitle: '', phone: '', videoTourUrl: '',
    availability: 'Available', rating: '', verified: false, coordinates: '',
    info: [{ title: '', value: '' }],
    roomTypes: [{ name: '', description: '' }],
    reviews: [{ name: '', rating: '', comment: '', date: '' }]
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

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
        sessionPrice: h.sessionPrice || '', amenities: h.amenities || [],
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
      if (key === 'amenities') {
        data.append(key, JSON.stringify(formData[key]));
      } else if (key === 'rules') {
        const items = formData[key].split(',').map(a => a.trim()).filter(Boolean);
        data.append(key, JSON.stringify(items));
      } else if (key === 'info') {
        const validInfo = formData[key].filter(i => i.title && i.value);
        data.append(key, JSON.stringify(validInfo));
      } else if (key === 'roomTypes') {
        const validRooms = formData[key].filter(r => r.name);
        data.append(key, JSON.stringify(validRooms));
      } else if (key === 'coordinates' && formData[key]) {
        const [lat, lng] = formData[key].split(',').map(c => c.trim());
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          data.append('mapCoordinates', JSON.stringify({lat: parseFloat(lat), lng: parseFloat(lng)}));
        }
      } else if (formData[key] && key !== 'reviews') {
        data.append(key, formData[key]);
      }
    });

    // Add new images
    images.forEach(img => data.append('images', img));

    // Add profile image
    if (profileImage) {
      data.append('profileImage', profileImage);
    }

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

              <div>
                <label className="block text-sm font-medium mb-1">Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">Upload contact person photo</p>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-teal-100 text-teal-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">5</span>
              Map Location
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">Coordinates (Latitude, Longitude)</label>
              <input type="text" value={formData.coordinates} onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="28.464385, 77.499399" />
              <p className="text-xs text-gray-500 mt-1">Get coordinates from Google Maps (right-click on map)</p>
            </div>
          </div>

          {/* Room Types */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-cyan-100 text-cyan-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">6</span>
              Room Types
            </h3>
            <div className="space-y-3">
              {formData.roomTypes.map((room, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-gray-50">
                  <input type="text" value={room.name} onChange={(e) => {
                    const updated = [...formData.roomTypes];
                    updated[idx].name = e.target.value;
                    setFormData({ ...formData, roomTypes: updated });
                  }} className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Room type (e.g., Single)" />
                  <div className="flex gap-2">
                    <input type="text" value={room.description} onChange={(e) => {
                      const updated = [...formData.roomTypes];
                      updated[idx].description = e.target.value;
                      setFormData({ ...formData, roomTypes: updated });
                    }} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Description" />
                    <button type="button" onClick={() => setFormData({ ...formData, roomTypes: formData.roomTypes.filter((_, i) => i !== idx) })} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">✕</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setFormData({ ...formData, roomTypes: [...formData.roomTypes, { name: '', description: '' }] })} className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors">+ Add Room Type</button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-lime-100 text-lime-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">7</span>
              Additional Information
            </h3>
            <div className="space-y-3">
              {formData.info.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-gray-50">
                  <input type="text" value={item.title} onChange={(e) => {
                    const updated = [...formData.info];
                    updated[idx].title = e.target.value;
                    setFormData({ ...formData, info: updated });
                  }} className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Title (e.g., Notice Period)" />
                  <div className="flex gap-2">
                    <input type="text" value={item.value} onChange={(e) => {
                      const updated = [...formData.info];
                      updated[idx].value = e.target.value;
                      setFormData({ ...formData, info: updated });
                    }} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Value (e.g., 1 month)" />
                    <button type="button" onClick={() => setFormData({ ...formData, info: formData.info.filter((_, i) => i !== idx) })} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">✕</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setFormData({ ...formData, info: [...formData.info, { title: '', value: '' }] })} className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors">+ Add Information</button>
            </div>
          </div>

          {/* Amenities & Rules */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">8</span>
              Amenities & Rules
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Select Amenities</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <label key={amenity.value} className="flex items-start space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, amenities: [...formData.amenities, amenity.value] })
                          } else {
                            setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity.value) })
                          }
                        }}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm select-none">{amenity.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.amenities.length} amenities selected
                </p>
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
              <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center mr-2 text-sm">9</span>
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
