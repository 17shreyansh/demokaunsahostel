import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, Input, Select, Upload, Button, Card, Typography, 
  Result, Steps, message, Row, Col, Alert, Spin 
} from 'antd';
import { 
  Inbox, CheckCircle, Clock, 
  XCircle, Landmark, CreditCard, Store
} from 'lucide-react';
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
        icon={<CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />}
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

const UnderReviewState = ({ submittedAt, bankDetails, paymentDetails }) => (
  <div className="max-w-3xl mx-auto py-8">
    <Card className="shadow-sm border-blue-100 rounded-2xl mb-6">
      <Result
        icon={<Clock className="w-16 h-16 text-blue-500 mx-auto" />}
        title={<span className="text-2xl font-extrabold text-slate-900">Verification Under Review</span>}
        subTitle={
          <span className="text-slate-500">
            Submitted on {new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.
            Our compliance team is currently reviewing your details.
          </span>
        }
      />
    </Card>

    <Row gutter={[24, 24]}>
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
      <Col xs={24} md={12}>
        <Card title="Payment Details" bordered={false} className="shadow-sm rounded-xl h-full" size="small">
          <div className="space-y-4">
            <div><Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">UPI ID</Text><Text strong>{paymentDetails?.upiId || 'N/A'}</Text></div>
            {paymentDetails?.qrCode && (
              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider block mb-2">QR Code</Text>
                <img src={`http://localhost:5000${paymentDetails.qrCode}`} alt="QR Code" className="w-32 h-32 border rounded" />
              </div>
            )}
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
  const [qrFile, setQrFile] = useState([]);

  // Ensure fresh form mounting if the user's KYC state changes
  useEffect(() => {
    form.resetFields();
    setQrFile([]);
  }, [manager?.kyc?.status, form]);

  const onFinish = async (values) => {
    if (qrFile.length === 0) {
      message.error('QR Code image is required.');
      return;
    }

    setLoading(true);
    const hideMessage = message.loading('Submitting KYC details...', 0);

    try {
      const data = new FormData();
      Object.keys(values).forEach(key => data.append(key, values[key]));
      data.append('qrCode', qrFile[0].originFileObj);

      await submitKYC(data);
      message.success('KYC details submitted successfully.');
      navigate('/hostel-manager/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'KYC submission failed. Please try again.');
    } finally {
      hideMessage();
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: 'image/jpeg,image/png'
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
          bankDetails={manager.kyc.bankDetails}
          paymentDetails={manager.kyc.paymentDetails}
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
          <Title level={2} className="!m-0 text-slate-900">Bank & Payment Details (KYC)</Title>
          <Text type="secondary" className="text-base">Setup your payment details to receive bookings.</Text>
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
            icon={<XCircle className="w-4 h-4" />}
            className="mb-8 rounded-xl border-red-200"
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Progress Tracker */}
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
            <Steps
              current={status === 'rejected' ? 0 : 0}
              items={[
                { title: 'Bank Account', icon: <Landmark className="w-4 h-4" /> },
                { title: 'Payment Details', icon: <CreditCard className="w-4 h-4" /> }
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
            {/* Step 1: Bank Details */}
            <div className="mb-10">
              <Title level={5} className="!mb-6 text-slate-800 border-b border-slate-100 pb-2">1. Settlement Bank Account</Title>
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

            {/* Step 2: Payment Details */}
            <div className="mb-10">
              <Title level={5} className="!mb-6 text-slate-800 border-b border-slate-100 pb-2">2. Payment Details</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="upiId" 
                    label={<span className="font-semibold text-slate-700">UPI ID</span>} 
                    rules={[
                      { required: true, message: 'UPI ID is required' },
                      { pattern: /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/, message: 'Invalid UPI ID format' }
                    ]}
                  >
                    <Input size="large" placeholder="yourname@paytm" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-semibold text-slate-700">QR Code Image</span>} required>
                    <Dragger 
                      {...uploadProps} 
                      fileList={qrFile}
                      onChange={({ fileList }) => setQrFile(fileList)}
                      className="bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <p className="ant-upload-drag-icon text-center mt-2">
                        <Inbox className="w-12 h-12 text-blue-500 mx-auto" />
                      </p>
                      <p className="ant-upload-text font-medium text-slate-700">Click or drag QR code to upload</p>
                      <p className="ant-upload-hint text-xs text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                    </Dragger>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <Text type="secondary" className="text-xs max-w-sm hidden sm:block">
                By submitting this form, you confirm that all provided details are accurate and belong to you.
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
                  {status === 'rejected' ? 'Resubmit Details' : 'Submit for Verification'}
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