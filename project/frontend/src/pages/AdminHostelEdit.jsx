import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, Upload, message,
  InputNumber, DatePicker, Checkbox, Dropdown, Space, Button, Divider
} from 'antd';
import dayjs from 'dayjs';
import {
  Save, ArrowLeft, UploadCloud, Plus,
  Trash2, MapPin, Info, Layout, LayoutTemplate,
  Image as ImageIcon, Star, Loader2, DollarSign, Percent
} from 'lucide-react';
import { hostelAPI, installmentTemplateAPI, cityAPI } from '../services/api';
import { invalidateData } from '../utils/stateManager';
import { forceRefresh } from '../utils/cacheManager';
import NearbyPlacesSelector from '../components/NearbyPlacesSelector.jsx';
import imageCompression from 'browser-image-compression';

const { TextArea } = Input;

/* -------------------------------------------------------------------------- */
/* STATIC DATA                                                                */
/* -------------------------------------------------------------------------- */

const AMENITIES_OPTIONS = [
  { label: '4 Time Meal', value: '4 Time Meal' },
  { label: 'Lunch Deliver to college', value: 'Lunch Deliver to college' },
  { label: 'Laundry', value: 'Laundry' },
  { label: 'WiFi', value: 'wifi' },
  { label: 'Housekeeping', value: 'Housekeeping' },
  { label: 'Gym', value: 'Gym' },
  { label: 'Transportation', value: 'Transportation' },
  { label: 'Dining/Mess Area', value: 'DIning/Mess Area' },
  { label: 'Terrace Access', value: 'Terrace Access' },
  { label: 'Indoor games', value: 'indoor games' },
  { label: 'Outdoor games', value: 'Outdoor games' },
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
  { label: 'Watercooler', value: 'Watercooler' },
  { label: 'Common Washing Machine', value: 'Common Washing Machine' },
  { label: 'Common Fridge', value: 'Common Fridge' },
  { label: 'Common Induction', value: 'Common Induction' },
  { label: 'Geyser', value: 'Geyser' },
  { label: 'Attached Balcony', value: 'Attached Balcony' },
  { label: 'Common Balcony', value: 'Common Balcony' },
  { label: 'Attached washroom', value: 'Attached washroom' },
  { label: 'Common/Shared washroom', value: 'Common/Shared washroom' },
  { label: 'Indian Toilet', value: 'Indian Toilet' },
  { label: 'Western Toilet', value: 'Western Toilet' },
  { label: 'Visitor Management', value: 'Visitor Management' },
  { label: 'First Aid Kit', value: 'First AId Kit' },
  { label: 'Fire Safety/ Extinguisher', value: 'Fire Safety/ Extinguisher' },
  { label: 'Warden', value: 'Warden' },
  { label: 'Security Guard', value: 'Security Guard' },
  { label: 'Elevator/Lift', value: 'Elevator/Lift' },
  { label: 'Power Backup', value: 'Power Backup' },
  { label: 'CCTV Surveillance', value: 'CCTV Surveillance' },
  { label: 'Study Room / Library', value: 'Study Room / Library' },
  { label: 'Two wheeler Parking', value: 'Two wheeler Parking' },
  { label: 'Four wheeler Parking', value: 'Four wheeler Parking' },
  { label: 'Vending Machine', value: 'Vending Machine' },
];

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const AmenitiesCheckbox = memo(({ value = [], onChange }) => (
  <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200 max-h-[300px] overflow-y-auto custom-scrollbar">
    <Checkbox.Group value={value} onChange={onChange} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
        {AMENITIES_OPTIONS.map((amenity) => (
          <Checkbox value={amenity.value} key={amenity.value} className="flex items-center m-0">
            <span className="text-sm font-medium text-gray-700 ml-1">{amenity.label}</span>
          </Checkbox>
        ))}
      </div>
    </Checkbox.Group>
  </div>
));
AmenitiesCheckbox.displayName = 'AmenitiesCheckbox';

const MemoizedMapPreview = memo(({ coordinates }) => {
  if (!coordinates || !coordinates.includes(',')) {
    return (
      <div className="w-full h-[280px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <MapPin size={32} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">Enter coordinates to preview map</span>
      </div>
    );
  }

  const [lat, lng] = coordinates.split(',').map(c => c.trim());
  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <div className="w-full h-[280px] rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50 relative group">
      <iframe
        title="Location Preview"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`http://googleusercontent.com/maps.google.com/5${lat},${lng}&hl=en&z=15&output=embed`}
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 transition-opacity duration-300"
      />
    </div>
  );
});
MemoizedMapPreview.displayName = 'MemoizedMapPreview';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const AdminHostelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });
  const [templateOptions, setTemplateOptions] = useState([]);
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState('');

  const rawCoordinates = Form.useWatch('coordinates', form);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await installmentTemplateAPI.getAll();
        setTemplateOptions(res.data);
      } catch (error) {
        console.error('Failed to fetch installment templates:', error);
      }
      try {
        const res = await cityAPI.getAll();
        setCities(res.data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchHostel = async () => {
      if (!id || id === 'new') {
        setLoading(false);
        return;
      }

      try {
        const response = await hostelAPI.getById(id);
        const data = response.data;

        form.setFieldsValue({
          name: data.name || '',
          city: data.city || 'Greater Noida',
          location: data.location || '',
          description: data.description || '',
          price: data.price || 0,
          priceType: data.priceType || 'month',
          sessionPrice: data.sessionPrice || 0,
          availability: data.availability || 'Available',
          rating: data.rating || 0,
          type: data.type || 'PG',
          gender: data.gender || 'Co-ed',
          foodType: data.foodType || 'Veg',
          availableBeds: data.availableBeds || data.availableRooms || 0,
          securityDeposit: data.securityDeposit || 0,
          capacity: data.capacity || '',
          checkIn: data.checkIn || '',
          verified: data.verified === 'true' || data.verified === true,
          amenities: data.amenities || [],
          rules: data.rules || [],
          info: data.info?.length > 0 ? data.info : [{ title: '', value: '' }],
          nearbyPlaces: data.nearbyPlaces || {},
          sharingTypes: data.sharingTypes?.length > 0 ? data.sharingTypes : [],
          installmentPlans: data.installmentPlans || [],
          roomTypes: data.roomTypes?.length > 0 ? data.roomTypes : [{ name: '', description: '' }],
          reviews: data.reviews?.map(review => ({
            ...review,
            reviewDate: review.date ? dayjs(review.date) : null
          })) || [],
          address: data.contactInfo?.address || '',
          contactPersonName: data.contactInfo?.contactPersonName || '',
          jobTitle: data.contactInfo?.jobTitle || '',
          phone: data.contactInfo?.phone || '',
          coordinates: data.mapCoordinates ? `${data.mapCoordinates.lat}, ${data.mapCoordinates.lng}` : '',
          videoTourUrl: data.videoTourUrl || '',
          paymentDetails: data.paymentDetails || { upiId: '', qrCode: '', paymentInstructions: '' },
          reservationEnabled: data.reservationEnabled === true,
          reservationAmount: data.reservationAmount ? Number(data.reservationAmount) : 0
        });

        if (data.mapCoordinates) setMapCoordinates(data.mapCoordinates);

        if (data.images) {
          setFileList(data.images.map((img, index) => ({
            uid: `existing-${index}`,
            name: img,
            status: 'done',
            url: `${import.meta.env.VITE_UPLOADS_BASE_URL}/${img}`,
            isExisting: true
          })));
        }

        if (data.contactInfo?.profileImage) {
          setProfileImage({
            uid: 'profile-existing',
            name: data.contactInfo.profileImage,
            status: 'done',
            url: `${import.meta.env.VITE_UPLOADS_BASE_URL}/${data.contactInfo.profileImage}`,
            isExisting: true
          });
        }
      } catch (error) {
        message.error('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };

    fetchHostel();
  }, [id, form]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName) return;
    try {
      const res = await cityAPI.create({ name: newCityName });
      setCities([...cities, res.data]);
      form.setFieldValue('city', res.data.name);
      setNewCityName('');
      message.success('City added successfully');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add city');
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const hideLoading = message.loading('Saving property configuration...', 0);

    try {
      const formData = new FormData();

      ['amenities', 'rules', 'nearbyPlaces'].forEach(key => {
        formData.append(key, JSON.stringify(values[key] || (key === 'nearbyPlaces' ? {} : [])));
      });

      formData.append('info', JSON.stringify(values.info?.filter(i => i.title && i.value) || []));
      formData.append('roomTypes', JSON.stringify(values.roomTypes?.filter(r => r.name) || []));
      formData.append('sharingTypes', JSON.stringify(
        (values.sharingTypes || []).filter(s => s.name && s.price > 0).map(s => ({
          name: s.name,
          price: Number(s.price),
          priceType: s.priceType || 'month',
          available: Number(s.available) || 0
        }))
      ));
      formData.append('installmentPlans', JSON.stringify(
        (values.installmentPlans || []).filter(p => p.name && p.type && p.installments?.length > 0)
      ));
      formData.append('reviews', JSON.stringify(values.reviews?.filter(r => r.name && r.comment).map(r => ({
        ...r, date: r.reviewDate ? r.reviewDate.format('YYYY-MM-DD') : r.date
      })) || []));

      if (values.coordinates) {
        const coords = values.coordinates.split(',').map(c => c.trim());
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          formData.append('mapCoordinates', JSON.stringify({ lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) }));
        }
      } else if (mapCoordinates?.lat) {
        formData.append('mapCoordinates', JSON.stringify(mapCoordinates));
      }

      Object.keys(values).forEach(key => {
        if (!['amenities', 'rules', 'info', 'nearbyPlaces', 'coordinates', 'roomTypes', 'sharingTypes', 'installmentPlans', 'reviews', 'paymentDetails', 'reservationEnabled', 'reservationAmount'].includes(key) && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      // Payment settings
      if (values.paymentDetails) {
        formData.append('paymentDetails', JSON.stringify(values.paymentDetails));
      }

      // Reservation settings - explicitly handle boolean and number
      const reservationEnabled = values.reservationEnabled === true;
      formData.append('reservationEnabled', reservationEnabled.toString());

      const reservationAmount = Number(values.reservationAmount) || 0;
      formData.append('reservationAmount', reservationAmount.toString());

      console.log('Saving reservation settings:', { reservationEnabled, reservationAmount });

      console.log('Saving reservation settings:', { reservationEnabled, reservationAmount });

      // Images are now uploaded immediately via customRequest, so they all have status === 'done' and a 'name'
      const keepImages = fileList.filter(file => file.status === 'done' && file.name);
      
      console.log('--- DEBUG IMAGE SAVE ---');
      console.log('Total fileList:', fileList);
      console.log('Filtered keepImages:', keepImages);

      if (profileImage?.originFileObj && profileImage.status !== 'done') {
        formData.append('profileImage', profileImage.originFileObj);
      } else if (profileImage?.isExisting) {
        formData.append('existingProfileImage', profileImage.name);
      }

      const finalImagesStr = JSON.stringify(keepImages.map(f => f.name));
      console.log('Final images string sent to backend:', finalImagesStr);
      formData.append('finalImages', finalImagesStr);

      if (id && id !== 'new') {
        await hostelAPI.update(id, formData);
        message.success('Property updated successfully');
      } else {
        await hostelAPI.create(formData);
        message.success('Property created successfully');
      }

      forceRefresh();
      hostelAPI.clearCache();
      invalidateData('hostels');
      invalidateData('homepage');
      invalidateData('dashboard');

      navigate('/admin/hostels', { replace: true });
    } catch (error) {
      message.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      hideLoading();
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading property details...</p>
      </div>
    );
  }

  // Common Section Container Component
  const FormSection = ({ title, icon: Icon, children, className = "" }) => (
    <section className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
          <Icon size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );

  return (
    <div className="pb-16 bg-[#FAFAFA] min-h-screen font-sans text-gray-900">

      {/* Sticky Enterprise Header */}
      <header className="sticky top-0 z-40 bg-white/80  border-b border-gray-200 px-4 sm:px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/hostels')}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 m-0">
                {id === 'new' ? 'Add New Property' : 'Edit Property Configuration'}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">Manage listing details, rules, and media.</p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <button
              onClick={() => navigate('/admin/hostels')}
              disabled={submitting}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={() => form.submit()}
              disabled={submitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Configuration
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <Form
          id="hostel-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
          // Advanced Tailwind injected styling to force Antd components to look modern
          className="space-y-8 [&_.ant-form-item-label>label]:font-medium [&_.ant-form-item-label>label]:text-gray-700 [&_.ant-input]:rounded-lg [&_.ant-select-selector]:rounded-lg [&_.ant-input-number]:rounded-lg [&_.ant-input]:border-gray-300 [&_.ant-select-selector]:border-gray-300 [&_.ant-picker]:rounded-lg [&_.ant-picker]:border-gray-300"
        >

          {/* Section 1: Basic Information */}
          <FormSection title="Basic Information" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
              <Form.Item name="name" label="Property Name" rules={[{ required: true, message: 'Property name is required' }]}>
                <Input size="large" placeholder="e.g., Sunrise Student Living" className="hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20" />
              </Form.Item>
              <Form.Item name="city" label="City" rules={[{ required: true, message: 'City is required' }]}>
                <Select
                  size="large"
                  showSearch
                  placeholder="Select or add a city"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space style={{ padding: '0 8px 4px' }}>
                        <Input
                          placeholder="Please enter city name"
                          value={newCityName}
                          onChange={(e) => setNewCityName(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <Button type="text" icon={<Plus size={14} />} onClick={handleAddCity}>
                          Add
                        </Button>
                      </Space>
                    </>
                  )}
                  options={cities.map((city) => ({ label: city.name, value: city.name }))}
                />
              </Form.Item>
              <Form.Item name="location" label="Locality / Area" rules={[{ required: true, message: 'Locality is required' }]}>
                <Input size="large" placeholder="e.g., Knowledge Park" className="hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20" />
              </Form.Item>
            </div>

            <Form.Item name="address" label="Full Street Address" className="mt-2">
              <TextArea rows={2} placeholder="Complete address for map routing" className="rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20" />
            </Form.Item>

            <Form.Item name="description" label="Property Description" rules={[{ required: true, message: 'Description is required' }]} className="mb-0 mt-2">
              <TextArea rows={4} placeholder="Describe the atmosphere, community, and key selling points..." className="rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20" />
            </Form.Item>
          </FormSection>

          {/* Section 2: Mapping & Location */}
          <FormSection title="Location & Mapping" icon={MapPin}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <Form.Item
                  name="coordinates"
                  label="GPS Coordinates"
                  extra={<span className="text-xs text-gray-500 mt-1 block">Format: Latitude, Longitude (e.g., 28.4643, 77.4993)</span>}
                  className="mb-0"
                >
                  <Input size="large" placeholder="Paste coordinates from Google Maps" className="hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20" />
                </Form.Item>
                <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <Form.Item name="nearbyPlaces" label="Points of Interest" className="mb-0">
                    <NearbyPlacesSelector coordinates={mapCoordinates} />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col h-full">
                <span className="block mb-2 font-medium text-gray-700">Map Verification Preview</span>
                <MemoizedMapPreview coordinates={rawCoordinates} />
              </div>
            </div>
          </FormSection>

          {/* Section 3: Pricing & Configuration */}
          <FormSection title="Pricing & Configuration" icon={Layout}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              <Form.Item name="priceType" label="Billing Cycle" rules={[{ required: true }]}>
                <Select size="large" className="w-full">
                  <Select.Option value="month">Per Month</Select.Option>
                  <Select.Option value="session">Per Session</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.priceType !== curr.priceType}
              >
                {({ getFieldValue }) => (
                  <Form.Item name="price" label={`Price (per ${getFieldValue('priceType') || 'month'})`} rules={[{ required: true }]}>
                    <InputNumber size="large" className="w-full" formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                )}
              </Form.Item>

              <Form.Item name="securityDeposit" label="Security Deposit">
                <InputNumber size="large" className="w-full" formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>

              <Form.Item name="availability" label="Current Status" rules={[{ required: true }]}>
                <Select size="large" className="w-full">
                  <Select.Option value="Available"><span className="text-emerald-600 font-semibold">● Available</span></Select.Option>
                  <Select.Option value="Limited"><span className="text-amber-600 font-semibold">● Limited</span></Select.Option>
                  <Select.Option value="Full"><span className="text-rose-600 font-semibold">● Full</span></Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="type" label="Property Type">
                <Select size="large" className="w-full">
                  <Select.Option value="PG">PG</Select.Option>
                  <Select.Option value="Hostel">Hostel</Select.Option>
                  <Select.Option value="Co-living">Co-living</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="gender" label="Gender Restriction">
                <Select size="large" className="w-full">
                  <Select.Option value="Boys">Boys Only</Select.Option>
                  <Select.Option value="Girls">Girls Only</Select.Option>
                  <Select.Option value="Co-ed">Co-ed</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="foodType" label="Food Type">
                <Select size="large" className="w-full">
                  <Select.Option value="Pure Veg">Pure Veg</Select.Option>
                  <Select.Option value="Veg">Veg</Select.Option>
                  <Select.Option value="Non-Veg">Non-Veg</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="verified" valuePropName="checked" label="Verification Status">
                <Checkbox className="font-medium text-gray-700">Verified Property</Checkbox>
              </Form.Item>

              <Form.Item name="capacity" label="Total Capacity">
                <Input size="large" placeholder="e.g., 50 Students" />
              </Form.Item>

              <Form.Item name="availableBeds" label="Open Beds">
                <InputNumber size="large" className="w-full" min={0} />
              </Form.Item>
            </div>

            <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">Reservation Settings</h4>
                  <p className="text-sm text-purple-700">Allow users to reserve this hostel by paying an advance amount</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item name="reservationEnabled" valuePropName="checked" className="mb-0">
                  <Checkbox className="text-gray-700 font-medium">
                    Enable Reservation System
                  </Checkbox>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) => prev.reservationEnabled !== curr.reservationEnabled}
                >
                  {({ getFieldValue }) => (
                    <Form.Item
                      name="reservationAmount"
                      label="Reservation Amount"
                      className="mb-0"
                    >
                      <InputNumber
                        size="large"
                        className="w-full"
                        min={0}
                        disabled={!getFieldValue('reservationEnabled')}
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                        placeholder="Enter reservation amount"
                      />
                    </Form.Item>
                  )}
                </Form.Item>
              </div>
            </div>
          </FormSection>

          {/* Section 4: Amenities & Media (Grid) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <FormSection title="Amenities & Rules" icon={Star} className="h-full">
              <Form.Item name="amenities" label="Available Amenities" className="mb-6">
                <AmenitiesCheckbox />
              </Form.Item>
              <Form.Item name="rules" label="House Rules" className="mb-0">
                <Select mode="tags" size="large" placeholder="Type a rule and press Enter..." className="w-full" />
              </Form.Item>
            </FormSection>

            <FormSection title="Media Gallery" icon={ImageIcon} className="h-full">
              <Form.Item name="images" label="Property Photos" extra={<span className="text-xs text-gray-500 mt-1 block">Supported: JPG, PNG, WebP. Max 20 images.</span>}>
                  <div className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {fileList.map((file, index) => (
                        <div key={file.uid || index} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group bg-gray-50 flex flex-col items-center justify-center">
                          {file.status === 'uploading' ? (
                            <div className="flex flex-col items-center justify-center w-full h-full p-2">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                              <span className="text-xs font-medium text-gray-600">{file.percent || 0}%</span>
                            </div>
                          ) : file.status === 'error' ? (
                            <div className="flex flex-col items-center justify-center w-full h-full p-2 text-red-500">
                              <Info className="w-6 h-6 mb-2" />
                              <span className="text-xs font-medium text-center">Failed</span>
                            </div>
                          ) : (
                            <>
                              <img src={file.url || URL.createObjectURL(file.originFileObj)} alt="Property" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFileList(prev => prev.filter(f => f.uid !== file.uid));
                                  }}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {fileList.length < 20 && (
                        <label className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={async (e) => {
                              const files = Array.from(e.target.files);
                              if (!files.length) return;
                              
                              const newFiles = files.map(file => ({
                                uid: Math.random().toString(36).substring(7),
                                name: file.name,
                                status: 'uploading',
                                percent: 0,
                                originFileObj: file
                              }));
                              
                              // Add to list immediately
                              setFileList(prev => [...prev, ...newFiles]);
                              
                              // Upload them sequentially
                              for (const newFile of newFiles) {
                                try {
                                  const formData = new FormData();
                                  formData.append('image', newFile.originFileObj);
                                  
                                  const response = await hostelAPI.uploadImage(formData, (progressEvent) => {
                                    if (progressEvent.total) {
                                      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                      setFileList(prev => prev.map(f => f.uid === newFile.uid ? { ...f, percent: percentCompleted } : f));
                                    }
                                  });
                                  
                                  setFileList(prev => prev.map(f => f.uid === newFile.uid ? {
                                    ...f,
                                    status: 'done',
                                    name: response.data.imageName,
                                    url: `${import.meta.env.VITE_UPLOADS_BASE_URL || ''}/${response.data.imageName}`
                                  } : f));
                                } catch (err) {
                                  console.error('Upload failed for', newFile.name, err);
                                  setFileList(prev => prev.map(f => f.uid === newFile.uid ? { ...f, status: 'error' } : f));
                                  message.error(`Upload failed for ${newFile.name}`);
                                }
                              }
                              
                              // Reset input
                              e.target.value = '';
                            }}
                          />
                          <UploadCloud size={24} className="mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm font-medium text-gray-500 group-hover:text-blue-500 transition-colors">Upload</span>
                        </label>
                      )}
                    </div>
                  </div>
              </Form.Item>
              <Form.Item name="videoTourUrl" label="Virtual Tour (YouTube URL)" className="mt-6 mb-0">
                <Input size="large" placeholder="https://www.youtube.com/watch?v=..." className="hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20" />
              </Form.Item>
            </FormSection>
          </div>

          {/* Section 5: Dynamic Arrays */}
          <FormSection title="Room Types Configuration" icon={Layout}>
            <Form.List name="roomTypes">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-50 border border-gray-200 rounded-xl p-4 relative group transition-colors hover:border-gray-300">
                      <div className="flex-1 w-full">
                        <Form.Item {...restField} name={[name, 'name']} className="mb-0">
                          <Input size="large" placeholder="Room Type (e.g., Single AC)" className="w-full" />
                        </Form.Item>
                      </div>
                      <div className="flex-[2] w-full">
                        <Form.Item {...restField} name={[name, 'description']} className="mb-0">
                          <Input size="large" placeholder="Brief description of the room..." className="w-full" />
                        </Form.Item>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(name)}
                        className="absolute -top-3 -right-3 md:relative md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white md:bg-transparent rounded-full md:rounded-lg border md:border-0 border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm md:shadow-none"
                        aria-label="Remove room configuration"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => add()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
                  >
                    <Plus size={18} /> Add Room Configuration
                  </button>
                </div>
              )}
            </Form.List>
          </FormSection>

          <FormSection title="Bed-Based Pricing (Sharing Types)" icon={Layout}>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Bed-Based Pricing System</h4>
                  <p className="text-sm text-blue-700">Define pricing for different sharing types (Single, Double, Triple, etc.). Users will see all pricing options on the hostel page.</p>
                </div>
              </div>
            </div>
            <Form.List name="sharingTypes">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-4 relative group transition-all hover:border-blue-400 hover:shadow-sm">
                      <div className="md:col-span-2">
                        <Form.Item {...restField} name={[name, 'name']} label="Sharing Type" rules={[{ required: true, message: 'Required' }]} className="mb-0">
                          <Input size="large" placeholder="e.g., Single Sharing" className="w-full" />
                        </Form.Item>
                      </div>
                      <div>
                        <Form.Item {...restField} name={[name, 'price']} label="Price (₹)" rules={[{ required: true, message: 'Required' }]} className="mb-0">
                          <InputNumber size="large" className="w-full" min={0} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/₹\s?|(,*)/g, '')} />
                        </Form.Item>
                      </div>
                      <div>
                        <Form.Item {...restField} name={[name, 'priceType']} label="Billing" initialValue="month" className="mb-0">
                          <Select size="large" className="w-full">
                            <Select.Option value="month">Per Month</Select.Option>
                            <Select.Option value="session">Per Session</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                      <div>
                        <Form.Item {...restField} name={[name, 'available']} label="Available Beds" initialValue={0} className="mb-0">
                          <InputNumber size="large" className="w-full" min={0} />
                        </Form.Item>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(name)}
                        className="absolute -top-3 -right-3 md:relative md:top-auto md:right-auto md:self-end w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                        aria-label="Remove sharing type"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => add({ name: '', price: 0, priceType: 'month', available: 0 })}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
                  >
                    <Plus size={18} /> Add Sharing Type
                  </button>
                </div>
              )}
            </Form.List>
          </FormSection>

          <FormSection title="Custom Information Fields" icon={Info}>
            <Form.List name="info">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-50 border border-gray-200 rounded-xl p-4 relative transition-colors hover:border-gray-300">
                      <div className="flex-1 w-full">
                        <Form.Item {...restField} name={[name, 'title']} className="mb-0">
                          <Input size="large" placeholder="Field Title (e.g., Notice Period)" className="w-full" />
                        </Form.Item>
                      </div>
                      <div className="flex-[2] w-full">
                        <Form.Item {...restField} name={[name, 'value']} className="mb-0">
                          <Input size="large" placeholder="Value (e.g., 30 Days)" className="w-full" />
                        </Form.Item>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(name)}
                        className="absolute -top-3 -right-3 md:relative md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white md:bg-transparent rounded-full md:rounded-lg border md:border-0 border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none shadow-sm md:shadow-none"
                        aria-label="Remove custom field"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => add()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
                  >
                    <Plus size={18} /> Add Custom Field
                  </button>
                </div>
              )}
            </Form.List>
          </FormSection>

          <FormSection title="Manual Review Entry" icon={Star}>
            <Form.List name="reviews">
              {(fields, { add, remove }) => (
                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 relative group">
                      <button
                        type="button"
                        onClick={() => remove(name)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shadow-sm bg-gray-100 focus:outline-none"
                        aria-label="Remove review"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pr-12">
                        <Form.Item {...restField} name={[name, 'name']} label="Reviewer Name" rules={[{ required: true }]} className="mb-0">
                          <Input size="large" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'rating']} label="Star Rating" rules={[{ required: true }]} className="mb-0">
                          <InputNumber size="large" min={1} max={5} className="w-full" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'reviewDate']} label="Date" rules={[{ required: true }]} className="mb-0">
                          <DatePicker size="large" className="w-full" />
                        </Form.Item>
                      </div>
                      <Form.Item {...restField} name={[name, 'comment']} label="Review Text" className="mb-0 mt-4" rules={[{ required: true }]}>
                        <TextArea rows={2} showCount maxLength={500} className="rounded-lg" />
                      </Form.Item>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => add({ rating: 5 })}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
                  >
                    <Plus size={18} /> Inject Customer Review
                  </button>
                </div>
              )}
            </Form.List>
          </FormSection>

          <FormSection title="Installment Plans (Post-Assignment Only)" icon={DollarSign}>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">Installment Plans Visibility</h4>
                  <p className="text-sm text-amber-700">These plans will NOT appear on listing/search/details pages. They are only available after a student is assigned to this hostel.</p>
                </div>
              </div>
            </div>
            <Form.List name="installmentPlans">
              {(fields, { add, remove }) => (
                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-5 border-2 border-blue-200 rounded-2xl bg-blue-50/30 relative">
                      <button
                        type="button"
                        onClick={() => remove(name)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shadow-sm focus:outline-none"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-12">
                        <Form.Item {...restField} name={[name, 'name']} label="Plan Name" rules={[{ required: true }]} className="mb-0">
                          <Input size="large" placeholder="e.g., 3 Installment Plan" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'type']} label="Plan Type" rules={[{ required: true }]} className="mb-0">
                          <Select size="large">
                            <Select.Option value="percentage">Percentage Based</Select.Option>
                            <Select.Option value="fixed">Fixed Amount</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>

                      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.installmentPlans?.[name]?.type !== curr.installmentPlans?.[name]?.type}>
                        {({ getFieldValue }) => {
                          const planType = getFieldValue(['installmentPlans', name, 'type']);
                          return (
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">Installments</span>
                                {planType === 'percentage' && (
                                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                    <Percent size={14} /> Total should equal 100%
                                  </span>
                                )}
                              </div>
                              <Form.List name={[name, 'installments']}>
                                {(installmentFields, { add: addInstallment, remove: removeInstallment }) => (
                                  <>
                                    {installmentFields.map(({ key: iKey, name: iName, ...iRestField }, index) => (
                                      <div key={iKey} className="flex items-center gap-3 mb-3">
                                        <span className="text-sm font-medium text-gray-600 w-20">#{index + 1}</span>
                                        <Form.Item {...iRestField} name={[iName, 'value']} className="mb-0 flex-1" rules={[{ required: true }]}>
                                          <InputNumber
                                            size="large"
                                            className="w-full"
                                            min={0}
                                            max={planType === 'percentage' ? 100 : undefined}
                                            formatter={value => planType === 'percentage' ? `${value}%` : `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/[₹,%\s]/g, '')}
                                            placeholder={planType === 'percentage' ? 'e.g., 30' : 'e.g., 10000'}
                                          />
                                        </Form.Item>
                                        <Form.Item {...iRestField} name={[iName, 'dueDate']} className="mb-0 flex-1">
                                          <Input size="large" placeholder="e.g., Upon Admission" />
                                        </Form.Item>
                                        <button
                                          type="button"
                                          onClick={() => removeInstallment(iName)}
                                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addInstallment({ value: 0, dueDate: '' })}
                                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 border border-dashed border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
                                    >
                                      <Plus size={16} /> Add Installment
                                    </button>
                                  </>
                                )}
                              </Form.List>
                            </div>
                          );
                        }}
                      </Form.Item>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => add({ name: '', type: 'percentage', installments: [] })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
                    >
                      <Plus size={18} /> Custom Plan
                    </button>
                    <Dropdown menu={{
                      items: templateOptions.length > 0 ? templateOptions.map(template => ({
                        key: template._id,
                        label: template.name,
                        onClick: () => add({
                          name: template.name,
                          type: template.type,
                          installments: template.installments.map(inst => ({
                            value: inst.value,
                            dueDate: inst.dueDate || ''
                          }))
                        })
                      })) : [{ key: 'empty', label: 'No templates found', disabled: true }]
                    }}>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 border-2 border-dashed border-blue-300 text-blue-600 font-medium rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
                      >
                        <LayoutTemplate size={18} /> Use Template
                      </button>
                    </Dropdown>
                  </div>
                </div>
              )}
            </Form.List>
          </FormSection>

        </Form>
      </main>
    </div>
  );
};

export default AdminHostelEdit;