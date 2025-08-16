import { useState, useEffect } from 'react'
import { leadAPI } from '../services/api'
import Select from 'react-select'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await leadAPI.createEnquiry({ ...formData, hostelId })
      
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
      alert('Failed to submit enquiry. Please try again.')
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
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-custom focus:border-transparent resize-none"
          placeholder="Additional requirements..."
        />
      </div>
      
      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-custom text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-300 disabled:opacity-50 text-sm"
      >
        {loading ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  )
}

export default EnquiryForm