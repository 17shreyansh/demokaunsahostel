import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons'
import InteractiveMap from '../components/InteractiveMap'

const { Option } = Select

const AdminNearbyPlaces = () => {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [form] = Form.useForm()
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.6139, lng: 77.2090 })

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/nearbyplaces')
      const data = await response.json()
      setPlaces(data)
    } catch (error) {
      message.error('Failed to fetch places')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingPlace(null)
    setMapCoordinates({ lat: 28.6139, lng: 77.2090 })
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (place) => {
    setEditingPlace(place)
    setMapCoordinates(place.mapCoordinates)
    form.setFieldsValue(place)
    setModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        mapCoordinates
      }

      const url = editingPlace 
        ? `http://localhost:5000/api/nearbyplaces/${editingPlace._id}`
        : 'http://localhost:5000/api/nearbyplaces'
      
      const method = editingPlace ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        message.success(`Place ${editingPlace ? 'updated' : 'created'} successfully`)
        setModalVisible(false)
        fetchPlaces()
      } else {
        message.error('Failed to save place')
      }
    } catch (error) {
      message.error('Failed to save place')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/nearbyplaces/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        message.success('Place deleted successfully')
        fetchPlaces()
      } else {
        message.error('Failed to delete place')
      }
    } catch (error) {
      message.error('Failed to delete place')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'office' ? 'blue' : 'green'}>
          {category === 'office' ? 'IT Parks & Offices' : 'Educational'}
        </Tag>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this place?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const officeTypes = ['IT Park', 'Office Complex', 'Tech Hub', 'Business Center', 'Corporate Office']
  const educationalTypes = ['University', 'College', 'Institute', 'School', 'Training Center']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nearby Places Management</h1>
          <p className="text-gray-600">Manage IT Parks, Offices & Educational Institutions</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add New Place
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={places}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPlace ? 'Edit Place' : 'Add New Place'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter place name" />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              <Option value="office">IT Parks & Offices</Option>
              <Option value="educational">Educational Institutions</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            noStyle 
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.category !== currentValues.category
            }
          >
            {({ getFieldValue }) => {
              const category = getFieldValue('category')
              const types = category === 'office' ? officeTypes : educationalTypes
              
              return (
                <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                  <Select placeholder="Select type">
                    {types.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item label="Map Location" required>
            <InteractiveMap
              coordinates={mapCoordinates}
              onCoordinatesChange={setMapCoordinates}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingPlace ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminNearbyPlaces