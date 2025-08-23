import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Hostels from './pages/Hostels'
import HostelDetails from './pages/HostelDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminHostels from './pages/AdminHostels'
import AdminHostelEdit from './pages/AdminHostelEdit'
import AdminNearbyPlaces from './pages/AdminNearbyPlaces'
import AdminLeads from './pages/AdminLeads'
import AdminSettings from './pages/AdminSettings'
import AdminPageContent from './pages/AdminPageContent'

function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  
  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hostels" element={<AdminHostels />} />
            <Route path="hostels/:id" element={<AdminHostelEdit />} />
            <Route path="nearbyplaces" element={<AdminNearbyPlaces />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="page-content" element={<AdminPageContent />} />
          </Route>
        </Routes>
          <ScrollToTop />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App