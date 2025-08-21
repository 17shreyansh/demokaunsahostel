import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Form, Input, Select, Upload, Button, Space, message, 
  Row, Col, Divider, Typography, InputNumber, Tag, DatePicker
} from 'antd'
import {
  SaveOutlined, ArrowLeftOutlined, UploadOutlined, PlusOutlined, 
  DeleteOutlined, EnvironmentOutlined
} from '@ant-design/icons'
import { hostelAPI } from '../services/api'
import InteractiveMap from '../components/InteractiveMap'

const { Title, Text } = Typography
const { TextArea } = Input

const AdminHostelEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [hostel, setHostel] = useState(null)
  const [fileList, setFileList] = useState([])
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
      
      // Set form values
      form.setFieldsValue({
        ...hostelData,
        amenities: hostelData.amenities || [],
        rules: hostelData.rules || [],
        info: hostelData.info || [{ title: '', value: '' }],
        nearbyEducational: hostelData.nearbyPlaces?.educational || [{ name: '', distance: '' }],
        nearbyOffices: hostelData.nearbyPlaces?.offices || [{ name: '', distance: '' }],
        roomTypes: hostelData.roomTypes || [{ name: '', description: '' }],
        reviews: hostelData.reviews || [],
        address: hostelData.contactInfo?.address || ''
      })

      // Set map data
      if (hostelData.mapCoordinates) {
        setMapCoordinates(hostelData.mapCoordinates)
      }

      // Set existing images
      if (hostelData.images) {
        const existingFiles = hostelData.images.map((img, index) => ({
          uid: index,
          name: img,
          status: 'done',
          url: `http://localhost:5000/uploads/${img}`
        }))
        setFileList(existingFiles)
      }
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
        } else if (key === 'nearbyEducational') {
          const validPlaces = values[key]?.filter(item => item.name && item.distance) || []
          formData.append('nearbyEducational', JSON.stringify(validPlaces))
        } else if (key === 'nearbyOffices') {
          const validPlaces = values[key]?.filter(item => item.name && item.distance) || []
          formData.append('nearbyOffices', JSON.stringify(validPlaces))
        } else if (key === 'roomTypes') {
          const validRoomTypes = values[key]?.filter(item => item.name) || []
          formData.append(key, JSON.stringify(validRoomTypes))
        } else if (key === 'reviews') {
          const validReviews = values[key]?.filter(item => item.name && item.comment).map(review => {
            if (review.reviewDate) {
              const now = new Date()
              const reviewDate = new Date(review.reviewDate)
              const diffTime = Math.abs(now - reviewDate)
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              
              let dateText
              if (diffDays === 1) dateText = '1 day ago'
              else if (diffDays < 7) dateText = `${diffDays} days ago`
              else if (diffDays < 30) dateText = `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`
              else dateText = `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`
              
              return { ...review, date: dateText }
            }
            return review
          }) || []
          formData.append(key, JSON.stringify(validReviews))
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })

      // Handle map data
      if (mapCoordinates && mapCoordinates.lat && mapCoordinates.lng) {
        formData.append('mapCoordinates', JSON.stringify(mapCoordinates))
      }

      // Handle images
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj)
        }
      })

      if (id && id !== 'new') {
        await hostelAPI.update(id, formData)
        message.success('Hostel updated successfully')
      } else {
        await hostelAPI.create(formData)
        message.success('Hostel created successfully')
      }
      
      navigate('/admin/hostels')
    } catch (error) {
      message.error('Failed to save hostel')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/hostels')}
          className="mb-4"
        >
          Back to Hostels
        </Button>
        <Title level={2}>
          {id === 'new' ? 'Add New Hostel' : 'Edit Hostel'}
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6"
      >
        <Card title="Basic Information" className="mb-6">
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

          {/* Interactive Map Section */}
          <Row gutter={16}>
            <Col xs={24}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <EnvironmentOutlined className="text-lg text-blue-600" />
                  <span className="font-medium">Interactive Map Location</span>
                </div>
                <InteractiveMap
                  coordinates={mapCoordinates}
                  onCoordinatesChange={setMapCoordinates}
                  address={form.getFieldValue('address')}
                />
              </div>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="price" label="Price (per month)" rules={[{ required: true }]}>
                <InputNumber 
                  size="large" 
                  style={{ width: '100%' }} 
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
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

        <Card title="Hostel Details" className="mb-6">
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
              <Form.Item name="availableRooms" label="Available Rooms">
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
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
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

        <Card title="Amenities & Rules" className="mb-6">
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
          <Title level={5}>Educational Institutions</Title>
          <Form.List name="nearbyEducational">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label={key === 0 ? 'Institution Name' : ''}
                      >
                        <Input placeholder="e.g., Galgotias University" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'distance']}
                        label={key === 0 ? 'Distance' : ''}
                      >
                        <Input placeholder="e.g., 2 km" />
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
                  Add Educational Institution
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Title level={5}>Offices & IT Parks</Title>
          <Form.List name="nearbyOffices">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label={key === 0 ? 'Office Name' : ''}
                      >
                        <Input placeholder="e.g., Wipro" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'distance']}
                        label={key === 0 ? 'Distance' : ''}
                      >
                        <Input placeholder="e.g., 4 km" />
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
                  Add Office/IT Park
                </Button>
              </>
            )}
          </Form.List>
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
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
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
  )
}

export default AdminHostelEdit