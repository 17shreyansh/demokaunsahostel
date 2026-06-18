import { useState, useEffect, memo } from 'react';
import { hostelAPI, pageAPI } from '../services/api';
import { stateManager } from '../utils/stateManager';
import HeroSection from '../components/home/HeroSection';
import SearchSection from '../components/home/SearchSection';
import FeaturedHostels from '../components/home/FeaturedHostels';
import ServicesSection from '../components/home/ServicesSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import OurPartners from '../components/home/OurPartners';
import WhyTrustUs from '../components/home/WhyTrustUs';
import BlogsSection from '../components/home/BlogsSection';
import FAQSection from '../components/home/FAQSection';
import TalkToUs from '../components/home/TalkToUs';

// Memoized components
const MemoizedHeroSection = memo(HeroSection);
const MemoizedSearchSection = memo(SearchSection);
const MemoizedFeaturedHostels = memo(FeaturedHostels);
const MemoizedServicesSection = memo(ServicesSection);
const MemoizedTestimonialsSection = memo(TestimonialsSection);
const MemoizedOurPartners = memo(OurPartners);
const MemoizedWhyTrustUs = memo(WhyTrustUs);
const MemoizedBlogsSection = memo(BlogsSection);
const MemoizedFAQSection = memo(FAQSection);
const MemoizedTalkToUs = memo(TalkToUs);

// Injected Hardware-Accelerated CSS Animations
// Replaces expensive Framer Motion JS tweens with zero-cost GPU compositing
const backgroundStyles = `
  @keyframes blob1 {
    0%, 100% { transform: translate3d(0px, 0px, 0) scale(1); }
    50% { transform: translate3d(30px, -20px, 0) scale(1.2); }
  }
  @keyframes blob2 {
    0%, 100% { transform: translate3d(0px, 0px, 0) scale(1); }
    50% { transform: translate3d(-40px, 30px, 0) scale(1.1); }
  }
  @keyframes blobRotate {
    0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
    50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); }
    100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
  }
  @keyframes blob3 {
    0%, 100% { transform: translate3d(0px, 0px, 0) rotate(0deg); }
    50% { transform: translate3d(0px, -20px, 0) rotate(180deg); }
  }
  @keyframes blob4 {
    0%, 100% { transform: translate3d(0px, 0px, 0) scale(1); }
    50% { transform: translate3d(0px, 25px, 0) scale(1.2); }
  }
  @keyframes floatingDot {
    0%, 100% { transform: translate3d(0px, 0px, 0) scale(1); opacity: 0.3; }
    50% { transform: translate3d(0px, -10px, 0) scale(1.5); opacity: 0.7; }
  }
  .gpu-layer {
    will-change: transform, opacity;
    backface-visibility: hidden;
  }
`;

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
      <style>{backgroundStyles}</style>

      {/* Fixed GPU-Accelerated Background */}
      <div className="fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div 
          className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full opacity-20 blur-3xl gpu-layer"
          style={{ animation: 'blob1 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl gpu-layer"
          style={{ animation: 'blob2 10s ease-in-out infinite 2s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full opacity-10 blur-3xl gpu-layer"
          style={{ animation: 'blobRotate 20s linear infinite' }}
        />
        <div 
          className="absolute top-32 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-2xl opacity-30 blur-sm gpu-layer"
          style={{ animation: 'blob3 6s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-40 right-1/4 w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-40 blur-sm gpu-layer"
          style={{ animation: 'blob4 4s ease-in-out infinite 1s' }}
        />
        {[...Array(6)].map((_, i) => (
          <div
            key={`floating-dot-${i}`}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full gpu-layer"
            style={{ 
              left: `${20 + i * 15}%`, 
              top: `${30 + (i % 3) * 20}%`,
              animation: `floatingDot ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`
            }}
          />
        ))}
      </div>
      
      <MemoizedHeroSection hostels={hostels} loading={loading} content={pageContent.hero} />
      <MemoizedSearchSection content={pageContent.search} />
      <MemoizedOurPartners />
      <MemoizedFeaturedHostels hostels={hostels} loading={loading} />
      <MemoizedWhyTrustUs />
      <MemoizedTestimonialsSection content={pageContent.testimonials} />
      <MemoizedBlogsSection />
      <MemoizedFAQSection />
      <MemoizedTalkToUs />
    </main>
  );
};

export default Home;