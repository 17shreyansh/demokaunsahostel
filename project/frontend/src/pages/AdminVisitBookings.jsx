import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Eye, Loader2, CalendarX, 
  MapPin, CreditCard, User, Building2, 
  Receipt, Clock, X 
} from 'lucide-react';

const AdminVisitBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null); // Added state for Modal
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/visit-bookings/admin/all`, {
        withCredentials: true,
        params: { status: filter !== 'all' ? filter : undefined }
      });
      setBookings(data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      alert('Failed to fetch bookings. Please login as admin.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, visitStatus) => {
    try {
      await axios.patch(`${API_URL}/visit-bookings/admin/${id}`,
        { visitStatus },
        { withCredentials: true }
      );
      // Optional: replace alert with a modern toast if you have one integrated
      alert('Booking status updated successfully!');
      fetchBookings();
      
      // Update local modal state if it's currently open
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => ({ ...prev, visitStatus }));
      }
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update booking status');
    }
  };

  // UI Helpers
  const getPaymentBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      cancelled: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    };
    return `inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset capitalize ${styles[status] || styles.pending}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'scheduled': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Visit Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track scheduled property visits and their payment statuses.</p>
      </div>

      {/* Sleek Segmented Control Filters */}
      <div className="flex mb-6 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
        <div className="inline-flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/60 flex-shrink-0">
          {['all', 'completed', 'pending', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none capitalize ${
                filter === status 
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <CalendarX size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900">No bookings found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no visit bookings matching the '{filter}' status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">User / Lead</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Property Details</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Payment</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Visit Status</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight">Booking Date</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-900 tracking-tight">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/80 transition-colors group">
                    
                    {/* User Info Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm shadow-sm flex-shrink-0 mt-0.5">
                          {booking.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{booking.user?.name}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate" title={booking.user?.email}>{booking.user?.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">{booking.user?.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Hostel Details Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 truncate">{booking.hostel?.name}</span>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-1 min-w-0">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate">{booking.hostel?.location}</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Payment Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-gray-400" />
                          ₹{Number(booking.amount || 0).toLocaleString()}
                        </span>
                        <span className={getPaymentBadge(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </td>

                    {/* Interactive Visit Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <select
                          value={booking.visitStatus}
                          onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                          className={`appearance-none text-xs font-semibold rounded-md border pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors cursor-pointer capitalize ${getStatusColor(booking.visitStatus)}`}
                        >
                          <option value="pending" className="text-gray-900 bg-white">Pending</option>
                          <option value="scheduled" className="text-gray-900 bg-white">Scheduled</option>
                          <option value="completed" className="text-gray-900 bg-white">Completed</option>
                          <option value="cancelled" className="text-gray-900 bg-white">Cancelled</option>
                        </select>
                        {/* Custom Dropdown Arrow to override browser default */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </td>

                    {/* Booking Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 gap-1.5 font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(booking.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 bg-gray-900/40  flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 animate-in zoom-in-95 duration-200 custom-scrollbar" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">Booking Details</h3>
                <p className="text-gray-500 text-sm mt-1 font-mono">ID: {selectedBooking._id}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              
              {/* User/Lead Information Section */}
              <section>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  <User size={16} className="text-blue-500" /> Lead Information
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Full Name</dt>
                    <dd className="text-sm font-semibold text-gray-900">{selectedBooking.user?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Email Address</dt>
                    <dd className="text-sm font-semibold text-gray-900 break-all">{selectedBooking.user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Phone Number</dt>
                    <dd className="text-sm font-semibold text-gray-900 font-mono">{selectedBooking.user?.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">User ID</dt>
                    <dd className="text-sm font-semibold text-gray-900 font-mono truncate" title={selectedBooking.user?._id}>
                      {selectedBooking.user?._id}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Property Details Section */}
              <section>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  <Building2 size={16} className="text-purple-500" /> Property Details
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                  <div className="col-span-1 sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 mb-1">Property Name</dt>
                    <dd className="text-sm font-semibold text-gray-900">{selectedBooking.hostel?.name}</dd>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 mb-1">Location</dt>
                    <dd className="text-sm font-semibold text-gray-900">{selectedBooking.hostel?.location}</dd>
                  </div>
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-200">
                    <dt className="text-xs font-medium text-gray-500 mb-1">Hostel Reference ID</dt>
                    <dd className="text-sm font-semibold text-gray-900 font-mono text-gray-500">{selectedBooking.hostel?._id}</dd>
                  </div>
                </dl>
              </section>

              {/* Financials & Status Section */}
              <section>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  <Receipt size={16} className="text-emerald-500" /> Financials & Status
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Amount Paid</dt>
                    <dd className="text-lg font-bold text-gray-900 tracking-tight">₹{Number(selectedBooking.amount || 0).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Payment Status</dt>
                    <dd className="mt-1">{<span className={getPaymentBadge(selectedBooking.paymentStatus)}>{selectedBooking.paymentStatus}</span>}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-1">Booking Date</dt>
                    <dd className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400"/>
                      {new Date(selectedBooking.createdAt).toLocaleString(undefined, { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-2">Current Visit Status</dt>
                    <dd>
                      <select
                        value={selectedBooking.visitStatus}
                        onChange={(e) => updateBookingStatus(selectedBooking._id, e.target.value)}
                        className={`appearance-none text-xs font-semibold rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors cursor-pointer capitalize w-full sm:w-auto ${getStatusColor(selectedBooking.visitStatus)}`}
                      >
                        <option value="pending" className="text-gray-900 bg-white">Pending</option>
                        <option value="scheduled" className="text-gray-900 bg-white">Scheduled</option>
                        <option value="completed" className="text-gray-900 bg-white">Completed</option>
                        <option value="cancelled" className="text-gray-900 bg-white">Cancelled</option>
                      </select>
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitBookings;