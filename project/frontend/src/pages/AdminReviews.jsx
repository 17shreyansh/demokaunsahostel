import { useState, useEffect } from 'react'
import { reviewAPI } from '../services/api'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await reviewAPI.getAllAdmin()
      setReviews(response.data.reviews)
    } catch (error) {
      console.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, isApproved) => {
    try {
      await reviewAPI.approve(id, isApproved)
      fetchReviews()
    } catch (error) {
      alert('Failed to update review')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewAPI.deleteAdmin(id)
      fetchReviews()
    } catch (error) {
      alert('Failed to delete review')
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.isApproved
    if (filter === 'approved') return review.isApproved
    return true
  })

  const pendingCount = reviews.filter(r => !r.isApproved).length
  const approvedCount = reviews.filter(r => r.isApproved).length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Review Management</h1>
        <p className="text-gray-600">Approve or reject user reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Reviews</h3>
          <p className="text-3xl font-bold mt-2">{reviews.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Approved</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{approvedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md ${
              filter === 'approved' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        review.isApproved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <div className="flex text-yellow-400">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{review.hostel?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      By: {review.user?.name} ({review.user?.email})
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <div className="flex gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review._id, true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      onClick={() => handleApprove(review._id, false)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReviews
