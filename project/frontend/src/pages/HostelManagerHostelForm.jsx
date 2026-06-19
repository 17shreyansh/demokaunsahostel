import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, Form, Input, Select, Upload, Button, Row, Col, 
  InputNumber, Checkbox, Typography, Spin, message, Tooltip
} from 'antd';
import { 
  SaveOutlined, ArrowLeftOutlined, UploadOutlined, PlusOutlined, 
  DeleteOutlined, EnvironmentOutlined, InfoCircleOutlined, LayoutOutlined,
  PictureOutlined, StarOutlined, PhoneOutlined, DollarOutlined, PercentageOutlined
} from '@ant-design/icons';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

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
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
    <Checkbox.Group value={value} onChange={onChange} className="w-full">
      <Row gutter={[16, 12]}>
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

const MemoizedMapPreview = memo(({ coordinates }) => {
  if (!coordinates || !coordinates.includes(',')) return null;
  const [lat, lng] = coordinates.split(',').map(c => c.trim());
  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 h-[200px] relative">
      <iframe
        title="Location Preview"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`http://googleusercontent.com/maps.google.com/6${lat},${lng}&hl=en&z=15&output=embed`}
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

const HostelManagerHostelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // Antd optimized watch for map preview without React state thrashing
  const rawCoordinates = Form.useWatch('coordinates', form);

  useEffect(() => {
    const fetchHostel = async () => {
      if (!id || id === 'new') {
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get(`/api/hostels/${id}`);
        const data = res.data;
        
        form.setFieldsValue({
          name: data.name || '',
          location: data.location || '',
          description: data.description || '',
          price: data.price || '',
          priceType: data.priceType || 'month',
          sessionPrice: data.sessionPrice || '',
          availability: data.availability || 'Available',
          rating: data.rating || '',
          type: data.type || 'PG',
          gender: data.gender || 'Co-ed',
          availableBeds: data.availableBeds || data.availableRooms || '',
          securityDeposit: data.securityDeposit || '',
          capacity: data.capacity || '',
          checkIn: data.checkIn || '',
          amenities: data.amenities || [],
          rules: data.rules || [],
          sharingTypes: data.sharingTypes?.length > 0 ? data.sharingTypes : [],
          installmentPlans: data.installmentPlans || [],
          info: data.info?.length > 0 ? data.info : [],
          roomTypes: data.roomTypes?.length > 0 ? data.roomTypes : [],
          address: data.contactInfo?.address || '',
          contactPersonName: data.contactInfo?.contactPersonName || '',
          jobTitle: data.contactInfo?.jobTitle || '',
          phone: data.contactInfo?.phone || '',
          coordinates: data.mapCoordinates ? `${data.mapCoordinates.lat}, ${data.mapCoordinates.lng}` : '',
          videoTourUrl: data.videoTourUrl || '',
          paymentDetails: data.paymentDetails || { upiId: '', qrCode: '', paymentInstructions: '' },
          reservationEnabled: data.reservationEnabled || false,
          reservationAmount: data.reservationAmount || 0
        });

        if (data.images) {
          setFileList(data.images.map((img, index) => ({
            uid: `existing-${index}`,
            name: img,
            status: 'done',
            url: `${import.meta.env.VITE_UPLOADS_BASE_URL || ''}/${img}`,
            isExisting: true
          })));
        }
        
        if (data.contactInfo?.profileImage) {
          setProfileImage({
            uid: 'profile-existing',
            name: data.contactInfo.profileImage,
            status: 'done',
            url: `${import.meta.env.VITE_UPLOADS_BASE_URL || ''}/${data.contactInfo.profileImage}`,
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
    const hideLoading = message.loading('Saving property details...', 0);
    
    try {
      const formData = new FormData();
      
      // JSON Payloads
      ['amenities', 'rules'].forEach(key => {
        formData.append(key, JSON.stringify(values[key] || []));
      });

      // Filtered Arrays
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

      // Coordinates
      if (values.coordinates) {
        const coords = values.coordinates.split(',').map(c => c.trim());
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          formData.append('mapCoordinates', JSON.stringify({ lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) }));
        }
      }

      // Basic Text Fields
      Object.keys(values).forEach(key => {
        if (!['amenities', 'rules', 'info', 'coordinates', 'roomTypes', 'sharingTypes', 'installmentPlans', 'paymentDetails'].includes(key) && values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Payment settings
      if (values.paymentDetails) {
        formData.append('paymentDetails', JSON.stringify(values.paymentDetails));
      }
      if (values.reservationEnabled !== undefined) {
        formData.append('reservationEnabled', values.reservationEnabled ? 'true' : 'false');
      }
      if (values.reservationAmount !== undefined && values.reservationAmount !== null && !isNaN(values.reservationAmount)) {
        formData.append('reservationAmount', Number(values.reservationAmount) || 0);
      } else {
        formData.append('reservationAmount', 0);
      }

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
      let response;
      if (id && id !== 'new') {
        response = await axios.put(`/api/hostel-manager/hostels/${id}`, formData, { 
          withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } 
        });
      } else {
        response = await axios.post('/api/hostel-manager/hostels', formData, { 
          withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } 
        });
      }
      
      message.success(response.data.message || 'Changes submitted for admin approval.');
      navigate('/hostel-manager/change-requests', { replace: true });
    } catch (error) {
      message.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      hideLoading();
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <HostelManagerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spin size="large" tip="Loading property details..." />
        </div>
      </HostelManagerLayout>
    );
  }

  return (
    <HostelManagerLayout>
      <div className="pb-12 max-w-6xl mx-auto">
        
        {/* Sticky Enterprise Header */}
        <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200 pb-4 pt-2 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/hostel-manager/hostels')}
                type="text"
                className="text-slate-500 hover:bg-slate-200"
              />
              <div>
                <Title level={4} className="!m-0 text-slate-900">
                  {id === 'new' ? 'Add New Property' : 'Edit Property Details'}
                </Title>
                <Text type="secondary" className="text-xs font-medium">Manage your listing details, rules, and media.</Text>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/hostel-manager/hostels')} disabled={submitting}>
                Discard
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={submitting}
                className="bg-blue-600 shadow-md hover:shadow-lg transform-gpu hover:-translate-y-0.5 transition-all"
              >
                {id === 'new' ? 'Create Listing' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <Form
          id="hostel-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6 px-2"
          requiredMark="optional"
        >
          {/* Section 1: Basic Information */}
          <Card 
            title={<span className="flex items-center gap-2"><InfoCircleOutlined className="text-blue-500" /> Basic Information</span>}
            bordered={false} className="shadow-sm rounded-2xl"
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
              <TextArea rows={4} placeholder="Describe the atmosphere, community, and key selling points..." showCount maxLength={1000} />
            </Form.Item>
          </Card>

          {/* Section 2: Pricing & Configuration */}
          <Card 
            title={<span className="flex items-center gap-2"><LayoutOutlined className="text-emerald-500" /> Pricing & Configuration</span>}
            bordered={false} className="shadow-sm rounded-2xl"
          >
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="priceType" label="Billing Cycle" rules={[{ required: true }]}>
                  <Select size="large">
                    <Select.Option value="month">Per Month</Select.Option>
                    <Select.Option value="session">Per Session</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
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
              <Col xs={24} md={8}>
                <Form.Item name="sessionPrice" label="Secondary Price (Optional)">
                  <InputNumber size="large" style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="Alternative cycle price" />
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
                <Form.Item name="availability" label="Current Status" rules={[{ required: true }]}>
                  <Select size="large">
                    <Select.Option value="Available"><span className="text-green-600 font-medium">● Available</span></Select.Option>
                    <Select.Option value="Limited"><span className="text-yellow-600 font-medium">● Limited</span></Select.Option>
                    <Select.Option value="Full"><span className="text-red-600 font-medium">● Full</span></Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="rating" label="Internal Rating">
                  <InputNumber size="large" style={{ width: '100%' }} min={0} max={5} step={0.1} placeholder="0.0 - 5.0" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="capacity" label="Total Capacity">
                  <Input size="large" placeholder="e.g., 50 Students" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="availableBeds" label="Open Beds">
                  <InputNumber size="large" style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="securityDeposit" label="Security Deposit">
                  <InputNumber size="large" style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 3: Contact & Location */}
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card 
                title={<span className="flex items-center gap-2"><PhoneOutlined className="text-orange-500" /> Contact Details</span>}
                bordered={false} className="shadow-sm rounded-2xl h-full"
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="contactPersonName" label="Contact Person">
                      <Input size="large" placeholder="e.g., John Doe" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="jobTitle" label="Job Title">
                      <Input size="large" placeholder="e.g., Property Manager" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="phone" label="Phone Number">
                  <Input size="large" placeholder="+91 9876543210" />
                </Form.Item>
                <Form.Item label="Profile Photo" className="mb-0">
                  <Upload
                    listType="picture-card"
                    fileList={profileImage ? [profileImage] : []}
                    onChange={({ fileList }) => setProfileImage(fileList[0] || null)}
                    beforeUpload={() => false}
                    accept="image/*"
                    maxCount={1}
                  >
                    {!profileImage && (
                      <div className="flex flex-col items-center text-slate-400">
                        <UploadOutlined className="text-xl mb-1" />
                        <span className="text-xs">Upload</span>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={<span className="flex items-center gap-2"><EnvironmentOutlined className="text-teal-500" /> Map Coordinates</span>}
                bordered={false} className="shadow-sm rounded-2xl h-full"
              >
                <Form.Item 
                  name="coordinates" 
                  label="GPS Coordinates" 
                  extra="Format: Latitude, Longitude (e.g., 28.4643, 77.4993)"
                  className="mb-2"
                >
                  <Input size="large" placeholder="Paste coordinates from Google Maps" />
                </Form.Item>
                <MemoizedMapPreview coordinates={rawCoordinates} />
              </Card>
            </Col>
          </Row>

          {/* Section 4: Amenities & Media */}
          <Card 
            title={<span className="flex items-center gap-2"><StarOutlined className="text-indigo-500" /> Amenities & Rules</span>}
            bordered={false} className="shadow-sm rounded-2xl"
          >
            <Form.Item name="amenities" label="Available Amenities">
              <AmenitiesCheckbox />
            </Form.Item>
            <Form.Item name="rules" label="House Rules" extra="Press enter to add multiple tags">
              <Select mode="tags" size="large" placeholder="Type a rule and press Enter..." style={{ width: '100%' }} />
            </Form.Item>
          </Card>

          <Card 
            title={<span className="flex items-center gap-2"><PictureOutlined className="text-pink-500" /> Media Gallery</span>}
            bordered={false} className="shadow-sm rounded-2xl"
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
            <Form.Item name="videoTourUrl" label="Virtual Tour (YouTube URL)" className="mb-0">
              <Input size="large" placeholder="https://www.youtube.com/watch?v=..." />
            </Form.Item>
          </Card>

          {/* Section 5: Bed-Based Pricing */}
          <Card 
            title={<span className="flex items-center gap-2"><DollarOutlined className="text-yellow-500" /> Bed-Based Pricing (Sharing Types)</span>}
            bordered={false} className="shadow-sm rounded-2xl"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-800 font-medium">
                Define pricing for each sharing type. The lowest price will automatically be shown as the base price on listing cards.
              </p>
            </div>
            <Form.List name="sharingTypes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative mb-4">
                      <Button 
                        type="text" danger icon={<DeleteOutlined />} 
                        onClick={() => remove(name)}
                        className="absolute top-2 right-2"
                      />
                      <Row gutter={16} className="mt-2">
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'name']} label="Sharing Type" rules={[{ required: true, message: 'Required' }]} className="mb-0">
                            <Input size="large" placeholder="e.g., Single Sharing" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item {...restField} name={[name, 'price']} label="Price (₹)" rules={[{ required: true, message: 'Required' }]} className="mb-0">
                            <InputNumber 
                              size="large" style={{ width: '100%' }} min={0}
                              formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={v => v.replace(/₹\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item {...restField} name={[name, 'priceType']} label="Billing" initialValue="month" className="mb-0">
                            <Select size="large">
                              <Select.Option value="month">Per Month</Select.Option>
                              <Select.Option value="session">Per Session</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                          <Form.Item {...restField} name={[name, 'available']} label="Beds" initialValue={0} className="mb-0">
                            <InputNumber size="large" style={{ width: '100%' }} min={0} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add({ name: '', price: 0, priceType: 'month', available: 0 })} 
                    icon={<PlusOutlined />} 
                    block
                  >
                    Add Sharing Type
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* Section 6: Payment Settings */}
          <Card 
            title={<span className="flex items-center gap-2"><DollarOutlined className="text-green-600" /> Payment Settings (Manual Payment System)</span>}
            bordered={false} className="shadow-sm rounded-2xl"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium">
                Configure your payment details for manual payment collection. Students will see this information when booking visits or reserving seats.
              </p>
            </div>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name={['paymentDetails', 'upiId']} label="UPI ID">
                  <Input size="large" placeholder="yourname@upi" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="QR Code (Upload)">
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <div className="flex flex-col items-center text-slate-400">
                      <UploadOutlined className="text-xl mb-1" />
                      <span className="text-xs">Upload QR</span>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name={['paymentDetails', 'paymentInstructions']} label="Payment Instructions">
              <TextArea rows={3} placeholder="Additional instructions for students making payments..." />
            </Form.Item>
            
            <div className="border-t border-slate-200 pt-4 mt-4">
              <Title level={5}>Seat Reservation Settings</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="reservationEnabled" valuePropName="checked" className="mb-2">
                    <Checkbox>Enable Seat Reservation</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="reservationAmount" label="Reservation Amount (₹)">
                    <InputNumber 
                      size="large" 
                      style={{ width: '100%' }} 
                      min={0}
                      defaultValue={0}
                      formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      placeholder="5000"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Section 7: Dynamic Arrays */}
          <Card title="Room Configurations" bordered={false} className="shadow-sm rounded-2xl">
            <Form.List name="roomTypes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative mb-4">
                      <Button 
                        type="text" danger icon={<DeleteOutlined />} 
                        onClick={() => remove(name)}
                        className="absolute top-2 right-2"
                      />
                      <Row gutter={16} className="mt-2">
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'name']} className="mb-0" label="Room Type">
                            <Input placeholder="e.g., Single AC" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={16}>
                          <Form.Item {...restField} name={[name, 'description']} className="mb-0" label="Description">
                            <Input placeholder="Brief description of the room..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    Add Room Configuration
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Card title="Custom Information Fields" bordered={false} className="shadow-sm rounded-2xl">
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

          <Card 
            title={<span className="flex items-center gap-2"><DollarOutlined className="text-green-500" /> Installment Plans (Post-Assignment Only)</span>}
            bordered={false} className="shadow-sm rounded-2xl"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800 font-medium flex items-start gap-2">
                <InfoCircleOutlined className="mt-0.5" />
                <span>These plans will NOT appear on listing/search/details pages. They are only available after a student is assigned to this hostel.</span>
              </p>
            </div>
            <Form.List name="installmentPlans">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50 relative mb-4">
                      <Button 
                        type="text" danger icon={<DeleteOutlined />} 
                        onClick={() => remove(name)}
                        className="absolute top-2 right-2"
                      />
                      <Row gutter={16} className="mt-2 mb-4">
                        <Col xs={24} md={12}>
                          <Form.Item {...restField} name={[name, 'name']} label="Plan Name" rules={[{ required: true }]} className="mb-0">
                            <Input size="large" placeholder="e.g., 3 Installment Plan" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item {...restField} name={[name, 'type']} label="Plan Type" rules={[{ required: true }]} className="mb-0">
                            <Select size="large">
                              <Select.Option value="percentage">Percentage Based</Select.Option>
                              <Select.Option value="fixed">Fixed Amount</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.installmentPlans?.[name]?.type !== curr.installmentPlans?.[name]?.type}>
                        {({ getFieldValue }) => {
                          const planType = getFieldValue(['installmentPlans', name, 'type']);
                          return (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <Text strong className="text-xs">Installments</Text>
                                {planType === 'percentage' && (
                                  <Text type="secondary" className="text-xs flex items-center gap-1">
                                    <PercentageOutlined /> Total should equal 100%
                                  </Text>
                                )}
                              </div>
                              <Form.List name={[name, 'installments']}>
                                {(installmentFields, { add: addInstallment, remove: removeInstallment }) => (
                                  <>
                                    {installmentFields.map(({ key: iKey, name: iName, ...iRestField }, index) => (
                                      <Row key={iKey} gutter={12} className="mb-3" align="middle">
                                        <Col flex="60px">
                                          <Text className="text-sm font-medium">#{index + 1}</Text>
                                        </Col>
                                        <Col flex="auto">
                                          <Form.Item {...iRestField} name={[iName, 'value']} className="mb-0" rules={[{ required: true }]}>
                                            <InputNumber 
                                              size="large" 
                                              style={{ width: '100%' }}
                                              min={0}
                                              max={planType === 'percentage' ? 100 : undefined}
                                              formatter={value => planType === 'percentage' ? `${value}%` : `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                              parser={value => value.replace(/[₹,%\s]/g, '')}
                                              placeholder={planType === 'percentage' ? '30' : '10000'}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col flex="auto">
                                          <Form.Item {...iRestField} name={[iName, 'dueDate']} className="mb-0">
                                            <Input size="large" placeholder="Upon Admission" />
                                          </Form.Item>
                                        </Col>
                                        <Col flex="40px">
                                          <Button 
                                            type="text" danger icon={<DeleteOutlined />}
                                            onClick={() => removeInstallment(iName)}
                                          />
                                        </Col>
                                      </Row>
                                    ))}
                                    <Button 
                                      type="dashed" 
                                      onClick={() => addInstallment({ value: 0, dueDate: '' })} 
                                      icon={<PlusOutlined />} 
                                      size="small"
                                      block
                                    >
                                      Add Installment
                                    </Button>
                                  </>
                                )}
                              </Form.List>
                            </div>
                          );
                        }}
                      </Form.Item>
                    </div>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add({ name: '', type: 'percentage', installments: [] })} 
                    icon={<PlusOutlined />} 
                    block
                  >
                    Add Installment Plan
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

        </Form>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerHostelForm;