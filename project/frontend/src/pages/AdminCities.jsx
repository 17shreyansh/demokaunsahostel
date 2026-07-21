import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Popconfirm, message, Tag, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { cityAPI } from '../services/api';

const AdminCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await cityAPI.getAll(true);
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      message.error('Failed to load cities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (city = null) => {
    setEditingCity(city);
    if (city) {
      form.setFieldsValue({
        name: city.name,
        active: city.active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ active: true });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCity(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCity) {
        await cityAPI.update(editingCity._id, values);
        message.success('City updated successfully');
      } else {
        await cityAPI.create(values);
        message.success('City created successfully');
      }
      setIsModalVisible(false);
      // Refresh the table quietly
      const response = await cityAPI.getAll(true);
      setCities(response.data);
    } catch (error) {
      console.error('Error saving city:', error);
      message.error(error.response?.data?.message || 'Failed to save city.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await cityAPI.delete(id);
      message.success('City deleted successfully');
      // Update state locally for instant UI response (optimistic update)
      setCities((prevCities) => prevCities.filter(city => city._id !== id));
    } catch (error) {
      console.error('Error deleting city:', error);
      message.error('Failed to delete city.');
    }
  };

  const toggleCityStatus = async (record, checked) => {
    try {
      // Optimistic update
      setCities((prev) => 
        prev.map(city => city._id === record._id ? { ...city, active: checked } : city)
      );
      
      await cityAPI.update(record._id, { ...record, active: checked });
      message.success(`City marked as ${checked ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('Error toggling city status:', error);
      message.error('Failed to update city status.');
      // Revert optimistic update on error
      fetchCities();
    }
  };

  const columns = [
    {
      title: 'City Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <Space>
          <EnvironmentOutlined className="text-blue-500" />
          <span className="font-medium text-gray-800">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active, record) => (
        <Space>
          <Switch 
            checked={active} 
            onChange={(checked) => toggleCityStatus(record, checked)} 
            size="small" 
          />
          <Tag color={active ? 'green' : 'red'}>
            {active ? 'Active' : 'Inactive'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined className="text-blue-600" />} 
            onClick={() => showModal(record)} 
          />
          <Popconfirm
            title="Delete this city?"
            description="Are you sure you want to delete this city?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card 
        title={<span className="text-xl font-bold text-gray-800">City Management</span>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
            size="large"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add City
          </Button>
        }
        className="shadow-sm rounded-xl overflow-hidden border border-gray-100"
        styles={{ header: { borderBottom: '1px solid #f0f0f0', backgroundColor: '#fcfcfc', padding: '16px 24px' }, body: { padding: 0 } }}
      >
        <Table 
          columns={columns} 
          dataSource={cities} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          <div className="text-lg font-bold">
            {editingCity ? 'Edit City' : 'Add New City'}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label={<span className="font-medium text-gray-700">City Name</span>}
            rules={[
              { required: true, message: 'Please input the city name!' },
              { whitespace: true, message: 'City name cannot be empty!' }
            ]}
          >
            <Input 
              placeholder="e.g. Greater Noida" 
              size="large" 
              prefix={<EnvironmentOutlined className="text-gray-400 mr-2" />}
            />
          </Form.Item>

          <Form.Item
            name="active"
            valuePropName="checked"
          >
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <Switch />
                <span className="font-medium text-gray-700">Active Status</span>
              </div>
              <span className="text-xs text-gray-500 mt-2">
                Inactive cities will not appear in dropdowns across the application.
              </span>
            </div>
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <Space>
              <Button onClick={handleCancel} size="large">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" size="large" className="bg-blue-600">
                {editingCity ? 'Update City' : 'Create City'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCities;
