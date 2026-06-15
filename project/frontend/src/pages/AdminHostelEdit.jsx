import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Form, Input, Select, Upload, Button, Space, message, 
  Row, Col, InputNumber, DatePicker, Checkbox, Typography, Spin 
} from 'antd';
import dayjs from 'dayjs';
import { 
  SaveOutlined, ArrowLeftOutlined, UploadOutlined, PlusOutlined, 
  DeleteOutlined, EnvironmentOutlined, InfoCircleOutlined, LayoutOutlined,
  ImageOutlined, StarOutlined
} from '@ant-design/icons';
import { hostelAPI } from '../services/api';
import { invalidateData } from '../utils/stateManager';
import { forceRefresh } from '../utils/cacheManager';
import NearbyPlacesSelector from '../components/NearbyPlacesSelector.jsx';

const { Title, Text } = Typography;
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
  { label: 'DIning/Mess Area', value: 'DIning/Mess Area' },
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
  { label: 'First AId Kit', value: 'First AId Kit' },
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
  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
    <Checkbox.Group value={value} onChange={onChange} className="w-full">
      <Row gutter={[16, 8]}>
        {AMENITIES_OPTIONS.map((amenity) => (
          <Col xs={24} sm={12} md={8} xl={6} key={amenity.value}>
            <Checkbox value={amenity.value}>
              <span className="text-sm text-slate-700">{amenity.label}</span>
            </Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  </div>
));
AmenitiesCheckbox.displayName = 'AmenitiesCheckbox';

// Isolates Iframe rendering to prevent freezing the main thread on keystrokes
const MemoizedMapPreview = memo(({ coordinates }) => {
  if (!coordinates || !coordinates.includes(',')) return null;
  const [lat, lng] = coordinates.split(',').map(c => c.trim());
  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50 h-[250px] relative">
      <iframe
        title="Location Preview"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`http://googleusercontent.com/maps.google.com/5${lat},${lng}&hl=en&z=15&output=embed`}
        allowFullScreen
        loading="lazy"
        className="absolute inset-0"
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

  // Antd optimized watch for map preview without React state thrashing
  const rawCoordinates = Form.useWatch('coordinates', form);

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
          location: data.location || '',
          description: data.description || '',
          price: data.price || 0,
          priceType: data.priceType || 'month',
          sessionPrice: data.sessionPrice || 0,
          availability: data.availability || 'Available',
          rating: data.rating || 0,
          type: data.type || 'PG',
          gender: data.gender || 'Co-ed',
          availableBeds: data.availableBeds || data.availableRooms || 0,
          securityDeposit: data.securityDeposit || 0,
          capacity: data.capacity || '',
          checkIn: data.checkIn || '',
          verified: data.verified === 'true' || data.verified === true,
          amenities: data.amenities || [],
          rules: data.rules || [],
          info: data.info?.length > 0 ? data.info : [{ title: '', value: '' }],
          nearbyPlaces: data.nearbyPlaces || {},
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
          videoTourUrl: data.videoTourUrl || ''
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

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const hideLoading = message.loading('Saving property...', 0);
    
    try {
      const formData = new FormData();
      
      // JSON Payloads
      ['amenities', 'rules', 'nearbyPlaces'].forEach(key => {
        formData.append(key, JSON.stringify(values[key] || (key === 'nearbyPlaces' ? {} : [])));
      });

      // Filtered Arrays
      formData.append('info', JSON.stringify(values.info?.filter(i => i.title && i.value) || []));
      formData.append('roomTypes', JSON.stringify(values.roomTypes?.filter(r => r.name) || []));
      formData.append('reviews', JSON.stringify(values.reviews?.filter(r => r.name && r.comment).map(r => ({
        ...r, date: r.reviewDate ? r.reviewDate.format('YYYY-MM-DD') : r.date
      })) || []));

      // Coordinates
      if (values.coordinates) {
        const coords = values.coordinates.split(',').map(c => c.trim());
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          formData.append('mapCoordinates', JSON.stringify({ lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) }));
        }
      } else if (mapCoordinates?.lat) {
        formData.append('mapCoordinates', JSON.stringify(mapCoordinates));
      }

      // Basic Text Fields
      Object.keys(values).forEach(key => {
        if (!['amenities', 'rules', 'info', 'nearbyPlaces', 'coordinates', 'roomTypes', 'reviews'].includes(key) && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      // Images
      const newImages = fileList.filter(file => file.originFileObj);
      const keepImages = fileList.filter(file => file.isExisting && file.status === 'done');
      
      newImages.forEach(file => formData.append('images', file.originFileObj));
      
      if (profileImage?.originFileObj) {
        formData.append('profileImage', profileImage.originFileObj);
      } else if (profileImage?.isExisting) {
        formData.append('existingProfileImage', profileImage.name);
      }
      
      formData.append('finalImages', JSON.stringify([...keepImages.map(f => f.name), ...newImages.map(f => f.name || `new-${Date.now()}`)]));

      // Network Call
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" tip="Loading property details..." />
      </div>
    );
  }

  return (
    <div className="pb-12 bg-slate-50 min-h-screen">
      
      {/* Sticky Enterprise Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm px-6 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/hostels')}
              type="text"
            />
            <div>
              <Title level={4} className="!m-0 text-slate-900">
                {id === 'new' ? 'Add New Property' : 'Edit Property Configuration'}
              </Title>
              <Text type="secondary" className="text-xs font-medium">Manage listing details, rules, and media.</Text>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/admin/hostels')} disabled={submitting}>
              Discard
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={submitting}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Form
          id="hostel-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
          requiredMark="optional"
        >
          {/* Section 1: Basic Information */}
          <Card 
            title={<span className="flex items-center gap-2"><InfoCircleOutlined className="text-blue-500" /> Basic Information</span>}
            bordered={false} className="shadow-sm"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="Property Name" rules={[{ required: true, message: 'Required' }]}>
                  <Input size="large" placeholder="e.g., Sunrise Student Living" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="location" label="City / Area" rules={[{ required: true, message: 'Required' }]}>
                  <Input size="large" placeholder="e.g., Knowledge Park, Greater Noida" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item name="address" label="Full Street Address">
              <TextArea rows={2} placeholder="Complete address for map routing" />
            </Form.Item>

            <Form.Item name="description" label="Property Description" rules={[{ required: true, message: 'Required' }]}>
              <TextArea rows={4} placeholder="Describe the atmosphere, community, and key selling points..." />
            </Form.Item>
          </Card>

          {/* Section 2: Mapping & Location */}
          <Card 
            title={<span className="flex items-center gap-2"><EnvironmentOutlined className="text-emerald-500" /> Location & Mapping</span>}
            bordered={false} className="shadow-sm"
          >
            <Row gutter={24}>
              <Col xs={24} xl={10}>
                <Form.Item 
                  name="coordinates" 
                  label="GPS Coordinates" 
                  extra="Format: Latitude, Longitude (e.g., 28.4643, 77.4993)"
                >
                  <Input size="large" placeholder="Paste coordinates from Google Maps" />
                </Form.Item>
                <Form.Item name="nearbyPlaces" label="Points of Interest" className="mb-0">
                  {/* Assuming NearbyPlacesSelector handles its own internal layout cleanly */}
                  <NearbyPlacesSelector coordinates={mapCoordinates} />
                </Form.Item>
              </Col>
              <Col xs={24} xl={14}>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                  <Text strong className="block mb-2 text-slate-600">Map Verification Preview</Text>
                  <MemoizedMapPreview coordinates={rawCoordinates} />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Section 3: Pricing & Configuration */}
          <Card 
            title={<span className="flex items-center gap-2"><LayoutOutlined className="text-purple-500" /> Pricing & Configuration</span>}
            bordered={false} className="shadow-sm"
          >
            <Row gutter={24}>
              <Col xs={24} md={6}>
                <Form.Item name="priceType" label="Billing Cycle" rules={[{ required: true }]}>
                  <Select size="large">
                    <Select.Option value="month">Per Month</Select.Option>
                    <Select.Option value="session">Per Session</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item 
                  noStyle 
                  shouldUpdate={(prev, curr) => prev.priceType !== curr.priceType}
                >
                  {({ getFieldValue }) => (
                    <Form.Item name="price" label={`Price (per ${getFieldValue('priceType') || 'month'})`} rules={[{ required: true }]}>
                      <InputNumber size="large" style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="securityDeposit" label="Security Deposit">
                  <InputNumber size="large" style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="availability" label="Current Status" rules={[{ required: true }]}>
                  <Select size="large">
                    <Select.Option value="Available"><span className="text-green-600 font-medium">● Available</span></Select.Option>
                    <Select.Option value="Limited"><span className="text-yellow-600 font-medium">● Limited</span></Select.Option>
                    <Select.Option value="Full"><span className="text-red-600 font-medium">● Full</span></Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={6}>
                <Form.Item name="type" label="Property Type">
                  <Select size="large">
                    <Select.Option value="PG">PG</Select.Option>
                    <Select.Option value="Hostel">Hostel</Select.Option>
                    <Select.Option value="Apartment">Apartment</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="gender" label="Gender Restriction">
                  <Select size="large">
                    <Select.Option value="Boys">Boys Only</Select.Option>
                    <Select.Option value="Girls">Girls Only</Select.Option>
                    <Select.Option value="Co-ed">Co-ed</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="capacity" label="Total Capacity">
                  <Input size="large" placeholder="e.g., 50 Students" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="availableBeds" label="Open Beds">
                  <InputNumber size="large" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 4: Amenities & Media */}
          <Row gutter={24}>
            <Col xs={24} xl={12}>
              <Card 
                title={<span className="flex items-center gap-2"><StarOutlined className="text-orange-500" /> Amenities & Rules</span>}
                bordered={false} className="shadow-sm h-full"
              >
                <Form.Item name="amenities" label="Available Amenities" className="mb-6">
                  <AmenitiesCheckbox />
                </Form.Item>
                <Form.Item name="rules" label="House Rules">
                  <Select mode="tags" size="large" placeholder="Type a rule and press Enter..." style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            </Col>
            
            <Col xs={24} xl={12}>
              <Card 
                title={<span className="flex items-center gap-2"><ImageOutlined className="text-pink-500" /> Media Gallery</span>}
                bordered={false} className="shadow-sm h-full"
              >
                <Form.Item name="images" label="Property Photos" extra="Supported: JPG, PNG, WebP. Max 10 images.">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                    beforeUpload={() => false}
                    multiple
                    accept="image/*"
                  >
                    {fileList.length >= 10 ? null : (
                      <div className="flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors">
                        <UploadOutlined className="text-xl mb-2" />
                        <span className="text-sm font-medium">Upload</span>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Form.Item name="videoTourUrl" label="Virtual Tour (YouTube URL)">
                  <Input size="large" placeholder="https://www.youtube.com/watch?v=..." />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Section 5: Dynamic Arrays (Room Types, Custom Info, Reviews) */}
          <Card title="Room Types Configuration" bordered={false} className="shadow-sm">
            <Form.List name="roomTypes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} className="mb-4">
                      <Col xs={24} md={8}>
                        <Form.Item {...restField} name={[name, 'name']} className="mb-0">
                          <Input size="large" placeholder="Room Type (e.g., Single AC)" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={14}>
                        <Form.Item {...restField} name={[name, 'description']} className="mb-0">
                          <Input size="large" placeholder="Brief description of the room..." />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={2} className="flex items-center justify-end">
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    Add Room Configuration
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Card title="Custom Information Fields" bordered={false} className="shadow-sm">
            <Form.List name="info">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} className="mb-4">
                      <Col xs={24} md={8}>
                        <Form.Item {...restField} name={[name, 'title']} className="mb-0">
                          <Input size="large" placeholder="Field Title (e.g., Notice Period)" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={14}>
                        <Form.Item {...restField} name={[name, 'value']} className="mb-0">
                          <Input size="large" placeholder="Value (e.g., 30 Days)" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={2} className="flex items-center justify-end">
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    Add Custom Field
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Card title="Manual Review Entry" bordered={false} className="shadow-sm">
            <Form.List name="reviews">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                      <Button 
                        type="text" danger icon={<DeleteOutlined />} 
                        onClick={() => remove(name)}
                        className="absolute top-2 right-2"
                      />
                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'name']} label="Reviewer Name" rules={[{ required: true }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'rating']} label="Star Rating" rules={[{ required: true }]}>
                            <InputNumber min={1} max={5} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'reviewDate']} label="Date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item {...restField} name={[name, 'comment']} label="Review Text" className="mb-0" rules={[{ required: true }]}>
                        <TextArea rows={2} showCount maxLength={500} />
                      </Form.Item>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add({ rating: 5 })} icon={<PlusOutlined />} block>
                    Inject Customer Review
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>

        </Form>
      </div>
    </div>
  );
};

export default AdminHostelEdit;