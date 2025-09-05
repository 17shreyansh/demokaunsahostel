import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import { AdminProvider } from './contexts/AdminContext'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Hostels = lazy(() => import('./pages/Hostels'))
const HostelDetails = lazy(() => import('./pages/HostelDetails'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminHostels = lazy(() => import('./pages/AdminHostels'))
const AdminHostelEdit = lazy(() => import('./pages/AdminHostelEdit'))
const AdminNearbyPlaces = lazy(() => import('./pages/AdminNearbyPlaces'))
const AdminLeads = lazy(() => import('./pages/AdminLeads'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AdminPageContent = lazy(() => import('./pages/AdminPageContent'))
const Chatbot = lazy(() => import('./components/Chatbot'))

function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  
  return null
}

function App() {
  return (
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
            
            {/* Admin Routes without Header/Footer */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminProvider>
                  <AdminLayout />
                </AdminProvider>
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="hostels" element={<AdminHostels />} />
              <Route path="hostels/new" element={<AdminHostelEdit />} />
              <Route path="hostels/:id" element={<AdminHostelEdit />} />
              <Route path="nearbyplaces" element={<AdminNearbyPlaces />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="page-content" element={<AdminPageContent />} />
            </Route>
          </Routes>
        </Suspense>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      </div>
    </Router>
  )
}

export default App