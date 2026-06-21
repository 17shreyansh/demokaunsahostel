import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  InputNumber, message, Popconfirm, Tag, Spin
} from 'antd';
import { 
  Plus, Edit2, Trash2, LayoutTemplate, Percent, DollarSign 
} from 'lucide-react';
import { installmentTemplateAPI } from '../services/api';

const AdminInstallmentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  
  // Watch the selected type to conditionally render validation
  const selectedType = Form.useWatch('type', form);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await installmentTemplateAPI.getAll();
      setTemplates(res.data);
    } catch (error) {
      message.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAdd = () => {
    setEditingTemplate(null);
    form.resetFields();
    form.setFieldsValue({ 
      type: 'percentage', 
      installments: [{ value: 0, dueDate: '' }] 
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTemplate(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await installmentTemplateAPI.delete(id);
      message.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (values.type === 'percentage') {
        const total = values.installments.reduce((sum, inst) => sum + (inst.value || 0), 0);
        if (total !== 100) {
          message.error(`Percentage values must add up to exactly 100%. Current sum: ${total}%`);
          return;
        }
      }

      if (editingTemplate) {
        await installmentTemplateAPI.update(editingTemplate._id, values);
        message.success('Template updated successfully');
      } else {
        await installmentTemplateAPI.create(values);
        message.success('Template created successfully');
      }
      
      setIsModalVisible(false);
      fetchTemplates();
    } catch (error) {
      if (error.errorFields) return; // Validation error handled by antd
      message.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium text-gray-900">{text}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'percentage' ? 'blue' : 'green'} className="capitalize px-3 py-1 rounded-full">
          {type === 'percentage' ? <Percent size={12} className="inline mr-1" /> : <DollarSign size={12} className="inline mr-1" />}
          {type}
        </Tag>
      )
    },
    {
      title: 'Breakdown',
      key: 'breakdown',
      render: (_, record) => (
        <div className="flex gap-2 flex-wrap">
          {record.installments.map((inst, idx) => (
            <Tag key={idx} className="bg-gray-50 border-gray-200 text-gray-600 rounded">
              {inst.value}{record.type === 'percentage' ? '%' : '₹'}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            type="text" 
            icon={<Edit2 size={16} />} 
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="Delete the template"
            description="Are you sure to delete this template?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 size={16} />} className="hover:bg-red-50" />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Installment Templates</h1>
          <p className="text-gray-500 mt-1">Create and manage reusable installment plans for properties.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          onClick={handleAdd}
          className="bg-blue-600 flex items-center gap-2 h-10 px-5 rounded-lg"
        >
          Create Template
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={templates} 
            rowKey="_id" 
            pagination={false}
          />
        )}
      </div>

      <Modal
        title={<div className="flex items-center gap-2"><LayoutTemplate size={20} className="text-blue-600"/> {editingTemplate ? 'Edit Template' : 'Create Template'}</div>}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Save Template"
        okButtonProps={{ className: 'bg-blue-600' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item 
              name="name" 
              label="Template Name" 
              rules={[{ required: true, message: 'Please enter a name' }]}
            >
              <Input placeholder="e.g., Standard 3-Part Plan" size="large" />
            </Form.Item>
            <Form.Item 
              name="type" 
              label="Plan Type" 
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="percentage">Percentage Based</Select.Option>
                <Select.Option value="fixed">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">Installments</span>
              {selectedType === 'percentage' && (
                <Tag color="blue" className="m-0 rounded-full">Total must be 100%</Tag>
              )}
            </div>

            <Form.List name="installments">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} className="flex gap-3 mb-3 items-start">
                      <div className="w-8 h-10 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-500 font-medium shrink-0">
                        {index + 1}
                      </div>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'value']} 
                        rules={[{ required: true, message: 'Required' }]}
                        className="mb-0 flex-1"
                      >
                        <InputNumber 
                          size="large" 
                          className="w-full"
                          min={1} 
                          max={selectedType === 'percentage' ? 100 : undefined}
                          addonAfter={selectedType === 'percentage' ? '%' : '₹'} 
                          placeholder="Value"
                        />
                      </Form.Item>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'dueDate']}
                        className="mb-0 flex-1"
                      >
                        <Input size="large" placeholder="Due condition (e.g. Admission)" />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<Trash2 size={18} />} 
                          onClick={() => remove(name)}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add({ value: 0, dueDate: '' })} 
                    block 
                    icon={<Plus size={16} />}
                    className="mt-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    Add Installment Split
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInstallmentTemplates;
