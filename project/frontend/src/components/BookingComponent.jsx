import { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BookingComponent = ({ hostel }) => {
  const [showContactModal, setShowContactModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eligibility, setEligibility] = useState(null)
  const { user } = useUser()
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  // Fetch eligibility on mount
  useEffect(() => {
    if (user) {
      axios.get(`${API_URL}/visit-bookings/check-eligibility`, { withCredentials: true })
        .then(({ data }) => setEligibility(data))
        .catch(() => {})
    }
  }, [user, API_URL])

  const handleBookVisit = async () => {
    if (!user) {
      navigate('/user/auth')
      return
    }

    try {
      setLoading(true)

      // Create order - using withCredentials for cookie auth
      const { data } = await axios.post(`${API_URL}/visit-bookings/create-order`, 
        { hostelId: hostel._id },
        { withCredentials: true }
      )

      // If free booking, show success and redirect
      if (data.isFree) {
        alert(`✅ ${data.message}\n\nContact admin for hostel assignment to write reviews.`)
        navigate('/user/profile')
        return
      }

      // Paid booking - Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'Kaunsa College',
          description: `Visit booking for ${hostel.name}`,
          order_id: data.orderId,
          handler: async (response) => {
            try {
              await axios.post(`${API_URL}/visit-bookings/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: data.bookingId
                },
                { withCredentials: true }
              )
              alert('✅ Visit booked successfully! Contact admin for hostel assignment to write reviews.')
              navigate('/user/profile')
            } catch (error) {
              alert('❌ Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || ''
          },
          theme: {
            color: '#F59E0B'
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    // Contact via backend WhatsApp number
    const message = `Hi! I'm interested in ${hostel.name}. Can you please provide more details?`
    const whatsappUrl = `https://wa.me/${phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const closeModal = () => {
    setShowContactModal(false)
  }

  const contactPersonName = hostel.contactInfo?.contactPersonName || 'Hostel Manager'
  const jobTitle = hostel.contactInfo?.jobTitle || 'Property Manager'
  const profileImage = hostel.contactInfo?.profileImage
  const phone = hostel.contactInfo?.phone

  return (
    <>
      {/* Booking Component */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Instant Booking Available</h3>
              <p className="text-green-100 text-sm">Get confirmed booking within 24 hours</p>
            </div>
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Contact Person Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {profileImage ? (
                <img 
                  src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${profileImage}`}
                  alt={contactPersonName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-yellow-custom text-gray-900 w-full h-full flex items-center justify-center font-bold text-lg">
                  {contactPersonName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{contactPersonName}</p>
              <p className="text-sm text-gray-600">{jobTitle}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {eligibility && eligibility.isFree && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-green-800 text-sm font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  FREE Visit! ({eligibility.remainingFreeVisits} remaining)
                </p>
              </div>
            )}
            <button
              onClick={handleBookVisit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {eligibility?.isFree ? 'Book FREE Visit' : `Book Visit - ₹${eligibility?.nextVisitAmount || 299}`}
                  </span>
                </>
              )}
            </button>
            
            <button
              onClick={handleContact}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688"/>
              </svg>
              <span>Contact {contactPersonName.split(' ')[0]}</span>
            </button>
          </div>

          {/* Quick Info */}
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Free consultation • Quick response guaranteed</span>
            </p>
          </div>
        </div>
      </div>


    </>
  )
}

export default BookingComponent