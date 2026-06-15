import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, Input, Select, Upload, Button, Card, Typography, 
  Result, Steps, message, Row, Col, Alert, Spin 
} from 'antd';
import { 
  InboxOutlined, CheckCircleFilled, ClockCircleFilled, 
  CloseCircleFilled, BankOutlined, IdcardOutlined, ShopOutlined
} from '@ant-design/icons';
import { useHostelManager } from '../contexts/HostelManagerContext';
import HostelManagerLayout from '../layouts/HostelManagerLayout';

const { Title, Text } = Typography;
const { Dragger } = Upload;

/* -------------------------------------------------------------------------- */
/* STATE MICRO-COMPONENTS                                                     */
/* -------------------------------------------------------------------------- */

const VerifiedState = ({ verifiedAt, onDashboard }) => (
  <div className="max-w-2xl mx-auto py-12">
    <Card className="shadow-sm border-emerald-100 rounded-2xl" bodyStyle={{ padding: '48px 24px' }}>
      <Result
        icon={<CheckCircleFilled className="text-emerald-500" />}
        title={<span className="text-2xl font-extrabold text-slate-900">Compliance Verified</span>}
        subTitle={
          <div className="mt-2 text-slate-500">
            Your business account was successfully verified on <strong className="text-slate-700">
              {new Date(verifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </strong>. You now have unrestricted access to all platform features.
          </div>
        }
        extra={[
          <Button type="primary" key="console" size="large" onClick={onDashboard} className="bg-slate-900 hover:bg-slate-800">
            Go to Dashboard
          </Button>
        ]}
      />
    </Card>
  </div>
);

const UnderReviewState = ({ submittedAt, companyDetails, bankDetails }) => (
  <div className="max-w-3xl mx-auto py-8">
    <Card className="shadow-sm border-blue-100 rounded-2xl mb-6">
      <Result
        icon={<ClockCircleFilled className="text-blue-500" />}
        title={<span className="text-2xl font-extrabold text-slate-900">Verification Under Review</span>}
        subTitle={
          <span className="text-slate-500">
            Submitted on {new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.
            Our compliance team is currently reviewing your documents.
          </span>
        }
      />
    </Card>

    <Row gutter={[24, 24]}>
      <Col xs={24} md={12}>
        <Card title="Business Details" bordered={false} className="shadow-sm rounded-xl h-full" size="small">
          <div className="space-y-4">
            <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">Company Name</Text><Text strong>{companyDetails?.companyName || 'N/A'}</Text></div>
            <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">Entity Type</Text><Text strong className="capitalize">{companyDetails?.companyType || 'N/A'}</Text></div>
            <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">GST Identification</Text><Text strong>{companyDetails?.gstNumber || 'N/A'}</Text></div>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Banking Information" bordered={false} className="shadow-sm rounded-xl h-full" size="small">
          <div className="space-y-4">
            <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">Account Holder</Text><Text strong>{bankDetails?.accountHolderName || 'N/A'}</Text></div>
            <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">Account Number</Text><Text strong>•••• {String(bankDetails?.accountNumber).slice(-4) || 'N/A'}</Text></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">Bank Name</Text><Text strong>{bankDetails?.bankName || 'N/A'}</Text></div>
              <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">IFSC</Text><Text strong>{bankDetails?.ifscCode || 'N/A'}</Text></div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN KYC FORM COMPONENT                                                    */
/* -------------------------------------------------------------------------- */

const HostelManagerKYC = () => {
  const [form] = Form.useForm();
  const { submitKYC, manager } = useHostelManager();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [panFile, setPanFile] = useState([]);
  const [bankFile, setBankFile] = useState([]);

  // Ensure fresh form mounting if the user's KYC state changes
  useEffect(() => {
    form.resetFields();
    setPanFile([]);
    setBankFile([]);
  }, [manager?.kyc?.status, form]);

  const onFinish = async (values) => {
    if (panFile.length === 0 || bankFile.length === 0) {
      message.error('Both PAN Card and Bank Proof documents are required.');
      return;
    }

    setLoading(true);
    const hideMessage = message.loading('Encrypting and submitting compliance data...', 0);

    try {
      const data = new FormData();
      Object.keys(values).forEach(key => data.append(key, values[key]));
      data.append('panCard', panFile[0].originFileObj);
      data.append('bankProof', bankFile[0].originFileObj);

      await submitKYC(data);
      message.success('Compliance data submitted successfully.');
      navigate('/hostel-manager/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Verification submission failed. Please try again.');
    } finally {
      hideMessage();
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: 'image/jpeg,image/png,application/pdf'
  };

  // State Routing
  const status = manager?.kyc?.status || 'pending';

  if (status === 'verified') {
    return (
      <HostelManagerLayout>
        <VerifiedState verifiedAt={manager.kyc.verifiedAt} onDashboard={() => navigate('/hostel-manager/dashboard')} />
      </HostelManagerLayout>
    );
  }

  if (status === 'submitted') {
    return (
      <HostelManagerLayout>
        <UnderReviewState 
          submittedAt={manager.kyc.submittedAt} 
          companyDetails={manager.kyc.companyDetails} 
          bankDetails={manager.kyc.bankDetails} 
        />
      </HostelManagerLayout>
    );
  }

  // Render Form for Pending or Rejected states
  return (
    <HostelManagerLayout>
      <div className="max-w-4xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="mb-8">
          <Title level={2} className="!m-0 text-slate-900">Identity Verification (KYC)</Title>
          <Text type="secondary" className="text-base">Secure your account to begin accepting reservations.</Text>
        </div>

        {/* Rejection Alert */}
        {status === 'rejected' && (
          <Alert
            message="Verification Failed"
            description={
              <div>
                <p className="mb-2">Your previous submission on {new Date(manager.kyc.rejectedAt || manager.kyc.submittedAt).toLocaleDateString('en-US')} was rejected for the following reason:</p>
                <div className="bg-white p-3 rounded border border-red-200 font-medium text-slate-800">
                  {manager.kyc.rejectionReason || 'No reason provided by compliance officer.'}
                </div>
                <p className="mt-2 mb-0">Please correct the highlighted issues and resubmit the form below.</p>
              </div>
            }
            type="error"
            showIcon
            icon={<CloseCircleFilled />}
            className="mb-8 rounded-xl border-red-200"
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Progress Tracker */}
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
            <Steps
              current={status === 'rejected' ? 0 : 0}
              items={[
                { title: 'Business Identity', icon: <ShopOutlined /> },
                { title: 'Documentation', icon: <IdcardOutlined /> },
                { title: 'Bank Account', icon: <BankOutlined /> }
              ]}
              className="max-w-2xl mx-auto"
            />
          </div>

          {/* Form Engine */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="p-8"
            requiredMark={false}
          >
            {/* Step 1: Business Details */}
            <div className="mb-10">
              <Title level={5} className="!mb-6 text-slate-800 border-b border-slate-100 pb-2">1. Business Identity</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="companyName" label={<span className="font-semibold text-slate-700">Registered Entity Name</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="As per legal documents" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="companyType" label={<span className="font-semibold text-slate-700">Entity Type</span>} rules={[{ required: true }]}>
                    <Select size="large" placeholder="Select legal structure">
                      <Select.Option value="proprietorship">Sole Proprietorship</Select.Option>
                      <Select.Option value="partnership">Partnership</Select.Option>
                      <Select.Option value="llp">Limited Liability Partnership (LLP)</Select.Option>
                      <Select.Option value="private-limited">Private Limited</Select.Option>
                      <Select.Option value="public-limited">Public Limited</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item 
                    name="gstNumber" 
                    label={<span className="font-semibold text-slate-700">GST Identification Number (GSTIN)</span>} 
                    rules={[
                      { required: true, message: 'GSTIN is required' },
                      { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GSTIN format' }
                    ]}
                  >
                    <Input size="large" placeholder="22AAAAA0000A1Z5" className="uppercase" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Step 2: Documents */}
            <div className="mb-10">
              <Title level={5} className="!mb-6 text-slate-800 border-b border-slate-100 pb-2">2. Required Documentation</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-semibold text-slate-700">PAN Card (Entity or Proprietor)</span>} required>
                    <Dragger 
                      {...uploadProps} 
                      fileList={panFile}
                      onChange={({ fileList }) => setPanFile(fileList)}
                      className="bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <p className="ant-upload-drag-icon text-blue-500"><InboxOutlined /></p>
                      <p className="ant-upload-text font-medium text-slate-700">Click or drag file to this area</p>
                      <p className="ant-upload-hint text-xs text-slate-500">Supports PDF, JPG, PNG (Max 10MB)</p>
                    </Dragger>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-semibold text-slate-700">Bank Verification (Cancelled Cheque/Passbook)</span>} required>
                    <Dragger 
                      {...uploadProps} 
                      fileList={bankFile}
                      onChange={({ fileList }) => setBankFile(fileList)}
                      className="bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <p className="ant-upload-drag-icon text-blue-500"><InboxOutlined /></p>
                      <p className="ant-upload-text font-medium text-slate-700">Click or drag file to this area</p>
                      <p className="ant-upload-hint text-xs text-slate-500">Must show Account Number and IFSC</p>
                    </Dragger>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Step 3: Bank Details */}
            <div className="mb-10">
              <Title level={5} className="!mb-6 text-slate-800 border-b border-slate-100 pb-2">3. Settlement Bank Account</Title>
              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item name="accountHolderName" label={<span className="font-semibold text-slate-700">Account Holder Name</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="Exact name as registered with the bank" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="accountNumber" 
                    label={<span className="font-semibold text-slate-700">Account Number</span>} 
                    rules={[
                      { required: true, message: 'Required' },
                      { pattern: /^[0-9]{9,18}$/, message: 'Must be 9-18 digits' }
                    ]}
                  >
                    <Input.Password size="large" placeholder="Enter account number" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="ifscCode" 
                    label={<span className="font-semibold text-slate-700">IFSC Code</span>} 
                    rules={[
                      { required: true, message: 'Required' },
                      { pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC format' }
                    ]}
                  >
                    <Input size="large" placeholder="SBIN0001234" className="uppercase" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="bankName" label={<span className="font-semibold text-slate-700">Bank Name</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="e.g., State Bank of India" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <Text type="secondary" className="text-xs max-w-sm hidden sm:block">
                By submitting this form, you confirm that all provided details match your legal documents. Fraudulent submissions may result in account termination.
              </Text>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button size="large" onClick={() => navigate('/hostel-manager/dashboard')} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  htmlType="submit" 
                  loading={loading}
                  className="bg-slate-900 hover:bg-slate-800 min-w-[200px]"
                >
                  {status === 'rejected' ? 'Resubmit Verification' : 'Submit for Verification'}
                </Button>
              </div>
            </div>

          </Form>
        </div>
      </div>
    </HostelManagerLayout>
  );
};

export default HostelManagerKYC;