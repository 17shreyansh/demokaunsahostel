import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invalidateData } from '../utils/stateManager'
import { forceRefresh } from '../utils/cacheManager'
import {
  Card, Form, Input, Select, Upload, Button, Space, message, 
  Row, Col, Divider, Typography, InputNumber, Tag, DatePicker
} from 'antd'
import dayjs from 'dayjs'
import {
  SaveOutlined, ArrowLeftOutlined, UploadOutlined, PlusOutlined, 
  DeleteOutlined, EnvironmentOutlined
} from '@ant-design/icons'
import { hostelAPI } from '../services/api'
import InteractiveMap from '../components/InteractiveMap'
import { nearbyPlacesAPI } from '../services/nearbyPlacesAPI'
import NearbyPlacesSelector from '../components/NearbyPlacesSelector.jsx'

const { Title, Text } = Typography
const { TextArea } = Input

const AdminHostelEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [hostel, setHostel] = useState(null)
  const [fileList, setFileList] = useState([])
  const [profileImage, setProfileImage] = useState(null)
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.6139, lng: 77.2090 })

  useEffect(() => {
    if (id && id !== 'new') {
      fetchHostel()
    }
  }, [id])

  const fetchHostel = async () => {
    setLoading(true)
    try {
      const response = await hostelAPI.getById(id)
      const hostelData = response.data
      setHostel(hostelData)
      
      // Set form values properly
      const formValues = {
        name: hostelData.name || '',
        location: hostelData.location || '',
        description: hostelData.description || '',
        price: hostelData.price || 0,
        priceType: hostelData.priceType || 'month',
        sessionPrice: hostelData.sessionPrice || 0,
        availability: hostelData.availability || 'Available',
        rating: hostelData.rating || 0,
        type: hostelData.type || 'PG',
        gender: hostelData.gender || 'Co-ed',
        availableBeds: hostelData.availableBeds || hostelData.availableRooms || 0,
        securityDeposit: hostelData.securityDeposit || 0,
        capacity: hostelData.capacity || '',
        checkIn: hostelData.checkIn || '',
        amenities: hostelData.amenities || [],
        rules: hostelData.rules || [],
        info: hostelData.info && hostelData.info.length > 0 ? hostelData.info : [{ title: '', value: '' }],
        nearbyPlaces: hostelData.nearbyPlaces || {},
        roomTypes: hostelData.roomTypes && hostelData.roomTypes.length > 0 ? hostelData.roomTypes : [{ name: '', description: '' }],
        reviews: hostelData.reviews?.map(review => ({
          ...review,
          reviewDate: review.date ? dayjs(review.date) : null
        })) || [],
        address: hostelData.contactInfo?.address || '',
        contactPersonName: hostelData.contactInfo?.contactPersonName || '',
        jobTitle: hostelData.contactInfo?.jobTitle || '',
        phone: hostelData.contactInfo?.phone || '',
        coordinates: hostelData.mapCoordinates ? `${hostelData.mapCoordinates.lat}, ${hostelData.mapCoordinates.lng}` : ''
      }
      
      form.setFieldsValue(formValues)

      // Set map data
      if (hostelData.mapCoordinates) {
        setMapCoordinates(hostelData.mapCoordinates)
      }

      // Set existing images
      if (hostelData.images) {
        const existingFiles = hostelData.images.map((img, index) => ({
          uid: `existing-${index}`,
          name: img,
          status: 'done',
          url: `${import.meta.env.VITE_BACKEND_URL}/uploads/${img}`,
          isExisting: true
        }))
        setFileList(existingFiles)
      }
      
      // Set profile image if exists
      if (hostelData.contactInfo?.profileImage) {
        setProfileImage({
          uid: 'profile-existing',
          name: hostelData.contactInfo.profileImage,
          status: 'done',
          url: `${import.meta.env.VITE_BACKEND_URL}/uploads/${hostelData.contactInfo.profileImage}`,
          isExisting: true
        })
      }
      
      console.log('Loaded hostel nearbyPlaces:', hostelData.nearbyPlaces)
    } catch (error) {
      message.error('Failed to fetch hostel details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const formData = new FormData()
      
      // Basic fields
      Object.keys(values).forEach(key => {
        if (['amenities', 'rules'].includes(key)) {
          formData.append(key, JSON.stringify(values[key] || []))
        } else if (key === 'info') {
          const validInfo = values[key]?.filter(item => item.title && item.value) || []
          formData.append(key, JSON.stringify(validInfo))
        } else if (key === 'nearbyPlaces') {
          const nearbyData = values[key] || {}
          formData.append('nearbyPlaces', JSON.stringify(nearbyData))
        } else if (key === 'coordinates') {
          // Skip coordinates field as it's handled separately
          return
        } else if (key === 'roomTypes') {
          const validRoomTypes = values[key]?.filter(item => item.name) || []
          formData.append(key, JSON.stringify(validRoomTypes))
        } else if (key === 'reviews') {
          const validReviews = values[key]?.filter(item => item.name && item.comment)?.map(review => ({
            ...review,
            date: review.reviewDate ? review.reviewDate.format('YYYY-MM-DD') : review.date
          })) || []
          formData.append(key, JSON.stringify(validReviews))
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })

      // Handle map data from coordinates field
      if (values.coordinates) {
        const coords = values.coordinates.split(',').map(c => c.trim())
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const mapCoords = { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) }
          formData.append('mapCoordinates', JSON.stringify(mapCoords))
        }
      } else if (mapCoordinates && mapCoordinates.lat && mapCoordinates.lng) {
        formData.append('mapCoordinates', JSON.stringify(mapCoordinates))
      }

      // Handle images smartly
      const newImages = fileList.filter(file => file.originFileObj)
      const keepImages = fileList.filter(file => file.isExisting && file.status === 'done')
      
      // Add new image files
      newImages.forEach(file => {
        formData.append('images', file.originFileObj)
      })
      
      // Handle profile image
      if (profileImage && profileImage.originFileObj) {
        formData.append('profileImage', profileImage.originFileObj)
      } else if (profileImage && profileImage.isExisting) {
        formData.append('existingProfileImage', profileImage.name)
      }
      
      // Send final image list (existing + new)
      const finalImageNames = [
        ...keepImages.map(file => file.name),
        ...newImages.map(file => file.name || `new-${Date.now()}`)
      ]
      formData.append('finalImages', JSON.stringify(finalImageNames))

      // Debug: Log what we're sending
      console.log('Sending update data:')
      console.log('- Name:', values.name)
      console.log('- Description:', values.description)
      console.log('- Price:', values.price)
      console.log('- Images:', finalImageNames)
      
      let response
      if (id && id !== 'new') {
        response = await hostelAPI.update(id, formData)
        console.log('Update response:', response.data)
        message.success('Hostel updated successfully')
      } else {
        response = await hostelAPI.create(formData)
        console.log('Create response:', response.data)
        message.success('Hostel created successfully')
      }
      
      // Force complete refresh of all caches and data
      forceRefresh()
      hostelAPI.clearCache()
      invalidateData('hostels')
      invalidateData('homepage')
      invalidateData('dashboard')
      
      console.log('Update completed, all caches cleared, navigating back...')
      
      // Navigate back
      navigate('/admin/hostels', { replace: true })
    } catch (error) {

      message.error(`Failed to save hostel: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handleProfileImageChange = ({ fileList: newFileList }) => {
    setProfileImage(newFileList[0] || null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/hostels')}
                type="text"
                className="hover:bg-gray-100"
              >
                Back
              </Button>
              <div>
                <Title level={2} className="mb-0">
                  {id === 'new' ? '🏠 Add New Hostel' : '✏️ Edit Hostel'}
                </Title>
                <Text type="secondary">Fill in the details to create an amazing hostel listing</Text>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button size="large" onClick={() => navigate('/admin/hostels')}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                form="hostel-form"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
              >
                {id === 'new' ? 'Create Hostel' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        <Form
          id="hostel-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-8"
        >
        {/* Basic Information */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <span className="text-lg font-semibold">Basic Information</span>
            </div>
          }
          className="shadow-lg border-0 rounded-xl overflow-hidden"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Hostel Name" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="address" label="Full Address">
                <TextArea rows={2} placeholder="Complete address with landmarks" />
              </Form.Item>
            </Col>
          </Row>

          {/* Map Coordinates */}
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="coordinates" label="Map Coordinates (Latitude, Longitude)">
                <Input 
                  placeholder="28.464385338386865, 77.49939996773989"
                  onChange={(e) => {
                    const coords = e.target.value.split(',').map(c => c.trim())
                    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                      setMapCoordinates({ lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) })
                    }
                  }}
                />
              </Form.Item>
              {mapCoordinates.lat && mapCoordinates.lng && (
                <div className="mb-4">
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: '8px' }}
                    src={`https://maps.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}&hl=en&z=15&output=embed`}
                    allowFullScreen
                  />
                </div>
              )}
            </Col>
          </Row>
          
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="priceType" label="Pricing Type" rules={[{ required: true }]}>
                <Select size="large" defaultValue="month">
                  <Select.Option value="month">Per Month</Select.Option>
                  <Select.Option value="session">Per Session</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={9}>
              <Form.Item 
                noStyle 
                shouldUpdate={(prevValues, currentValues) => prevValues.priceType !== currentValues.priceType}
              >
                {({ getFieldValue }) => {
                  const priceType = getFieldValue('priceType') || 'month'
                  return (
                    <Form.Item 
                      name="price" 
                      label={`Price (per ${priceType})`} 
                      rules={[{ required: true }]}
                    >
                      <InputNumber 
                        size="large" 
                        style={{ width: '100%' }} 
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>
                  )
                }}
              </Form.Item>
            </Col>
            <Col xs={24} md={9}>
              <Form.Item 
                noStyle 
                shouldUpdate={(prevValues, currentValues) => prevValues.priceType !== currentValues.priceType}
              >
                {({ getFieldValue }) => {
                  const priceType = getFieldValue('priceType') || 'month'
                  return priceType === 'month' ? (
                    <Form.Item name="sessionPrice" label="Session Price (optional)">
                      <InputNumber 
                        size="large" 
                        style={{ width: '100%' }} 
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        placeholder="Price per session"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="sessionPrice" label="Monthly Price (optional)">
                      <InputNumber 
                        size="large" 
                        style={{ width: '100%' }} 
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        placeholder="Price per month"
                      />
                    </Form.Item>
                  )
                }}
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="availability" label="Availability" rules={[{ required: true }]}>
                <Select size="large">
                  <Select.Option value="Available">Available</Select.Option>
                  <Select.Option value="Limited">Limited</Select.Option>
                  <Select.Option value="Full">Full</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="rating" label="Rating">
                <InputNumber 
                  size="large" 
                  style={{ width: '100%' }} 
                  min={0} 
                  max={5} 
                  step={0.1}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Hostel Details */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <span className="text-lg font-semibold">Hostel Details</span>
            </div>
          }
          className="shadow-lg border-0 rounded-xl overflow-hidden"
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="type" label="Hostel Type">
                <Select size="large">
                  <Select.Option value="PG">PG</Select.Option>
                  <Select.Option value="Hostel">Hostel</Select.Option>
                  <Select.Option value="Apartment">Apartment</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="gender" label="Gender Preference">
                <Select size="large">
                  <Select.Option value="Boys">Boys</Select.Option>
                  <Select.Option value="Girls">Girls</Select.Option>
                  <Select.Option value="Co-ed">Co-ed</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="availableBeds" label="Available Beds">
                <InputNumber size="large" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="securityDeposit" label="Security Deposit">
                <InputNumber 
                  size="large" 
                  style={{ width: '100%' }} 
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="capacity" label="Capacity">
                <Input size="large" placeholder="e.g., 50+ Students" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="checkIn" label="Check-in Time">
                <Input size="large" placeholder="e.g., Flexible timing" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Contact Information */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <span className="text-lg font-semibold">Contact Information</span>
            </div>
          }
          className="shadow-lg border-0 rounded-xl overflow-hidden"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="contactPersonName" label="Contact Person Name">
                <Input size="large" placeholder="e.g., John Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="jobTitle" label="Job Title">
                <Input size="large" placeholder="e.g., Property Manager" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input size="large" placeholder="e.g., +91 9876543210" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Profile Image">
                <Upload
                  listType="picture-card"
                  fileList={profileImage ? [profileImage] : []}
                  onChange={handleProfileImageChange}
                  beforeUpload={() => false}
                  accept="image/*"
                  maxCount={1}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false
                  }}
                >
                  {!profileImage && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload Profile</div>
                    </div>
                  )}
                </Upload>
                <div className="text-sm text-gray-500 mt-2">
                  Upload contact person's profile image. Recommended size: 200x200px
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Amenities & Rules */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">4</span>
              </div>
              <span className="text-lg font-semibold">Amenities & Rules</span>
            </div>
          }
          className="shadow-lg border-0 rounded-xl overflow-hidden"
        >
          <Form.Item name="amenities" label="Amenities">
            <Select
              mode="tags"
              size="large"
              placeholder="Add amenities"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item name="rules" label="Rules">
            <Select
              mode="tags"
              size="large"
              placeholder="Add rules"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        <Card title="Additional Information" className="mb-6">
          <Form.List name="info">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label={key === 0 ? 'Title' : ''}
                      >
                        <Input placeholder="e.g., Security Deposit" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        label={key === 0 ? 'Value' : ''}
                      >
                        <Input placeholder="e.g., ₹10,000" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      {fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => remove(name)}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add Info Item
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="Nearby Places" className="mb-6">
          <Form.Item name="nearbyPlaces">
            <NearbyPlacesSelector coordinates={mapCoordinates} />
          </Form.Item>
        </Card>

        <Card title="Room Types" className="mb-6">
          <Form.List name="roomTypes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label={key === 0 ? 'Room Type' : ''}
                      >
                        <Input placeholder="e.g., Single" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label={key === 0 ? 'Description' : ''}
                      >
                        <Input placeholder="e.g., Private room with attached bathroom" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      {fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => remove(name)}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add Room Type
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="Customer Reviews" className="mb-6">
          <Form.List name="reviews">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Review #{index + 1}</span>
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />} 
                        onClick={() => remove(name)}
                      >
                        Delete
                      </Button>
                    </div>
                    
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Customer Name"
                          rules={[{ required: true, message: 'Name required' }]}
                        >
                          <Input placeholder="John Doe" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'rating']}
                          label="Rating (1-5 stars)"
                          rules={[{ required: true, message: 'Rating required' }]}
                        >
                          <InputNumber 
                            min={1} 
                            max={5} 
                            style={{ width: '100%' }}
                            placeholder="5"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'reviewDate']}
                          label="Review Date"
                          rules={[{ required: true, message: 'Date required' }]}
                        >
                          <DatePicker 
                            style={{ width: '100%' }}
                            placeholder="Select date"
                            format="YYYY-MM-DD"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'comment']}
                      label="Review Comment"
                      rules={[{ required: true, message: 'Comment required' }]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Great place to stay! Clean rooms and friendly staff..."
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reviews added yet</p>
                  </div>
                )}
                
                <Button 
                  type="dashed" 
                  onClick={() => add({ rating: 5 })} 
                  icon={<PlusOutlined />}
                  size="large"
                  className="w-full mt-4"
                >
                  Add Customer Review
                </Button>
              </div>
            )}
          </Form.List>
        </Card>

        <Card title="Images" className="mb-6">
          <Form.Item name="images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              multiple
              accept="image/*"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false
              }}
            >
              {fileList.length >= 10 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <div className="text-sm text-gray-500 mt-2">
              Upload any size images. Supported formats: JPG, PNG, WebP, GIF, BMP
            </div>
          </Form.Item>
        </Card>

        <Card className="mb-6">
          <Space size="large">
            <Button 
              type="primary" 
              size="large" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              {id === 'new' ? 'Create Hostel' : 'Update Hostel'}
            </Button>
            <Button 
              size="large" 
              onClick={() => navigate('/admin/hostels')}
            >
              Cancel
            </Button>
          </Space>
        </Card>
        </Form>
      </div>
    </div>
  )
}

export default AdminHostelEdit