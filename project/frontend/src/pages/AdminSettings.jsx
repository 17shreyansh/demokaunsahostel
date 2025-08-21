import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Row, Col, Typography, Divider } from 'antd'
import { KeyOutlined, UserOutlined, SaveOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const AdminSettings = () => {
  const [apiLoading, setApiLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [apiSaved, setApiSaved] = useState(false)
  const [apiForm] = Form.useForm()
  const [profileForm] = Form.useForm()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    console.log('Token from localStorage:', token)
    if (token) {
      fetchProfile()
      checkApiKey()
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log('Fetching profile with token:', token)
      
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('Profile response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data:', data)
        setCurrentUser(data.admin.username)
        profileForm.setFieldsValue({ username: data.admin.username })
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const checkApiKey = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/status/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiSaved(data.configured)
      } else {
        setApiSaved(false)
      }
    } catch (error) {
      setApiSaved(false)
    }
  }

  const handleApiSubmit = async (values) => {
    setApiLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      console.log('API submit with token:', token)
      
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: 'openroute_api_key',
          value: values.apiKey,
          encrypted: true,
          description: 'OpenRouteService API Key for distance calculations',
          category: 'api'
        })
      })

      console.log('Settings response status:', response.status)
      const result = await response.json()
      console.log('Settings response:', result)
      
      if (response.ok) {
        message.success('API Key saved successfully')
        apiForm.resetFields()
        setApiSaved(true)
      } else {
        message.error(result.message || 'Failed to save')
      }
    } catch (error) {
      console.error('API submit error:', error)
      message.error('Failed to save API key')
    } finally {
      setApiLoading(false)
    }
  }

  const handleProfileSubmit = async (values) => {
    setProfileLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })

      const result = await response.json()
      
      if (response.ok) {
        message.success('Profile updated successfully')
        profileForm.setFieldsValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setCurrentUser(values.username || currentUser)
      } else {
        message.error(result.message || 'Failed to update')
      }
    } catch (error) {
      message.error('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '32px' }}>
        Admin Settings
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<><KeyOutlined /> API Configuration</>}>
            <div style={{ marginBottom: 16 }}>
              <Text>Status: </Text>
              <Text strong style={{ color: apiSaved ? '#52c41a' : '#ff4d4f' }}>
                {apiSaved ? '✓ API Key Saved' : '✗ API Key Not Configured'}
              </Text>
            </div>
            <Form form={apiForm} onFinish={handleApiSubmit} layout="vertical">
              <Form.Item
                name="apiKey"
                label="OpenRouteService API Key"
                rules={[{ required: true, message: 'Please enter your API key' }]}
              >
                <Input.Password placeholder="Enter your API key" size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={apiLoading} size="large" block>
                Save API Key
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><UserOutlined /> Profile Management</>}>
            <Text>Current user: <Text strong>{currentUser}</Text></Text>
            <Form form={profileForm} onFinish={handleProfileSubmit} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input placeholder="Enter username" size="large" />
              </Form.Item>
              <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
                <Input.Password placeholder="Current password" size="large" />
              </Form.Item>
              <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
                <Input.Password placeholder="New password" size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Passwords do not match'))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={profileLoading} size="large" block>
                Update Profile
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminSettings