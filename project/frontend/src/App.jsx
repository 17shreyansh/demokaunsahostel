import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import { AdminProvider } from './contexts/AdminContext'
import { UserProvider } from './contexts/UserContext'
import { HostelManagerProvider } from './contexts/HostelManagerContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Hostels = lazy(() => import('./pages/Hostels'))
const HostelDetails = lazy(() => import('./pages/HostelDetails'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const UserAuth = lazy(() => import('./pages/UserAuth'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminHostels = lazy(() => import('./pages/AdminHostels'))
const AdminHostelEdit = lazy(() => import('./pages/AdminHostelEdit'))
const AdminNearbyPlaces = lazy(() => import('./pages/AdminNearbyPlaces'))
const AdminLeads = lazy(() => import('./pages/AdminLeads'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AdminPageContent = lazy(() => import('./pages/AdminPageContent'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminReviews = lazy(() => import('./pages/AdminReviews'))
const AdminVisitBookings = lazy(() => import('./pages/AdminVisitBookings'))
const AdminAssignments = lazy(() => import('./pages/AdminAssignments'))
const AdminPayments = lazy(() => import('./pages/AdminPayments'))
const AdminBlogList = lazy(() => import('./pages/blog/AdminBlogList'))
const AdminBlogEditor = lazy(() => import('./pages/blog/AdminBlogEditor'))
const AdminFAQ = lazy(() => import('./pages/AdminFAQ'))
const BlogList = lazy(() => import('./pages/blog/BlogListPage'))
const BlogPost = lazy(() => import('./pages/blog/BlogPostPage'))
const HostelManagerAuth = lazy(() => import('./pages/HostelManagerAuth'))
const HostelManagerProtectedRoute = lazy(() => import('./components/HostelManagerProtectedRoute'))
const HostelManagerDashboard = lazy(() => import('./pages/HostelManagerDashboard'))
const HostelManagerKYC = lazy(() => import('./pages/HostelManagerKYC'))
const HostelManagerHostels = lazy(() => import('./pages/HostelManagerHostels'))
const HostelManagerHostelForm = lazy(() => import('./pages/HostelManagerHostelForm'))
const HostelManagerReviews = lazy(() => import('./pages/HostelManagerReviews'))
const HostelManagerPayments = lazy(() => import('./pages/HostelManagerPayments'))
const HostelManagerStudents = lazy(() => import('./pages/HostelManagerStudents'))
const AdminChangeRequests = lazy(() => import('./pages/AdminChangeRequests'))
const AdminHostelManagers = lazy(() => import('./pages/AdminHostelManagers'))
const HostelManagerProfile = lazy(() => import('./pages/HostelManagerProfile'))
const HostelManagerSettings = lazy(() => import('./pages/HostelManagerSettings'))
const HostelManagerChangeRequests = lazy(() => import('./pages/HostelManagerChangeRequests'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <HelmetProvider>
      <UserProvider>
        <HostelManagerProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <ScrollToTop />
              <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
                <Routes>
                {/* ============================================================ */}
                {/* PUBLIC ROUTES — Shared layout with Header/Footer/Transitions  */}
                {/* Header & Footer render ONCE and persist across navigations    */}
                {/* ============================================================ */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/hostels" element={<Hostels />} />
                  <Route path="/hostel/:slug" element={<HostelDetails />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/user/auth" element={<UserAuth />} />
                  <Route path="/user/profile" element={<UserProfile />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Route>

                {/* Admin Routes without Header/Footer */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <ThemeProvider>
                      <AdminProvider>
                        <AdminLayout />
                      </AdminProvider>
                    </ThemeProvider>
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="hostels" element={<AdminHostels />} />
                  <Route path="hostels/new" element={<AdminHostelEdit />} />
                  <Route path="hostels/:id" element={<AdminHostelEdit />} />
                  <Route path="change-requests" element={<AdminChangeRequests />} />
                  <Route path="nearbyplaces" element={<AdminNearbyPlaces />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="managers" element={<AdminHostelManagers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="visit-bookings" element={<AdminVisitBookings />} />
                  <Route path="assignments" element={<AdminAssignments />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="page-content" element={<AdminPageContent />} />
                  <Route path="blog" element={<AdminBlogList />} />
                  <Route path="blog/new" element={<AdminBlogEditor />} />
                  <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                  <Route path="faq" element={<AdminFAQ />} />
                </Route>

                {/* Hostel Manager Routes */}
                <Route path="/hostel-manager/auth" element={<HostelManagerAuth />} />
                <Route path="/hostel-manager/dashboard" element={<HostelManagerProtectedRoute><HostelManagerDashboard /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/profile" element={<HostelManagerProtectedRoute><HostelManagerProfile /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/settings" element={<HostelManagerProtectedRoute><HostelManagerSettings /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/kyc" element={<HostelManagerProtectedRoute><HostelManagerKYC /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/hostels" element={<HostelManagerProtectedRoute><HostelManagerHostels /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/hostels/add" element={<HostelManagerProtectedRoute><HostelManagerHostelForm /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/hostels/edit/:id" element={<HostelManagerProtectedRoute><HostelManagerHostelForm /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/reviews" element={<HostelManagerProtectedRoute><HostelManagerReviews /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/payments" element={<HostelManagerProtectedRoute><HostelManagerPayments /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/students" element={<HostelManagerProtectedRoute><HostelManagerStudents /></HostelManagerProtectedRoute>} />
                <Route path="/hostel-manager/change-requests" element={<HostelManagerProtectedRoute><HostelManagerChangeRequests /></HostelManagerProtectedRoute>} />
              </Routes>
            </Suspense>
          </div>
        </Router>
        </HostelManagerProvider>
      </UserProvider>
    </HelmetProvider>
  )
}

export default App