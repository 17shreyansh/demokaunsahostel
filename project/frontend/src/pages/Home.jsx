import { useState, useEffect } from 'react';
import { hostelAPI, pageAPI } from '../services/api';
import { stateManager } from '../utils/stateManager';
import HeroSection from '../components/home/HeroSection';
import HowItWorks from '../components/home/SearchSection';
import FeaturedHostels from '../components/home/FeaturedHostels';
import ServicesSection from '../components/home/ServicesSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import OurPartners from '../components/home/OurPartners';
import WhyTrustUs from '../components/home/WhyTrustUs';
import BlogsSection from '../components/home/BlogsSection';
import FAQSection from '../components/home/FAQSection';
import TalkToUs from '../components/home/TalkToUs';

const Home = () => {
  const [hostels, setHostels] = useState([]);
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fire all requests concurrently to destroy the network waterfall
        const hostelsPromise = hostelAPI.getFeatured({ signal });
        const contentPromise = pageAPI.getPageContent('home', { signal });

        // Await critical data first to paint Hero section immediately
        const hostelsResponse = await hostelsPromise;
        if (!signal.aborted) {
          setHostels(hostelsResponse.data || []);
          setLoading(false);
        }

        // Await non-critical content
        const contentResponse = await contentPromise;
        if (!signal.aborted) {
          setPageContent(contentResponse.data.content || {});
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching data:', error);
          if (!signal.aborted) {
            setHostels([]);
            setPageContent({});
            setLoading(false);
          }
        }
      }
    };

    fetchData();

    // Preserve existing pub/sub subscription
    const unsubscribe = stateManager.subscribe('homepage', fetchData);

    return () => {
      abortController.abort(); // Cancel pending fetches on unmount
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <main className="relative">
      {/* Fixed Static Background - GPU Optimized */}
      <div className="fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div
          className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full opacity-20 blur-3xl"
        />
        <div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"
        />
        <div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full opacity-10 blur-3xl transform -translate-x-1/2 -translate-y-1/2"
        />
        <div
          className="absolute top-32 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-2xl opacity-30 blur-sm"
        />
        <div
          className="absolute bottom-40 right-1/4 w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-40 blur-sm"
        />
        {[...Array(6)].map((_, i) => (
          <div
            key={`floating-dot-${i}`}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`
            }}
          />
        ))}
      </div>

      <HeroSection hostels={hostels} loading={loading} content={pageContent.hero} />
      {/* <HowItWorks content={pageContent.howItWorks} /> */}
      <OurPartners />
      <FeaturedHostels hostels={hostels} loading={loading} />
      <WhyTrustUs />
      <TestimonialsSection content={pageContent.testimonials} />
      <BlogsSection />
      <FAQSection />
      <TalkToUs />
    </main>
  );
};

export default Home;