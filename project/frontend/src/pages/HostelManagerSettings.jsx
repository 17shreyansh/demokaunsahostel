import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, message, Divider } from 'antd';
import { FiUser, FiMail, FiPhone, FiLock, FiShield } from 'react-icons/fi';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';
import { hostelManagerAPI } from '../services/api';

const { Title, Text } = Typography;

const HostelManagerSettings = () => {
  const { manager, checkAuth } = useHostelManager();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Initialize Profile Form
  useEffect(() => {
    if (manager) {
      profileForm.setFieldsValue({
        name: manager.name || '',
        email: manager.email || '',
        phone: manager.phone || ''
      });
    }
  }, [manager, profileForm]);

  const handleProfileUpdate = async (values) => {
    setLoadingProfile(true);
    try {
      await hostelManagerAPI.updateProfile({
        name: values.name,
        phone: values.phone
      });
      await checkAuth();
      message.success('Profile information updated successfully.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoadingPassword(true);
    try {
      await hostelManagerAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      passwordForm.resetFields();
      message.success('Security credentials updated successfully.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update security credentials.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <HostelManagerLayout>
      <div className="max-w-4xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="mb-8">
          <Title level={3} className="!m-0 text-slate-900">Account Configuration</Title>
          <Text type="secondary" className="font-medium text-slate-500">
            Manage your personal profile and security preferences.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Profile Settings Card */}
          <Col xs={24}>
            <Card 
              title={<span className="flex items-center gap-2 text-slate-800"><FiUser className="text-blue-500" /> Identity Information</span>}
              bordered={false} 
              className="shadow-sm border border-slate-200 rounded-2xl"
            >
              <Form 
                form={profileForm} 
                layout="vertical" 
                onFinish={handleProfileUpdate}
                requiredMark="optional"
              >
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="name" 
                      label={<span className="font-semibold text-slate-700">Full Name</span>} 
                      rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                      <Input prefix={<FiUser className="text-slate-400 mr-1" />} size="large" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="phone" 
                      label={<span className="font-semibold text-slate-700">Phone Number</span>}
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <Input prefix={<FiPhone className="text-slate-400 mr-1" />} size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item 
                      name="email" 
                      label={<span className="font-semibold text-slate-700">Registered Email Address</span>}
                      extra="Your email address is used for authentication and cannot be changed directly."
                    >
                      <Input 
                        prefix={<FiMail className="text-slate-400 mr-1" />} 
                        size="large" 
                        disabled 
                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider className="my-4" />
                
                <div className="flex justify-end">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={loadingProfile}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold px-8"
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          {/* Security Settings Card */}
          <Col xs={24}>
            <Card 
              title={<span className="flex items-center gap-2 text-slate-800"><FiShield className="text-emerald-500" /> Security & Authentication</span>}
              bordered={false} 
              className="shadow-sm border border-slate-200 rounded-2xl"
            >
              <Form 
                form={passwordForm} 
                layout="vertical" 
                onFinish={handlePasswordChange}
                requiredMark="optional"
              >
                <Row gutter={24}>
                  <Col xs={24}>
                    <Form.Item 
                      name="currentPassword" 
                      label={<span className="font-semibold text-slate-700">Current Password</span>} 
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password prefix={<FiLock className="text-slate-400 mr-1" />} size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="newPassword" 
                      label={<span className="font-semibold text-slate-700">New Password</span>} 
                      rules={[
                        { required: true, message: 'Please enter a new password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                      hasFeedback
                    >
                      <Input.Password prefix={<FiLock className="text-slate-400 mr-1" />} size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="confirmPassword" 
                      label={<span className="font-semibold text-slate-700">Confirm New Password</span>} 
                      dependencies={['newPassword']}
                      hasFeedback
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match.'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<FiLock className="text-slate-400 mr-1" />} size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider className="my-4" />
                
                <div className="flex justify-end">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={loadingPassword}
                    className="bg-slate-900 hover:bg-slate-800 font-semibold px-8"
                  >
                    Update Password
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

        </Row>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerSettings;