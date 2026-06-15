import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
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
const AdminBlogList = lazy(() => import('./pages/blog/AdminBlogList'))
const AdminBlogEditor = lazy(() => import('./pages/blog/AdminBlogEditor'))
const BlogList = lazy(() => import('./pages/blog/BlogListPage'))
const BlogPost = lazy(() => import('./pages/blog/BlogPostPage'))
const Chatbot = lazy(() => import('./components/Chatbot'))
const HostelManagerAuth = lazy(() => import('./pages/HostelManagerAuth'))
const HostelManagerProtectedRoute = lazy(() => import('./components/HostelManagerProtectedRoute'))
const HostelManagerDashboard = lazy(() => import('./pages/HostelManagerDashboard'))
const HostelManagerKYC = lazy(() => import('./pages/HostelManagerKYC'))
const HostelManagerHostels = lazy(() => import('./pages/HostelManagerHostels'))
const HostelManagerHostelForm = lazy(() => import('./pages/HostelManagerHostelForm'))
const HostelManagerReviews = lazy(() => import('./pages/HostelManagerReviews'))
const AdminHostelManagers = lazy(() => import('./pages/AdminHostelManagers'))
const HostelManagerProfile = lazy(() => import('./pages/HostelManagerProfile'))
const HostelManagerSettings = lazy(() => import('./pages/HostelManagerSettings'))

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
              <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
                <Routes>
                {/* Public Routes with Header/Footer */}
                <Route path="/" element={
                  <>
                    <Header />
                    <Home />
                    <Footer />
                  </>
                } />
                <Route path="/hostels" element={
                  <>
                    <Header />
                    <Hostels />
                    <Footer />
                  </>
                } />
                <Route path="/hostel/:slug" element={
                  <>
                    <Header />
                    <HostelDetails />
                    <Footer />
                  </>
                } />
                <Route path="/about" element={
                  <>
                    <Header />
                    <About />
                    <Footer />
                  </>
                } />
                <Route path="/contact" element={
                  <>
                    <Header />
                    <Contact />
                    <Footer />
                  </>
                } />

                {/* User Auth & Profile Routes */}
                <Route path="/user/auth" element={
                  <>
                    <Header />
                    <UserAuth />
                    <Footer />
                  </>
                } />
                <Route path="/user/profile" element={
                  <>
                    <Header />
                    <UserProfile />
                    <Footer />
                  </>
                } />

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
                  <Route path="nearbyplaces" element={<AdminNearbyPlaces />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="managers" element={<AdminHostelManagers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="page-content" element={<AdminPageContent />} />
                  <Route path="blog" element={<AdminBlogList />} />
                  <Route path="blog/new" element={<AdminBlogEditor />} />
                  <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                </Route>

                {/* Public Blog Routes */}
                <Route path="/blog" element={
                  <>
                    <Header />
                    <BlogList />
                    <Footer />
                  </>
                } />
                <Route path="/blog/:slug" element={
                  <>
                    <Header />
                    <BlogPost />
                    <Footer />
                  </>
                } />

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
              </Routes>
            </Suspense>
            <ScrollToTop />
            <Suspense fallback={null}>
              <Chatbot />
            </Suspense>
          </div>
        </Router>
        </HostelManagerProvider>
      </UserProvider>
    </HelmetProvider>
  )
}

export default App