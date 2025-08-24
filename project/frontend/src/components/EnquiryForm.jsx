import { useState, useEffect } from 'react'
import { leadAPI } from '../services/api'
import Select from 'react-select'
import Toast from './Toast'

const EnquiryForm = ({ hostelId, hostelName, source = 'hostel-details', onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    userType: '',
    institution: '',
    course: '',
    checkInDate: '',
    budget: '',
    message: '',
    source: source,
    hostelName: hostelName
  })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const savedData = localStorage.getItem('userEnquiryData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setFormData(prev => ({
        ...prev,
        name: parsed.name || '',
        phone: parsed.phone || '',
        email: parsed.email || '',
        userType: parsed.userType || '',
        institution: parsed.institution || '',
        course: parsed.course || '',
        budget: parsed.budget || '',
        checkInDate: today
      }))
    } else {
      setFormData(prev => ({ ...prev, checkInDate: today }))
    }
  }, [])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.phone.trim()) {
      setToast({ message: 'Phone number is required', type: 'error' })
      return
    }
    
    if (!formData.message.trim()) {
      setToast({ message: 'Message is required', type: 'error' })
      return
    }
    
    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phone.trim())) {
      setToast({ message: 'Please enter a valid 10-digit phone number', type: 'error' })
      return
    }
    
    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setToast({ message: 'Please enter a valid email address', type: 'error' })
        return
      }
    }
    
    // Validate name if provided
    if (formData.name.trim() && formData.name.trim().length < 2) {
      setToast({ message: 'Name must be at least 2 characters long', type: 'error' })
      return
    }
    
    setLoading(true)
    
    try {
      const enquiryData = {
        name: formData.name?.trim() || '',
        phone: formData.phone?.trim() || '',
        email: formData.email?.trim() || '',
        userType: formData.userType || '',
        institution: formData.institution?.trim() || '',
        course: formData.course?.trim() || '',
        checkInDate: formData.checkInDate || '',
        budget: formData.budget || '',
        message: formData.message?.trim() || '',
        source: formData.source || 'hostel-details',
        hostelName: formData.hostelName || '',
        hostelId: hostelId || ''
      }

      await leadAPI.createEnquiry(enquiryData)
      
      // Save user data for future auto-population
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        userType: formData.userType,
        institution: formData.institution,
        course: formData.course,
        budget: formData.budget
      }
      localStorage.setItem('userEnquiryData', JSON.stringify(userData))
      
      setToast({ message: 'Enquiry submitted successfully!', type: 'success' })
      onSuccess?.()
      setFormData({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        userType: formData.userType,
        institution: formData.institution,
        course: formData.course,
        checkInDate: '',
        budget: formData.budget,
        message: '',
        source: source,
        hostelName: hostelName
      })
    } catch (error) {
      let errorMessage = 'Failed to submit enquiry'
      
      if (error.response?.data?.message) {
        const msg = error.response.data.message
        if (msg.includes('message: Path `message` is required')) {
          errorMessage = 'Please add a message to your enquiry'
        } else if (msg.includes('validation failed')) {
          errorMessage = 'Please fill all required fields'
        } else {
          errorMessage = 'Something went wrong'
        }
      }
      
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
          placeholder="Full Name"
        />
      </div>
      
      <div>
        <input
          type="tel"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
          placeholder="Phone Number *"
        />
      </div>
      
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
          placeholder="Email"
        />
      </div>

      <div>
        <Select
          value={formData.userType ? { value: formData.userType, label: formData.userType } : null}
          onChange={(option) => setFormData({ ...formData, userType: option?.value || '' })}
          options={[
            { value: 'Student', label: 'Student' },
            { value: 'Working Professional', label: 'Working Professional' },
            { value: 'Job Seeker', label: 'Job Seeker' }
          ]}
          placeholder="You are a"
          isClearable
          styles={{
            control: (base, state) => ({
              ...base,
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              boxShadow: state.isFocused ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : 'none',
              borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
              padding: '2px',
              fontSize: '14px',
              minHeight: '38px'
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
              color: state.isSelected ? '#1f2937' : '#374151',
              fontSize: '14px'
            }),
            menu: (base) => ({ ...base, borderRadius: '8px', fontSize: '14px' })
          }}
        />
      </div>

      {formData.userType === 'Student' && (
        <>
          <div>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
              placeholder="College/University"
            />
          </div>
          <div>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
              placeholder="Course/Branch"
            />
          </div>
        </>
      )}

      {formData.userType === 'Working Professional' && (
        <>
          <div>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
              placeholder="Company"
            />
          </div>
          <div>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
              placeholder="Job Role"
            />
          </div>
        </>
      )}
      
      <div>
        <input
          type="date"
          name="checkInDate"
          value={formData.checkInDate}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent"
        />
      </div>
      
      <div>
        <Select
          value={formData.budget ? { value: formData.budget, label: formData.budget === '5000-8000' ? '₹5,000 - ₹8,000' : formData.budget === '8000-12000' ? '₹8,000 - ₹12,000' : formData.budget === '12000-15000' ? '₹12,000 - ₹15,000' : '₹15,000+' } : null}
          onChange={(option) => setFormData({ ...formData, budget: option?.value || '' })}
          options={[
            { value: '5000-8000', label: '₹5,000 - ₹8,000' },
            { value: '8000-12000', label: '₹8,000 - ₹12,000' },
            { value: '12000-15000', label: '₹12,000 - ₹15,000' },
            { value: '15000+', label: '₹15,000+' }
          ]}
          placeholder="Budget Range"
          isClearable
          styles={{
            control: (base, state) => ({
              ...base,
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              boxShadow: state.isFocused ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : 'none',
              borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
              padding: '2px',
              fontSize: '14px',
              minHeight: '38px'
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : '#ffffff',
              color: state.isSelected ? '#1f2937' : '#374151',
              fontSize: '14px'
            }),
            menu: (base) => ({ ...base, borderRadius: '8px', fontSize: '14px' })
          }}
        />
      </div>
      
      <div>
        <textarea
          name="message"
          rows="2"
          required
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent resize-none"
          placeholder="Message *"
        />
      </div>
      
      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-custom text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-300 disabled:opacity-50 text-sm"
      >
        {loading ? 'Sending...' : 'Send Enquiry'}
      </button>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </form>
  )
}

export default EnquiryForm