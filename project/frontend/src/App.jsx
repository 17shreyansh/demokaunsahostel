import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
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

// Pages
import Home from './pages/Home'
import Hostels from './pages/Hostels'
import HostelDetails from './pages/HostelDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import UserAuth from './pages/UserAuth'
import UserProfile from './pages/UserProfile'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminHostels from './pages/AdminHostels'
import AdminHostelEdit from './pages/AdminHostelEdit'
import AdminNearbyPlaces from './pages/AdminNearbyPlaces'
import AdminLeads from './pages/AdminLeads'
import AdminSettings from './pages/AdminSettings'
import AdminPageContent from './pages/AdminPageContent'
import AdminUsers from './pages/AdminUsers'
import AdminReviews from './pages/AdminReviews'
import AdminVisitBookings from './pages/AdminVisitBookings'
import AdminAssignments from './pages/AdminAssignments'
import AdminPayments from './pages/AdminPayments'
import AdminBlogList from './pages/blog/AdminBlogList'
import AdminBlogEditor from './pages/blog/AdminBlogEditor'
import AdminFAQ from './pages/AdminFAQ'
import BlogList from './pages/blog/BlogListPage'
import BlogPost from './pages/blog/BlogPostPage'
import HostelManagerAuth from './pages/HostelManagerAuth'
import HostelManagerProtectedRoute from './components/HostelManagerProtectedRoute'
import HostelManagerDashboard from './pages/HostelManagerDashboard'
import HostelManagerKYC from './pages/HostelManagerKYC'
import HostelManagerHostels from './pages/HostelManagerHostels'
import HostelManagerHostelForm from './pages/HostelManagerHostelForm'
import HostelManagerReviews from './pages/HostelManagerReviews'
import HostelManagerPayments from './pages/HostelManagerPayments'
import HostelManagerStudents from './pages/HostelManagerStudents'
import AdminChangeRequests from './pages/AdminChangeRequests'
import AdminHostelManagers from './pages/AdminHostelManagers'
import HostelManagerProfile from './pages/HostelManagerProfile'
import HostelManagerSettings from './pages/HostelManagerSettings'
import HostelManagerChangeRequests from './pages/HostelManagerChangeRequests'

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
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <ScrollToTop />
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
                <Route path="/hostel-manager" element={<HostelManagerProvider><Outlet /></HostelManagerProvider>}>
                  <Route path="auth" element={<HostelManagerAuth />} />
                  <Route path="dashboard" element={<HostelManagerProtectedRoute><HostelManagerDashboard /></HostelManagerProtectedRoute>} />
                  <Route path="profile" element={<HostelManagerProtectedRoute><HostelManagerProfile /></HostelManagerProtectedRoute>} />
                  <Route path="settings" element={<HostelManagerProtectedRoute><HostelManagerSettings /></HostelManagerProtectedRoute>} />
                  <Route path="kyc" element={<HostelManagerProtectedRoute><HostelManagerKYC /></HostelManagerProtectedRoute>} />
                  <Route path="hostels" element={<HostelManagerProtectedRoute><HostelManagerHostels /></HostelManagerProtectedRoute>} />
                  <Route path="hostels/add" element={<HostelManagerProtectedRoute><HostelManagerHostelForm /></HostelManagerProtectedRoute>} />
                  <Route path="hostels/edit/:id" element={<HostelManagerProtectedRoute><HostelManagerHostelForm /></HostelManagerProtectedRoute>} />
                  <Route path="reviews" element={<HostelManagerProtectedRoute><HostelManagerReviews /></HostelManagerProtectedRoute>} />
                  <Route path="payments" element={<HostelManagerProtectedRoute><HostelManagerPayments /></HostelManagerProtectedRoute>} />
                  <Route path="students" element={<HostelManagerProtectedRoute><HostelManagerStudents /></HostelManagerProtectedRoute>} />
                  <Route path="change-requests" element={<HostelManagerProtectedRoute><HostelManagerChangeRequests /></HostelManagerProtectedRoute>} />
                </Route>
              </Routes>
          </div>
        </Router>
      </UserProvider>
    </HelmetProvider>
  )
}

export default App